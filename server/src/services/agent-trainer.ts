/**
 * agent-trainer.ts — Skill distillation via Generator/Evaluator dual-loop.
 *
 * Ported from Shaydee V3's GAN-inspired training system.
 * Proven on 9+ skills (scores 55% → 80%+ in 6 iterations).
 *
 * Key insights from V3:
 * - Independent evaluator catches 2x more issues than self-eval (~7pt inflation)
 * - NOT_DONE accountability prevents wasted iterations on polish over structure
 * - Plateau detection (ΔScore=0) reveals skipped hard critiques
 * - Convergence threshold + max iterations prevents infinite loops
 *
 * The service manages the training loop state machine. Actual agent execution
 * is delegated to the heartbeat system via `invoke()`.
 */

import { eq, and, desc, asc } from "drizzle-orm";
import type { Db } from "@paperclipai/db";
import {
  trainingConfigs,
  trainingRuns,
  trainingIterations,
  companySkills,
} from "@paperclipai/db";

// ── Types ────────────────────────────────────────────────────────────────────

export interface StartTrainingInput {
  skillSlug: string;
  configId?: string;
  scenario?: string;
  evaluatorInstructions?: string;
  maxIterations?: number;
  convergenceThreshold?: number;
  triggerSource?: string;
  triggerPipelineRunId?: string;
}

export interface SaveConfigInput {
  skillSlug: string;
  name: string;
  description?: string;
  evaluatorInstructions: string;
  generatorScenarios: string[];
  rubric?: {
    dimensions: Array<{ name: string; weight: number; description: string }>;
    maxScore: number;
  };
  benchmarkRef?: string;
  maxIterations?: number;
  convergenceThreshold?: number;
  baselineScore?: number;
}

export interface RecordIterationInput {
  generatorOutput: string;
  evaluatorCritique: string;
  scores: {
    dimensions: Record<string, number>;
    total: number;
    maxScore: number;
    percentage: number;
  };
  critiqueAccountability?: {
    total: number;
    addressed: number;
    skipped: string[];
  };
  notDone?: boolean;
  generatorDurationMs?: number;
  evaluatorDurationMs?: number;
}

type RunStatus = "pending" | "running" | "converged" | "max_iterations" | "failed" | "cancelled";

// ── Service ──────────────────────────────────────────────────────────────────

export function agentTrainerService(db: Db) {

  // ── Config CRUD ──────────────────────────────────────────────────────────

  async function saveConfig(companyId: string, input: SaveConfigInput) {
    // Check if config already exists for this skill
    const [existing] = await db
      .select()
      .from(trainingConfigs)
      .where(
        and(
          eq(trainingConfigs.companyId, companyId),
          eq(trainingConfigs.skillSlug, input.skillSlug),
        ),
      )
      .limit(1);

    // Resolve skill ID
    const [skill] = await db
      .select()
      .from(companySkills)
      .where(
        and(
          eq(companySkills.companyId, companyId),
          eq(companySkills.slug, input.skillSlug),
        ),
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(trainingConfigs)
        .set({
          name: input.name,
          description: input.description ?? null,
          skillId: skill?.id ?? null,
          evaluatorInstructions: input.evaluatorInstructions,
          generatorScenarios: input.generatorScenarios,
          rubric: input.rubric ?? null,
          benchmarkRef: input.benchmarkRef ?? null,
          maxIterations: input.maxIterations ?? 6,
          convergenceThreshold: input.convergenceThreshold ?? 85,
          baselineScore: input.baselineScore ?? null,
          updatedAt: new Date(),
        })
        .where(eq(trainingConfigs.id, existing.id))
        .returning();
      return updated;
    }

    const [config] = await db
      .insert(trainingConfigs)
      .values({
        companyId,
        skillId: skill?.id ?? null,
        skillSlug: input.skillSlug,
        name: input.name,
        description: input.description ?? null,
        evaluatorInstructions: input.evaluatorInstructions,
        generatorScenarios: input.generatorScenarios,
        rubric: input.rubric ?? null,
        benchmarkRef: input.benchmarkRef ?? null,
        maxIterations: input.maxIterations ?? 6,
        convergenceThreshold: input.convergenceThreshold ?? 85,
        baselineScore: input.baselineScore ?? null,
      })
      .returning();
    return config;
  }

  async function getConfig(configId: string) {
    const [config] = await db
      .select()
      .from(trainingConfigs)
      .where(eq(trainingConfigs.id, configId))
      .limit(1);
    return config ?? null;
  }

  async function getConfigBySkill(companyId: string, skillSlug: string) {
    const [config] = await db
      .select()
      .from(trainingConfigs)
      .where(
        and(
          eq(trainingConfigs.companyId, companyId),
          eq(trainingConfigs.skillSlug, skillSlug),
        ),
      )
      .limit(1);
    return config ?? null;
  }

  async function listConfigs(companyId: string) {
    return db
      .select()
      .from(trainingConfigs)
      .where(
        and(
          eq(trainingConfigs.companyId, companyId),
          eq(trainingConfigs.status, "active"),
        ),
      )
      .orderBy(desc(trainingConfigs.updatedAt));
  }

  // ── Training Run Management ──────────────────────────────────────────────

  async function startTraining(companyId: string, input: StartTrainingInput) {
    // Load config if specified
    let config: typeof trainingConfigs.$inferSelect | null = null;
    if (input.configId) {
      config = await getConfig(input.configId);
    } else {
      config = await getConfigBySkill(companyId, input.skillSlug);
    }

    // Resolve skill
    const [skill] = await db
      .select()
      .from(companySkills)
      .where(
        and(
          eq(companySkills.companyId, companyId),
          eq(companySkills.slug, input.skillSlug),
        ),
      )
      .limit(1);

    // Pick scenario: explicit > random from config > default
    let scenario = input.scenario ?? null;
    if (!scenario && config?.generatorScenarios) {
      const scenarios = config.generatorScenarios as string[];
      if (scenarios.length > 0) {
        scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      }
    }
    if (!scenario) {
      scenario = `Generate a high-quality output using the ${input.skillSlug} skill. Demonstrate mastery of all skill dimensions.`;
    }

    const evaluatorInstructions =
      input.evaluatorInstructions ??
      config?.evaluatorInstructions ??
      buildDefaultEvaluatorInstructions(input.skillSlug);

    const maxIterations = input.maxIterations ?? config?.maxIterations ?? 6;
    const convergenceThreshold = input.convergenceThreshold ?? config?.convergenceThreshold ?? 85;

    const [run] = await db
      .insert(trainingRuns)
      .values({
        companyId,
        skillId: skill?.id ?? null,
        skillSlug: input.skillSlug,
        configId: config?.id ?? null,
        status: "pending" as RunStatus,
        maxIterations,
        convergenceThreshold,
        scenario,
        evaluatorInstructions,
        triggerSource: input.triggerSource ?? "manual",
        triggerPipelineRunId: input.triggerPipelineRunId ?? null,
      })
      .returning();

    return run;
  }

  async function getRun(runId: string) {
    const [run] = await db
      .select()
      .from(trainingRuns)
      .where(eq(trainingRuns.id, runId))
      .limit(1);
    return run ?? null;
  }

  async function getRunWithIterations(runId: string) {
    const run = await getRun(runId);
    if (!run) return null;

    const iterations = await db
      .select()
      .from(trainingIterations)
      .where(eq(trainingIterations.trainingRunId, runId))
      .orderBy(asc(trainingIterations.iterationNumber));

    return { ...run, iterations };
  }

  async function listRuns(companyId: string, limit = 50) {
    return db
      .select()
      .from(trainingRuns)
      .where(eq(trainingRuns.companyId, companyId))
      .orderBy(desc(trainingRuns.createdAt))
      .limit(limit);
  }

  async function listRunsForSkill(companyId: string, skillSlug: string, limit = 20) {
    return db
      .select()
      .from(trainingRuns)
      .where(
        and(
          eq(trainingRuns.companyId, companyId),
          eq(trainingRuns.skillSlug, skillSlug),
        ),
      )
      .orderBy(desc(trainingRuns.createdAt))
      .limit(limit);
  }

  async function cancelRun(runId: string) {
    const run = await getRun(runId);
    if (!run) return null;
    if (run.status !== "pending" && run.status !== "running") return run;

    const [updated] = await db
      .update(trainingRuns)
      .set({
        status: "cancelled" as RunStatus,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trainingRuns.id, runId))
      .returning();

    return updated ?? null;
  }

  // ── Iteration Recording ──────────────────────────────────────────────────

  /**
   * Record a completed Generator→Evaluator iteration.
   * Updates the run's score tracking and determines if the loop should continue.
   */
  async function recordIteration(
    runId: string,
    input: RecordIterationInput,
  ): Promise<{
    iteration: typeof trainingIterations.$inferSelect;
    runStatus: string;
    shouldContinue: boolean;
    plateau: boolean;
  }> {
    const run = await getRun(runId);
    if (!run) throw new Error("Training run not found");
    if (run.status !== "pending" && run.status !== "running") {
      throw new Error(`Cannot record iteration for run in status: ${run.status}`);
    }

    const nextIteration = run.currentIteration + 1;
    const scorePercent = Math.round(input.scores.percentage);

    // Get previous iteration's score for delta calculation
    let scoreDelta = 0;
    if (nextIteration > 1) {
      const [prevIter] = await db
        .select()
        .from(trainingIterations)
        .where(
          and(
            eq(trainingIterations.trainingRunId, runId),
            eq(trainingIterations.iterationNumber, nextIteration - 1),
          ),
        )
        .limit(1);
      if (prevIter?.scorePercent != null) {
        scoreDelta = scorePercent - prevIter.scorePercent;
      }
    }

    // Determine if this is a NOT_DONE (too many critique items skipped)
    const isNotDone = input.notDone ||
      (input.critiqueAccountability && input.critiqueAccountability.skipped.length >= 3);

    const iterStatus = isNotDone ? "not_done" : "completed";

    // Insert iteration
    const iterationValues: typeof trainingIterations.$inferInsert = {
      trainingRunId: runId,
      iterationNumber: nextIteration,
      generatorOutput: input.generatorOutput,
      evaluatorCritique: input.evaluatorCritique,
      scores: input.scores,
      scorePercent,
      scoreDelta,
      critiqueAccountability: input.critiqueAccountability ?? null,
      notDone: isNotDone ? "yes" : null,
      status: iterStatus,
      generatorDurationMs: input.generatorDurationMs ?? null,
      evaluatorDurationMs: input.evaluatorDurationMs ?? null,
    };
    const [iteration] = await db
      .insert(trainingIterations)
      .values(iterationValues)
      .returning();

    // Update run tracking
    const isBaseline = nextIteration === 1;
    const isBest = run.bestScore == null || scorePercent > run.bestScore;

    const runUpdate: Record<string, unknown> = {
      currentIteration: nextIteration,
      status: "running" as RunStatus,
      updatedAt: new Date(),
    };

    if (!run.startedAt) {
      runUpdate.startedAt = new Date();
    }
    if (isBaseline) {
      runUpdate.baselineScore = scorePercent;
    }
    if (isBest) {
      runUpdate.bestScore = scorePercent;
      runUpdate.bestIteration = nextIteration;
    }

    // Determine if the run should continue
    const plateau = scoreDelta === 0 && nextIteration > 1;
    let shouldContinue = true;
    let finalStatus: RunStatus = "running";

    if (scorePercent >= run.convergenceThreshold) {
      // Converged!
      shouldContinue = false;
      finalStatus = "converged";
      runUpdate.finalScore = scorePercent;
      runUpdate.finishedAt = new Date();
      runUpdate.status = finalStatus;
    } else if (nextIteration >= run.maxIterations) {
      // Hit max iterations
      shouldContinue = false;
      finalStatus = "max_iterations";
      runUpdate.finalScore = scorePercent;
      runUpdate.finishedAt = new Date();
      runUpdate.status = finalStatus;
    }

    // For NOT_DONE iterations, don't advance — the generator must re-address
    // But still count it as an iteration for max limit purposes
    if (isNotDone && shouldContinue) {
      // NOT_DONE doesn't change shouldContinue, but the next iteration
      // must address the skipped items before getting a real score
    }

    await db
      .update(trainingRuns)
      .set(runUpdate)
      .where(eq(trainingRuns.id, runId));

    return {
      iteration,
      runStatus: finalStatus,
      shouldContinue,
      plateau,
    };
  }

  /**
   * Mark a run as failed with an error message.
   */
  async function failRun(runId: string, error: string) {
    const [updated] = await db
      .update(trainingRuns)
      .set({
        status: "failed" as RunStatus,
        error,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(trainingRuns.id, runId))
      .returning();
    return updated ?? null;
  }

  /**
   * Store the proposed skill update from a converged training run.
   */
  async function proposeSkillUpdate(runId: string, proposedMarkdown: string) {
    const [updated] = await db
      .update(trainingRuns)
      .set({
        proposedSkillUpdate: proposedMarkdown,
        updateApplied: "pending",
        updatedAt: new Date(),
      })
      .where(eq(trainingRuns.id, runId))
      .returning();
    return updated ?? null;
  }

  /**
   * Apply the proposed skill update — writes to the company_skills table.
   */
  async function applySkillUpdate(runId: string) {
    const run = await getRun(runId);
    if (!run) throw new Error("Training run not found");
    if (!run.proposedSkillUpdate) throw new Error("No proposed update to apply");
    if (!run.skillId) throw new Error("No skill linked to this training run");

    await db
      .update(companySkills)
      .set({
        markdown: run.proposedSkillUpdate,
        updatedAt: new Date(),
      })
      .where(eq(companySkills.id, run.skillId));

    const [updated] = await db
      .update(trainingRuns)
      .set({
        updateApplied: "applied",
        updatedAt: new Date(),
      })
      .where(eq(trainingRuns.id, runId))
      .returning();

    return updated ?? null;
  }

  /**
   * Reject the proposed skill update.
   */
  async function rejectSkillUpdate(runId: string) {
    const [updated] = await db
      .update(trainingRuns)
      .set({
        updateApplied: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(trainingRuns.id, runId))
      .returning();
    return updated ?? null;
  }

  // ── Skill Health ─────────────────────────────────────────────────────────

  /**
   * Get health overview for all trained skills in a company.
   * Returns latest score, trend, and last training date.
   */
  async function getSkillHealth(companyId: string) {
    const runs = await db
      .select()
      .from(trainingRuns)
      .where(
        and(
          eq(trainingRuns.companyId, companyId),
        ),
      )
      .orderBy(desc(trainingRuns.createdAt));

    // Group by skill slug, take latest run per skill
    const bySkill = new Map<string, Array<typeof runs[number]>>();
    for (const run of runs) {
      const existing = bySkill.get(run.skillSlug) ?? [];
      existing.push(run);
      bySkill.set(run.skillSlug, existing);
    }

    const health: Array<{
      skillSlug: string;
      latestScore: number | null;
      bestScore: number | null;
      baselineScore: number | null;
      improvement: number | null;
      totalRuns: number;
      lastTrainedAt: Date | null;
      status: string;
      trend: "improving" | "stable" | "degrading" | "unknown";
    }> = [];

    for (const [slug, skillRuns] of bySkill) {
      const completedRuns = skillRuns.filter(
        (r) => r.status === "converged" || r.status === "max_iterations",
      );
      const latestCompleted = completedRuns[0] ?? null;

      let trend: "improving" | "stable" | "degrading" | "unknown" = "unknown";
      if (completedRuns.length >= 2) {
        const recent = completedRuns[0].finalScore ?? 0;
        const previous = completedRuns[1].finalScore ?? 0;
        if (recent > previous + 2) trend = "improving";
        else if (recent < previous - 2) trend = "degrading";
        else trend = "stable";
      }

      health.push({
        skillSlug: slug,
        latestScore: latestCompleted?.finalScore ?? null,
        bestScore: latestCompleted?.bestScore ?? null,
        baselineScore: latestCompleted?.baselineScore ?? null,
        improvement: latestCompleted?.baselineScore != null && latestCompleted?.finalScore != null
          ? latestCompleted.finalScore - latestCompleted.baselineScore
          : null,
        totalRuns: skillRuns.length,
        lastTrainedAt: latestCompleted?.finishedAt ?? null,
        status: latestCompleted?.status ?? "never_trained",
        trend,
      });
    }

    return health;
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  function buildDefaultEvaluatorInstructions(skillSlug: string): string {
    return [
      `You are an independent evaluator scoring the output of the "${skillSlug}" skill.`,
      "",
      "Score on these dimensions (1-10 each):",
      "- Quality (3x weight): How well does the output meet professional standards?",
      "- Completeness (2x weight): Does it cover all required aspects?",
      "- Craft (2x weight): Attention to detail, consistency, polish",
      "- Effectiveness (1x weight): Would this achieve its goal?",
      "",
      "Max score: 80 weighted points",
      "",
      "For each dimension:",
      "1. List specific strengths",
      "2. List specific weaknesses with actionable fixes",
      "3. Give a score 1-10",
      "",
      "End with a total score and 'Instructions for Next Iteration' section.",
      "List the top 3-5 most impactful improvements, ordered by priority.",
      "",
      "ACCOUNTABILITY: If this is iteration 2+, check whether the generator",
      "addressed ALL items from your previous 'Instructions for Next Iteration'.",
      "If 3+ items were skipped without justification, mark as NOT_DONE.",
    ].join("\n");
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    // Configs
    saveConfig,
    getConfig,
    getConfigBySkill,
    listConfigs,

    // Runs
    startTraining,
    getRun,
    getRunWithIterations,
    listRuns,
    listRunsForSkill,
    cancelRun,
    failRun,

    // Iterations
    recordIteration,

    // Skill updates
    proposeSkillUpdate,
    applySkillUpdate,
    rejectSkillUpdate,

    // Health
    getSkillHealth,
  };
}
