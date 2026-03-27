/**
 * pipeline/executor.ts — Bridges pipeline phases to agent execution.
 *
 * The pipeline service manages state transitions (advance, completePhase,
 * retry), but has no code that actually spawns agents. This executor fills
 * that gap.
 *
 * For each ready phase it:
 *   1. Resolves the agent via the template's agentId or agentRole
 *   2. Builds a task prompt (with skill plan injection)
 *   3. Calls the adapter directly (bypassing full heartbeat overhead)
 *   4. Captures stdout as agent output
 *   5. Feeds output to completePhase() for skill gate + QA verification
 *   6. Calls advanceRun() to move to the next phase(s)
 */

import { eq, and } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import { agents, pipelinePhases, pipelineRuns } from "@paperclipai/db";
import { pipelineService } from "./service.js";
import { getServerAdapter } from "../../adapters/index.js";
import type { AdapterExecutionContext, AdapterAgent } from "../../adapters/types.js";

// Minimal logger for executor
const log = {
  info: (msg: string, data?: Record<string, unknown>) =>
    console.log(`[pipeline-executor] ${msg}`, data ? JSON.stringify(data) : ""),
  error: (msg: string, data?: Record<string, unknown>) =>
    console.error(`[pipeline-executor] ${msg}`, data ? JSON.stringify(data) : ""),
};

/**
 * Parse stream-json stdout from Claude to extract the actual agent text.
 * Stream-json is one JSON object per line. We look for:
 *   {"type":"result","result":"..."} — the final result text
 *   {"type":"assistant","message":{"content":[{"type":"text","text":"..."}]}} — assistant text blocks
 * Falls back to raw output if parsing finds nothing.
 */
function extractAgentText(rawOutput: string): string {
  if (!rawOutput) return "";

  const assistantTexts: string[] = [];
  let resultText = "";

  for (const rawLine of rawOutput.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    let event: Record<string, unknown>;
    try {
      event = JSON.parse(line);
    } catch {
      // Not JSON — might be plain text output, accumulate it
      continue;
    }

    if (typeof event !== "object" || event === null) continue;

    const type = String(event.type ?? "");

    if (type === "result" && typeof event.result === "string") {
      resultText = event.result;
      continue;
    }

    if (type === "assistant") {
      const message = event.message as Record<string, unknown> | undefined;
      const content = Array.isArray(message?.content) ? message.content : [];
      for (const entry of content) {
        if (typeof entry === "object" && entry !== null && !Array.isArray(entry)) {
          const block = entry as Record<string, unknown>;
          if (block.type === "text" && typeof block.text === "string" && block.text) {
            assistantTexts.push(block.text);
          }
        }
      }
      continue;
    }
  }

  // Prefer result text (final summary), fall back to concatenated assistant texts
  if (resultText) return resultText;
  if (assistantTexts.length > 0) return assistantTexts.join("\n\n");

  // Nothing parsed — return raw output (might not be stream-json)
  return rawOutput;
}

interface PhaseExecutionResult {
  phaseKey: string;
  phaseId: string;
  agentId: string;
  passed: boolean;
  retry: boolean;
  error?: string;
  output?: string;
}

interface RunExecutionResult {
  runId: string;
  status: "completed" | "failed" | "partial";
  phasesExecuted: PhaseExecutionResult[];
  error?: string;
}

export function pipelineExecutor(db: Db) {
  const svc = pipelineService(db);

  /**
   * Execute a single pipeline phase by calling the agent's adapter directly.
   */
  async function executePhase(
    phaseId: string,
    companyId: string,
    agentId: string,
    taskPrompt: string,
  ): Promise<{ output: string; exitCode: number | null; error?: string }> {
    // Load the agent
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const adapterType = agent.adapterType ?? "claude_local";
    const adapter = getServerAdapter(adapterType);
    const adapterConfig = (agent.adapterConfig as Record<string, unknown>) ?? {};

    // Collect stdout
    let stdout = "";
    const onLog = async (stream: "stdout" | "stderr", chunk: string) => {
      if (stream === "stdout") stdout += chunk;
      // Also log stderr for debugging
      if (stream === "stderr" && chunk.trim()) {
        log.info(`[${agent.name}] stderr: ${chunk.trim()}`);
      }
    };

    // Build adapter agent
    const adapterAgent: AdapterAgent = {
      id: agent.id,
      companyId: agent.companyId,
      name: agent.name,
      adapterType: agent.adapterType,
      adapterConfig: agent.adapterConfig,
    };

    // Build config: merge adapter config with pipeline-specific overrides
    // Use a simple template that just outputs the pipeline task from context
    const config: Record<string, unknown> = {
      ...adapterConfig,
      promptTemplate: "{{context.pipelineTask}}",
      // Limit turns for pipeline phases — prevent runaway
      maxTurnsPerRun: adapterConfig.maxTurnsPerRun ?? 50,
      // Skip permissions for pipeline execution
      dangerouslySkipPermissions: true,
    };

    // Build minimal runtime (no session resumption for pipeline phases)
    const runtime = {
      sessionId: null,
      sessionParams: null,
      sessionDisplayId: null,
      taskKey: `pipeline-phase-${phaseId}`,
    };

    // Build context — pipelineTask is referenced by the prompt template
    const context: Record<string, unknown> = {
      source: "pipeline",
      phaseId,
      companyId,
      pipelineTask: taskPrompt,
    };

    const executionContext: AdapterExecutionContext = {
      runId: phaseId, // Use phase ID as the run ID for the adapter
      agent: adapterAgent,
      runtime,
      config,
      context,
      onLog,
    };

    log.info(`Executing phase via ${adapterType} adapter`, {
      phaseId,
      agentName: agent.name,
      promptLength: taskPrompt.length,
    });

    try {
      const result = await adapter.execute(executionContext);

      if (result.timedOut) {
        return {
          output: stdout,
          exitCode: result.exitCode ?? -1,
          error: "Phase execution timed out",
        };
      }

      if (result.errorMessage) {
        return {
          output: stdout,
          exitCode: result.exitCode ?? 1,
          error: result.errorMessage,
        };
      }

      return {
        output: stdout,
        exitCode: result.exitCode ?? 0,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        output: stdout,
        exitCode: 1,
        error: `Adapter execution failed: ${msg}`,
      };
    }
  }

  /**
   * Execute a full pipeline run from start to completion.
   * Advances through phases sequentially, executing each one via the adapter.
   */
  async function executeRun(runId: string): Promise<RunExecutionResult> {
    const results: PhaseExecutionResult[] = [];

    log.info("Starting pipeline execution", { runId });

    // Generate and persist the dynamic skill plan before executing any phases
    try {
      const skillResult = await svc.planSkills(runId);
      log.info("Skill plan generated", {
        runId,
        signals: skillResult.matchedSignals,
        required: skillResult.stats.totalRequired,
        recommended: skillResult.stats.totalRecommended,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`Skill planning failed (continuing without): ${msg}`, { runId });
    }

    // First, advance to get the initial ready phases
    let readyKeys = await svc.advanceRun(runId);

    while (readyKeys && readyKeys.length > 0) {
      log.info(`Ready phases: ${readyKeys.join(", ")}`, { runId });

      // Execute each ready phase (could be parallel, but doing sequential for now)
      for (const phaseKey of readyKeys) {
        const run = await svc.getRunWithPhases(runId);
        if (!run) {
          return { runId, status: "failed", phasesExecuted: results, error: "Run not found" };
        }

        // Find the running phase row for this key
        const phase = run.phases.find(
          (p: { phaseKey: string; status: string }) =>
            p.phaseKey === phaseKey && p.status === "running",
        );
        if (!phase) {
          log.error(`No running phase found for key ${phaseKey}`, { runId });
          continue;
        }

        // Get the template to find phase definition
        const template = await svc.getTemplate(run.templateId);
        if (!template) {
          return { runId, status: "failed", phasesExecuted: results, error: "Template not found" };
        }

        const phaseDefs = template.phases as Array<{
          key: string;
          name: string;
          agentRole: string;
          agentId?: string;
          dependsOn: string[];
          skills: { required: string[]; recommended: string[] };
          qaThreshold?: number;
        }>;
        const phaseDef = phaseDefs.find((d) => d.key === phaseKey);
        if (!phaseDef) {
          log.error(`No phase definition found for key ${phaseKey}`, { runId });
          continue;
        }

        // Resolve the agent
        const agentId = await svc.resolveAgentForPhase(run.companyId, phaseDef as never);
        if (!agentId) {
          log.error(`Could not resolve agent for phase ${phaseKey} (role: ${phaseDef.agentRole})`, { runId });

          // Mark phase as failed
          await svc.completePhase(
            phase.id,
            `ERROR: No agent found for role "${phaseDef.agentRole}"`,
          );
          results.push({
            phaseKey,
            phaseId: phase.id,
            agentId: "none",
            passed: false,
            retry: false,
            error: `No agent found for role "${phaseDef.agentRole}"`,
          });
          continue;
        }

        // Build the task prompt
        const taskPrompt = await buildPhaseTaskPrompt(run, phase, phaseDef);

        // Update phase with agent ID
        await db
          .update(pipelinePhases)
          .set({ agentId, updatedAt: new Date() })
          .where(eq(pipelinePhases.id, phase.id));

        log.info(`Executing phase "${phaseKey}" with agent ${agentId}`, { runId });

        // Execute the phase
        const execResult = await executePhase(phase.id, run.companyId, agentId, taskPrompt);

        log.info(`Phase "${phaseKey}" completed`, {
          runId,
          exitCode: execResult.exitCode,
          outputLength: execResult.output.length,
          error: execResult.error,
        });

        // Parse stream-json output to extract agent result text
        const agentOutput = extractAgentText(execResult.output) || execResult.error || "No output captured";
        const completion = await svc.completePhase(phase.id, agentOutput);

        results.push({
          phaseKey,
          phaseId: phase.id,
          agentId,
          passed: completion.passed,
          retry: completion.retry,
          error: execResult.error,
          output: agentOutput.substring(0, 500), // truncated for logging
        });

        // If retry is needed, the next advanceRun will pick up the retry phase
        if (completion.retry) {
          log.info(`Phase "${phaseKey}" needs retry`, { runId });
        }
      }

      // Advance to next phase(s)
      readyKeys = await svc.advanceRun(runId);
    }

    // Check final run status
    const finalRun = await svc.getRun(runId);
    const status = finalRun?.status === "completed"
      ? "completed"
      : finalRun?.status === "failed"
        ? "failed"
        : "partial";

    log.info(`Pipeline execution finished: ${status}`, { runId, phasesExecuted: results.length });

    return { runId, status, phasesExecuted: results };
  }

  /**
   * Build the task prompt for a pipeline phase.
   * Combines the input context, skill plan, and phase-specific instructions.
   * For reflector phases (key starts with "reflect-"), injects the dependency
   * phase output and scoring instructions.
   */
  async function buildPhaseTaskPrompt(
    run: Record<string, unknown>,
    phase: Record<string, unknown>,
    phaseDef: {
      key: string;
      name: string;
      agentRole: string;
      dependsOn?: string[];
      qaThreshold?: number;
    },
  ): Promise<string> {
    // Use existing task prompt if set (e.g., retry with enhanced instructions)
    if (phase.taskPrompt && typeof phase.taskPrompt === "string") {
      return phase.taskPrompt;
    }

    const inputContext = (run.inputContext as Record<string, string>) ?? {};
    const runId = run.id as string;
    const isReflector = phaseDef.key.startsWith("reflect-");

    // Get skill prompt section
    const skillPrompt = await svc.getSkillPromptForPhase(runId, phaseDef.key);

    // Build the task prompt
    const sections: string[] = [
      `# Pipeline Phase: ${phaseDef.name}`,
      ``,
      `You are executing phase "${phaseDef.key}" of a pipeline run.`,
      `Your role: ${phaseDef.agentRole}`,
      ``,
    ];

    // Add input context
    if (inputContext.specContent) {
      sections.push(`## Spec`, ``, inputContext.specContent, ``);
    }
    if (inputContext.ideaContent) {
      sections.push(`## Idea`, ``, inputContext.ideaContent, ``);
    }
    if (inputContext.brandContent) {
      sections.push(`## Brand Context`, ``, inputContext.brandContent, ``);
    }
    if (inputContext.task) {
      sections.push(`## Task`, ``, inputContext.task, ``);
    }

    // For reflector phases, inject dependency outputs and scoring instructions
    if (isReflector && phaseDef.dependsOn && phaseDef.dependsOn.length > 0) {
      const depOutputs = await getDependencyOutputs(runId, phaseDef.dependsOn);
      if (depOutputs.length > 0) {
        sections.push(`## Content to Review`, ``);
        for (const dep of depOutputs) {
          sections.push(
            `### Output from phase: ${dep.phaseKey}`,
            ``,
            dep.output,
            ``,
          );
        }
      }

      const qaThreshold = phaseDef.qaThreshold ?? 60;
      const reviewType = phaseDef.key.includes("copy")
        ? "copy and content quality"
        : phaseDef.key.includes("code")
          ? "code quality, correctness, and best practices"
          : "overall project coherence and completeness";

      sections.push(
        `## Review Instructions`,
        ``,
        `You are a quality reviewer. Your job is to evaluate the output above for ${reviewType}.`,
        ``,
        `You MUST produce a scored review. Score each category from 0-100 and provide a total.`,
        `The QA threshold is ${qaThreshold}/100 — the phase passes only if the total score meets this threshold.`,
        ``,
        `Output your scores in this exact markdown table format:`,
        ``,
        `| Category | Score |`,
        `|----------|-------|`,
        `| Clarity | 85 |`,
        `| Accuracy | 90 |`,
        `| Completeness | 75 |`,
        `| ... | ... |`,
        ``,
        `**Total: XX/100**`,
        ``,
        `After the scores, provide specific feedback on what could be improved.`,
        ``,
      );
    }

    // Add skill plan
    if (skillPrompt) {
      sections.push(`## Required Skills`, ``, skillPrompt, ``);
    }

    // Add skill tracking instructions
    sections.push(
      `## Skill Tracking`,
      ``,
      `Before starting work, output a SKILLS_PLANNED section listing which skills you will use.`,
      `After completing work, output a SKILLS_USED section listing which skills you actually used.`,
      ``,
      `Format:`,
      ``,
      `SKILLS_PLANNED:`,
      `- [x] skill-name — reason for using this skill`,
      `- [ ] skill-name — not applicable because...`,
      ``,
      `SKILLS_USED:`,
      `- [x] skill-name — how you used it`,
      `- [ ] skill-name — why you skipped it`,
      ``,
      `## Completion`,
      ``,
      `When you have completed your work, output a summary of what you accomplished.`,
      ``,
    );

    return sections.join("\n");
  }

  /**
   * Fetch the output from completed dependency phases.
   * Used to feed previous phase output into reflector/reviewer phases.
   */
  async function getDependencyOutputs(
    runId: string,
    dependsOn: string[],
  ): Promise<Array<{ phaseKey: string; output: string }>> {
    const runData = await svc.getRunWithPhases(runId);
    if (!runData) return [];

    const results: Array<{ phaseKey: string; output: string }> = [];
    for (const depKey of dependsOn) {
      // Find the latest passed attempt for this dependency
      const depPhase = runData.phases
        .filter((p: { phaseKey: string; status: string }) =>
          p.phaseKey === depKey && p.status === "passed",
        )
        .sort((a: { attempt: number }, b: { attempt: number }) =>
          b.attempt - a.attempt,
        )[0];

      if (depPhase?.agentOutput) {
        // Truncate very long outputs to avoid blowing up context
        const output = typeof depPhase.agentOutput === "string"
          ? depPhase.agentOutput.substring(0, 15000)
          : String(depPhase.agentOutput).substring(0, 15000);
        results.push({ phaseKey: depKey, output });
      }
    }
    return results;
  }

  return {
    executeRun,
    executePhase,
  };
}