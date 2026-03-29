/**
 * pipeline.ts — Pipeline execution service.
 *
 * Ported from Shaydee V3 pipeline.js. Drives the phase sequence for
 * multi-agent pipeline runs. The server (not agents) holds execution
 * state, runs skill gates, and decides retry/proceed.
 *
 * Integrates with heartbeat's executeRun via the `invoke` method
 * to trigger agent work, then verifies output deterministically.
 */

import { eq, and, desc, asc } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import {
  pipelineTemplates,
  pipelineRuns,
  pipelinePhases,
  agents,
  issues,
} from "@paperclipai/db";
import { issueService } from "../issues.js";
import { agentTrainerService } from "../agent-trainer.js";

// PipelinePhaseDefinition is the JSONB shape stored in template.phases
// Re-declared here to avoid deep-path import into @paperclipai/db internals.
interface PipelinePhaseDefinition {
  key: string;
  name: string;
  agentRole: string;
  agentId?: string;
  dependsOn: string[];
  parallel?: boolean;
  skills: { required: string[]; recommended: string[] };
  qaThreshold?: number;
  maxRetries?: number;
  timeoutMs?: number;
  onComplete?: {
    createIssues?: boolean;
    issueDefaults?: {
      priority?: string;
      assigneeAgentRole?: string;
      assigneeAgentId?: string;
      titlePrefix?: string;
    };
    issueOnScoreBelow?: number;
  };
}
import { verifySkillGate, buildSkillGateRetryTask, parseUsedSkills, getMandatorySkills } from "./skill-gate.js";
import { generateSkillPlan, formatSkillPromptSection } from "./skill-planner.js";
import {
  parseReflectorScores,
  detectPatterns,
  adjustThresholds,
  type EvalRunEntry,
} from "./eval.js";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CreateTemplateInput {
  slug: string;
  name: string;
  description?: string;
  phases: PipelinePhaseDefinition[];
  signalConfig?: Record<string, unknown>;
  defaultQaThreshold?: number;
  defaultMaxRetries?: number;
}

export interface StartRunInput {
  templateId: string;
  name?: string;
  inputContext?: Record<string, unknown>;
  triggeredByAgentId?: string;
  triggeredByUserId?: string;
  triggerSource?: string;
}

type RunStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
type PhaseStatus = "pending" | "running" | "passed" | "failed" | "skipped" | "cancelled";

// ── Service ──────────────────────────────────────────────────────────────────

export function pipelineService(db: Db) {

  // ── Template CRUD ────────────────────────────────────────────────────────

  async function createTemplate(companyId: string, input: CreateTemplateInput) {
    const [template] = await db
      .insert(pipelineTemplates)
      .values({
        companyId,
        slug: input.slug,
        name: input.name,
        description: input.description ?? null,
        phases: input.phases,
        signalConfig: input.signalConfig ?? null,
        defaultQaThreshold: input.defaultQaThreshold ?? 80,
        defaultMaxRetries: input.defaultMaxRetries ?? 1,
      })
      .returning();
    return template;
  }

  async function getTemplate(templateId: string) {
    const [template] = await db
      .select()
      .from(pipelineTemplates)
      .where(eq(pipelineTemplates.id, templateId))
      .limit(1);
    return template ?? null;
  }

  async function listTemplates(companyId: string) {
    return db
      .select()
      .from(pipelineTemplates)
      .where(
        and(
          eq(pipelineTemplates.companyId, companyId),
          eq(pipelineTemplates.status, "active"),
        ),
      )
      .orderBy(desc(pipelineTemplates.createdAt));
  }

  async function archiveTemplate(templateId: string) {
    const [updated] = await db
      .update(pipelineTemplates)
      .set({
        status: "archived",
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pipelineTemplates.id, templateId))
      .returning();
    return updated ?? null;
  }

  // ── Run Management ───────────────────────────────────────────────────────

  async function startRun(companyId: string, input: StartRunInput) {
    const template = await getTemplate(input.templateId);
    if (!template) throw new Error("Template not found");
    if (template.companyId !== companyId) throw new Error("Template does not belong to this company");

    const [run] = await db
      .insert(pipelineRuns)
      .values({
        companyId,
        templateId: input.templateId,
        name: input.name ?? null,
        status: "pending" as RunStatus,
        inputContext: input.inputContext ?? {},
        triggeredByAgentId: input.triggeredByAgentId ?? null,
        triggeredByUserId: input.triggeredByUserId ?? null,
        triggerSource: input.triggerSource ?? "manual",
      })
      .returning();

    // Pre-create phase rows for all template phases
    const phaseDefs = template.phases as PipelinePhaseDefinition[];
    if (phaseDefs.length > 0) {
      await db.insert(pipelinePhases).values(
        phaseDefs.map((phase) => ({
          companyId,
          runId: run.id,
          phaseKey: phase.key,
          phaseName: phase.name,
          status: "pending" as PhaseStatus,
          qaThreshold: phase.qaThreshold ?? template.defaultQaThreshold,
          requiredSkills: phase.skills.required,
        })),
      );
    }

    return run;
  }

  async function getRun(runId: string) {
    const [run] = await db
      .select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.id, runId))
      .limit(1);
    return run ?? null;
  }

  async function listRuns(companyId: string, limit = 50) {
    return db
      .select()
      .from(pipelineRuns)
      .where(eq(pipelineRuns.companyId, companyId))
      .orderBy(desc(pipelineRuns.createdAt))
      .limit(limit);
  }

  async function getRunWithPhases(runId: string) {
    const run = await getRun(runId);
    if (!run) return null;

    const phases = await db
      .select()
      .from(pipelinePhases)
      .where(eq(pipelinePhases.runId, runId))
      .orderBy(asc(pipelinePhases.createdAt));

    return { ...run, phases };
  }

  async function cancelRun(runId: string) {
    const run = await getRun(runId);
    if (!run) return null;
    if (run.status === "completed" || run.status === "failed" || run.status === "cancelled") {
      return run;
    }

    // Cancel all pending/running phases
    await db
      .update(pipelinePhases)
      .set({
        status: "cancelled" as PhaseStatus,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(pipelinePhases.runId, runId),
          eq(pipelinePhases.status, "pending"),
        ),
      );
    await db
      .update(pipelinePhases)
      .set({
        status: "cancelled" as PhaseStatus,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(pipelinePhases.runId, runId),
          eq(pipelinePhases.status, "running"),
        ),
      );

    const [updated] = await db
      .update(pipelineRuns)
      .set({
        status: "cancelled" as RunStatus,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pipelineRuns.id, runId))
      .returning();

    return updated ?? null;
  }

  // ── Phase Execution ──────────────────────────────────────────────────────

  /**
   * Advance the pipeline run to its next phase(s).
   * Called after a phase completes or when a run first starts.
   *
   * Returns the phase keys that were started, or null if the run is complete.
   */
  async function advanceRun(runId: string): Promise<string[] | null> {
    const run = await getRun(runId);
    if (!run || run.status === "completed" || run.status === "failed" || run.status === "cancelled") {
      return null;
    }

    const template = await getTemplate(run.templateId);
    if (!template) throw new Error("Template not found for run");

    const phaseDefs = template.phases as PipelinePhaseDefinition[];
    const phases = await db
      .select()
      .from(pipelinePhases)
      .where(eq(pipelinePhases.runId, runId))
      .orderBy(asc(pipelinePhases.createdAt));

    // If run hasn't started yet, mark it running
    if (run.status === "pending") {
      await db
        .update(pipelineRuns)
        .set({
          status: "running" as RunStatus,
          startedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pipelineRuns.id, runId));
    }

    // Build set of completed phase keys (latest attempt per key)
    const phasesByKey = new Map<string, typeof phases[number]>();
    for (const phase of phases) {
      const existing = phasesByKey.get(phase.phaseKey);
      if (!existing || phase.attempt > existing.attempt) {
        phasesByKey.set(phase.phaseKey, phase);
      }
    }

    const completedKeys = new Set<string>();
    const failedKeys = new Set<string>();
    for (const [key, phase] of phasesByKey) {
      if (phase.status === "passed" || phase.status === "skipped") completedKeys.add(key);
      if (phase.status === "failed") failedKeys.add(key);
    }

    // If any phase has permanently failed, fail the run
    if (failedKeys.size > 0) {
      const failedPhase = phasesByKey.get([...failedKeys][0])!;
      await db
        .update(pipelineRuns)
        .set({
          status: "failed" as RunStatus,
          error: `Phase "${failedPhase.phaseKey}" failed: ${failedPhase.error ?? "unknown error"}`,
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pipelineRuns.id, runId));
      return null;
    }

    // Find phases whose dependencies are all completed
    const readyPhases: PipelinePhaseDefinition[] = [];
    for (const def of phaseDefs) {
      if (completedKeys.has(def.key)) continue; // already done
      const currentPhase = phasesByKey.get(def.key);
      if (currentPhase?.status === "running") continue; // already running

      const depsComplete = def.dependsOn.every((dep) => completedKeys.has(dep));
      if (depsComplete) {
        readyPhases.push(def);
      }
    }

    // If no phases are ready and none are running, the pipeline is complete
    const runningPhases = [...phasesByKey.values()].filter((p) => p.status === "running");
    if (readyPhases.length === 0 && runningPhases.length === 0) {
      // Run eval before marking complete
      await runEval(runId);

      await db
        .update(pipelineRuns)
        .set({
          status: "completed" as RunStatus,
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(pipelineRuns.id, runId));
      return null;
    }

    // Start ready phases
    const startedKeys: string[] = [];
    for (const def of readyPhases) {
      const existingPhase = phasesByKey.get(def.key);
      if (existingPhase) {
        // Update existing phase row
        await db
          .update(pipelinePhases)
          .set({
            status: "running" as PhaseStatus,
            startedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(pipelinePhases.id, existingPhase.id));
      }
      startedKeys.push(def.key);
    }

    // Update run's current phase pointer
    if (startedKeys.length > 0) {
      await db
        .update(pipelineRuns)
        .set({
          currentPhaseKey: startedKeys[0],
          updatedAt: new Date(),
        })
        .where(eq(pipelineRuns.id, runId));
    }

    return startedKeys.length > 0 ? startedKeys : null;
  }

  /**
   * Record the completion of a phase, verify the skill gate, and decide
   * whether to retry or proceed.
   */
  async function completePhase(
    phaseId: string,
    agentOutput: string,
    heartbeatRunId?: string,
  ): Promise<{
    passed: boolean;
    retry: boolean;
    retryTask?: string;
    skillGateResult: ReturnType<typeof verifySkillGate>;
    scores: Record<string, number>;
  }> {
    const [phase] = await db
      .select()
      .from(pipelinePhases)
      .where(eq(pipelinePhases.id, phaseId))
      .limit(1);
    if (!phase) throw new Error("Phase not found");

    const run = await getRun(phase.runId);
    if (!run) throw new Error("Run not found for phase");

    const template = await getTemplate(run.templateId);
    if (!template) throw new Error("Template not found for run");

    const phaseDef = (template.phases as PipelinePhaseDefinition[])
      .find((p) => p.key === phase.phaseKey);

    // Extract skill plan from the run (stored as { generatedAt, plan: { <phaseKey>: AgentSkillPlan }, ... })
    const skillPlanData = run.skillPlan as { plan?: Record<string, { required?: string[]; recommended?: string[] }> } | null;
    const skillPlan = skillPlanData?.plan ?? null;
    const agentPlan = skillPlan?.[phase.phaseKey] ?? null;

    // Verify skill gate
    const skillGateResult = verifySkillGate(
      phase.phaseKey,
      agentOutput,
      skillPlan ? { [phase.phaseKey]: agentPlan ?? { required: [], recommended: [] } } : null,
    );

    // Parse scores from reflector output and validate bounds
    const scores = parseReflectorScores(agentOutput);
    for (const key of Object.keys(scores)) {
      if (scores[key] < 0 || scores[key] > 100) {
        delete scores[key]; // Drop out-of-range scores rather than storing bad data
      }
    }

    // Parse used skills
    const usedSkills = parseUsedSkills(agentOutput);

    const qaThreshold = phase.qaThreshold ?? template.defaultQaThreshold;
    const maxRetries = phaseDef?.maxRetries ?? template.defaultMaxRetries;
    const totalScore = scores._total ?? 0;

    // If qaThreshold is 0 and no mandatory skills exist for this phase, auto-pass
    const mandatorySkills = getMandatorySkills(
      phase.phaseKey,
      skillPlan ? { [phase.phaseKey]: agentPlan ?? { required: [], recommended: [] } } : null,
    );
    const enforceableSkills = mandatorySkills.filter((s) => s.condition === "always");
    const skillGateEnabled = qaThreshold > 0 || enforceableSkills.length > 0;

    // QA pass logic:
    // - If skill gate is disabled (no threshold, no enforceable skills): auto-pass
    // - If score meets threshold: pass (score trumps missing blocks)
    // - If score is below threshold: skill gate must also be ok
    // - If no score (0) and skill gate fails: fail
    const scorePassesThreshold = totalScore >= qaThreshold;
    const qaPassed = !skillGateEnabled
      ? true
      : scorePassesThreshold
        ? true
        : skillGateResult.ok; // no score — rely on skill gate alone
    const now = new Date();
    const durationMs = phase.startedAt
      ? now.getTime() - new Date(phase.startedAt).getTime()
      : 0;

    // Update the phase record
    await db
      .update(pipelinePhases)
      .set({
        status: qaPassed ? ("passed" as PhaseStatus) : ("failed" as PhaseStatus),
        agentOutput,
        heartbeatRunId: heartbeatRunId ?? null,
        skillGateResult: skillGateResult as unknown as Record<string, unknown>,
        scores: scores as Record<string, unknown>,
        qaPassed: qaPassed ? "yes" : "no",
        usedSkills,
        durationMs,
        finishedAt: now,
        updatedAt: now,
        error: qaPassed ? null : (skillGateResult.reason ?? `Score ${totalScore} below threshold ${qaThreshold}`),
      })
      .where(eq(pipelinePhases.id, phaseId));

    // Track skill gate failures at the run level
    if (!skillGateResult.ok) {
      await db
        .update(pipelineRuns)
        .set({
          totalSkillGateFailures: (run.totalSkillGateFailures ?? 0) + 1,
          updatedAt: now,
        })
        .where(eq(pipelineRuns.id, run.id));
    }

    // Decide: retry or proceed
    let retry = false;
    let retryTask: string | undefined;

    if (!qaPassed && phase.attempt < maxRetries + 1) {
      retry = true;

      // Get the first-attempt task prompt so retry messages don't recursively stack
      const [firstAttemptPhase] = await db
        .select({ taskPrompt: pipelinePhases.taskPrompt })
        .from(pipelinePhases)
        .where(
          and(
            eq(pipelinePhases.runId, phase.runId),
            eq(pipelinePhases.phaseKey, phase.phaseKey),
          ),
        )
        .orderBy(asc(pipelinePhases.attempt))
        .limit(1);
      const originalTaskPrompt = firstAttemptPhase?.taskPrompt ?? phase.taskPrompt ?? "";

      // Build retry task
      if (!skillGateResult.ok && skillGateResult.missingSkills.length > 0) {
        retryTask = buildSkillGateRetryTask(
          skillGateResult.missingSkills,
          originalTaskPrompt,
        );
      } else {
        retryTask = [
          `QA GATE FAILURE — RE-RUN REQUIRED.`,
          ``,
          `Your previous output scored ${totalScore}/100 (threshold: ${qaThreshold}).`,
          scores._total !== undefined ? `Breakdown: ${JSON.stringify(scores)}` : "",
          ``,
          `Please improve your output quality and try again.`,
          ``,
          `Original task (still applies):`,
          originalTaskPrompt,
        ].join("\n");
      }

      // Create retry phase row
      await db.insert(pipelinePhases).values({
        companyId: phase.companyId,
        runId: phase.runId,
        phaseKey: phase.phaseKey,
        phaseName: phase.phaseName,
        status: "pending" as PhaseStatus,
        qaThreshold,
        requiredSkills: phase.requiredSkills,
        attempt: phase.attempt + 1,
        retryOfPhaseId: phase.id,
        taskPrompt: retryTask,
      });

      // Update run retry count
      await db
        .update(pipelineRuns)
        .set({
          totalRetries: (run.totalRetries ?? 0) + 1,
          updatedAt: now,
        })
        .where(eq(pipelineRuns.id, run.id));
    }

    // Fire closed-loop signals if phase passed and has onComplete config
    if (qaPassed && phaseDef?.onComplete?.createIssues) {
      await processPhaseSignals(run, phase, phaseDef, scores, agentOutput);
    }

    return { passed: qaPassed, retry, retryTask, skillGateResult, scores };
  }

  // ── Closed-Loop Signals ──────────────────────────────────────────────────

  /**
   * Auto-create Issues from pipeline phase findings.
   * Called when a phase completes with onComplete.createIssues enabled.
   */
  async function processPhaseSignals(
    run: typeof pipelineRuns.$inferSelect,
    phase: typeof pipelinePhases.$inferSelect,
    phaseDef: PipelinePhaseDefinition,
    scores: Record<string, number>,
    agentOutput: string,
  ) {
    const onComplete = phaseDef.onComplete;
    if (!onComplete?.createIssues) return [];

    const issueSvc = issueService(db);
    const defaults = onComplete.issueDefaults ?? {};
    const createdIssues: string[] = [];

    // Check if score is below threshold for issue creation
    const totalScore = scores._total ?? 100;
    if (onComplete.issueOnScoreBelow && totalScore >= onComplete.issueOnScoreBelow) {
      return []; // Score is fine, no issues needed
    }

    // Find categories that scored below the phase QA threshold
    const qaThreshold = phase.qaThreshold ?? 80;
    const findings: Array<{ category: string; score: number }> = [];

    for (const [category, score] of Object.entries(scores)) {
      if (category === "_total") continue;
      if (typeof score === "number" && score < qaThreshold) {
        findings.push({ category, score });
      }
    }

    // If there are specific category failures, create an issue per finding
    if (findings.length > 0) {
      for (const finding of findings) {
        const titlePrefix = defaults.titlePrefix ?? `[${phase.phaseName}]`;
        const title = `${titlePrefix} ${finding.category}: scored ${finding.score}/${qaThreshold}`;

        // Resolve assignee agent
        let assigneeAgentId = defaults.assigneeAgentId ?? null;
        if (!assigneeAgentId && defaults.assigneeAgentRole) {
          assigneeAgentId = await resolveAgentForPhase(run.companyId, {
            ...phaseDef,
            agentRole: defaults.assigneeAgentRole,
          });
        }
        if (!assigneeAgentId) {
          assigneeAgentId = phase.agentId ?? null;
        }

        if (assigneeAgentId) {
          try {
            const issue = await issueSvc.create(run.companyId, {
              title,
              description: [
                `Auto-created by pipeline run \`${run.id}\`, phase \`${phase.phaseKey}\`.`,
                ``,
                `**Category:** ${finding.category}`,
                `**Score:** ${finding.score}/${qaThreshold}`,
                `**Phase:** ${phase.phaseName} (attempt ${phase.attempt})`,
                ``,
                `Review the phase output and address the quality gap.`,
              ].join("\n"),
              status: "todo",
              priority: defaults.priority ?? "medium",
              assigneeAgentId,
              originKind: "pipeline_signal",
              originId: run.id,
            });
            createdIssues.push(issue.id);
          } catch (err) {
            // Log but don't fail the phase over issue creation
          }
        }
      }
    } else if (onComplete.issueOnScoreBelow && totalScore < onComplete.issueOnScoreBelow) {
      // General low-score issue when no specific category breakdowns
      const titlePrefix = defaults.titlePrefix ?? `[${phase.phaseName}]`;
      const title = `${titlePrefix} Overall score ${totalScore} below threshold ${onComplete.issueOnScoreBelow}`;

      let assigneeAgentId = defaults.assigneeAgentId ?? phase.agentId ?? null;
      if (!assigneeAgentId && defaults.assigneeAgentRole) {
        assigneeAgentId = await resolveAgentForPhase(run.companyId, {
          ...phaseDef,
          agentRole: defaults.assigneeAgentRole,
        });
      }

      if (assigneeAgentId) {
        try {
          const issue = await issueSvc.create(run.companyId, {
            title,
            description: [
              `Auto-created by pipeline run \`${run.id}\`, phase \`${phase.phaseKey}\`.`,
              ``,
              `**Overall Score:** ${totalScore}/${onComplete.issueOnScoreBelow}`,
              `**Phase:** ${phase.phaseName} (attempt ${phase.attempt})`,
            ].join("\n"),
            status: "todo",
            priority: defaults.priority ?? "high",
            assigneeAgentId,
            originKind: "pipeline_signal",
            originId: run.id,
          });
          createdIssues.push(issue.id);
        } catch (err) {
          // Log but don't fail
        }
      }
    }

    return createdIssues;
  }

  // ── Skill Planning ───────────────────────────────────────────────────────

  /**
   * Run the deterministic skill planner on a run's input context.
   * Stores the resulting skill plan in the run record.
   */
  async function planSkills(runId: string): Promise<ReturnType<typeof generateSkillPlan>> {
    const run = await getRun(runId);
    if (!run) throw new Error("Run not found");

    const ctx = run.inputContext as Record<string, string>;
    // Combine specContent with task field so signal patterns match on both
    const specWithTask = [ctx.specContent ?? "", ctx.task ?? ""].filter(Boolean).join("\n");
    const plan = generateSkillPlan(
      specWithTask,
      ctx.ideaContent ?? "",
      ctx.brandContent ?? "",
    );

    await db
      .update(pipelineRuns)
      .set({
        skillPlan: {
          generatedAt: new Date().toISOString(),
          ...plan,
        },
        updatedAt: new Date(),
      })
      .where(eq(pipelineRuns.id, runId));

    return plan;
  }

  /**
   * Get the formatted skill prompt section for a specific agent/phase.
   */
  async function getSkillPromptForPhase(runId: string, phaseKey: string): Promise<string> {
    const run = await getRun(runId);
    if (!run?.skillPlan) return "";

    const plan = run.skillPlan as { plan?: Record<string, { required: string[]; recommended: string[]; reasons: string[] }> };
    const agentPlan = plan.plan?.[phaseKey] ?? null;

    return formatSkillPromptSection(agentPlan);
  }

  // ── Eval ─────────────────────────────────────────────────────────────────

  /**
   * Gather scores from all phases, detect patterns, adjust thresholds.
   * Called when a run completes.
   */
  async function runEval(runId: string) {
    const run = await getRun(runId);
    if (!run) return;

    // Gather scores from all passed phases
    const phases = await db
      .select()
      .from(pipelinePhases)
      .where(
        and(
          eq(pipelinePhases.runId, runId),
          eq(pipelinePhases.status, "passed"),
        ),
      );

    const scores: Record<string, unknown> = {};
    for (const phase of phases) {
      if (phase.scores) {
        scores[phase.phaseKey] = phase.scores;
      }
    }

    // Get all skill gate failures for this run
    const allPhases = await db
      .select()
      .from(pipelinePhases)
      .where(eq(pipelinePhases.runId, runId));

    const skillGateFailures: Array<{ agent: string; skill: string }> = [];
    for (const phase of allPhases) {
      const result = phase.skillGateResult as { ok?: boolean; missingSkills?: string[] } | null;
      if (result && !result.ok && result.missingSkills) {
        for (const skill of result.missingSkills) {
          skillGateFailures.push({ agent: phase.phaseKey, skill });
        }
      }
    }

    // Build eval entry for this run
    const evalEntry: EvalRunEntry = {
      runId: run.id,
      timestamp: new Date().toISOString(),
      scores: scores as Record<string, unknown>,
      retries: {},
      durationMs: run.startedAt && run.finishedAt
        ? new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()
        : 0,
      skillGateFailures,
      reflectorResults: {},
    };

    // Load recent runs for pattern detection
    const recentRuns = await db
      .select()
      .from(pipelineRuns)
      .where(
        and(
          eq(pipelineRuns.companyId, run.companyId),
          eq(pipelineRuns.templateId, run.templateId),
          eq(pipelineRuns.status, "completed"),
        ),
      )
      .orderBy(desc(pipelineRuns.createdAt))
      .limit(5);

    // Build eval entries from recent runs
    const recentEntries: EvalRunEntry[] = recentRuns
      .filter((r) => r.evalResults)
      .map((r) => {
        const results = r.evalResults as { entry?: EvalRunEntry };
        return results.entry ?? {
          runId: r.id,
          timestamp: r.createdAt?.toISOString() ?? "",
          scores: {},
          retries: {},
          durationMs: 0,
          skillGateFailures: [],
          reflectorResults: {},
        };
      });

    recentEntries.push(evalEntry);

    // Detect patterns
    const thresholds: Record<string, number> = {};
    const patterns = detectPatterns(recentEntries, thresholds);
    const { adjustments, updatedThresholds } = adjustThresholds(recentEntries, thresholds);

    // Store eval results on the run
    await db
      .update(pipelineRuns)
      .set({
        evalResults: {
          entry: evalEntry,
          patterns,
          thresholdAdjustments: adjustments,
          thresholds: updatedThresholds,
        },
        updatedAt: new Date(),
      })
      .where(eq(pipelineRuns.id, runId));

    // ── Auto-trigger skill training for degraded skills ──────────────────
    // If the eval detects skills with recurring gate failures (2+ in last 3 runs),
    // auto-create a training run for those skills.
    if (patterns?.skillImprovementCandidates && patterns.skillImprovementCandidates.length > 0) {
      const trainer = agentTrainerService(db);
      for (const candidate of patterns.skillImprovementCandidates) {
        try {
          // Check if there's already an active training run for this skill
          const existingRuns = await trainer.listRunsForSkill(
            run.companyId,
            candidate.skill,
            5,
          );
          const hasActiveRun = existingRuns.some(
            (r) => r.status === "pending" || r.status === "running",
          );
          if (hasActiveRun) continue;

          await trainer.startTraining(run.companyId, {
            skillSlug: candidate.skill,
            triggerSource: "auto_eval",
            triggerPipelineRunId: runId,
          });
        } catch {
          // Don't fail the eval if training auto-trigger fails
        }
      }
    }
  }

  // ── Agent Resolution ─────────────────────────────────────────────────────

  /**
   * Resolve an agent for a phase based on the template's agent role assignment.
   * Looks up agents by role within the company.
   */
  async function resolveAgentForPhase(
    companyId: string,
    phaseDef: PipelinePhaseDefinition,
  ): Promise<string | null> {
    // If a specific agent ID is pinned, use it
    if (phaseDef.agentId) return phaseDef.agentId;

    // Find agent by role
    const [agent] = await db
      .select()
      .from(agents)
      .where(
        and(
          eq(agents.companyId, companyId),
          eq(agents.role, phaseDef.agentRole),
          eq(agents.status, "idle"),
        ),
      )
      .limit(1);

    return agent?.id ?? null;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    // Templates
    createTemplate,
    getTemplate,
    listTemplates,
    archiveTemplate,

    // Runs
    startRun,
    getRun,
    listRuns,
    getRunWithPhases,
    cancelRun,
    advanceRun,

    // Phase execution
    completePhase,

    // Skill planning
    planSkills,
    getSkillPromptForPhase,

    // Eval
    runEval,

    // Agent resolution
    resolveAgentForPhase,
  };
}
