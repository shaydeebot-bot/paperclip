import { pgTable, uuid, text, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { companySkills } from "./company_skills.js";
import { trainingConfigs } from "./training_configs.js";

/**
 * Training runs track active and historical skill distillation sessions.
 * Each run iterates through Generator→Evaluator cycles until convergence.
 *
 * State machine: pending → running → converged | max_iterations | failed | cancelled
 */
export const trainingRuns = pgTable(
  "training_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),

    /** The skill being trained */
    skillId: uuid("skill_id").references(() => companySkills.id, { onDelete: "set null" }),
    skillSlug: text("skill_slug").notNull(),

    /** Training config used (optional — can run ad-hoc without a saved config) */
    configId: uuid("config_id").references(() => trainingConfigs.id, { onDelete: "set null" }),

    /** pending → running → converged | max_iterations | failed | cancelled */
    status: text("status").notNull().default("pending"),

    /** Current iteration number (0 = not started, 1+ = in progress) */
    currentIteration: integer("current_iteration").notNull().default(0),

    /** Max iterations for this run */
    maxIterations: integer("max_iterations").notNull().default(6),

    /** Convergence threshold (percentage 0-100) */
    convergenceThreshold: integer("convergence_threshold").notNull().default(85),

    /** Score from the first iteration (establishes the baseline) */
    baselineScore: integer("baseline_score"),

    /** Score from the final iteration */
    finalScore: integer("final_score"),

    /** Best score achieved across all iterations */
    bestScore: integer("best_score"),

    /** Iteration that achieved the best score */
    bestIteration: integer("best_iteration"),

    /** The scenario used for this training run */
    scenario: text("scenario"),

    /** Evaluator instructions snapshot (from config or inline) */
    evaluatorInstructions: text("evaluator_instructions"),

    /**
     * Proposed skill update (the improved SKILL.md content).
     * Populated when the run converges. User can approve or reject.
     */
    proposedSkillUpdate: text("proposed_skill_update"),

    /** Whether the proposed update has been applied */
    updateApplied: text("update_applied").notNull().default("pending"),

    /** What triggered this training run */
    triggerSource: text("trigger_source").notNull().default("manual"),

    /** If auto-triggered, the pipeline run that detected degradation */
    triggerPipelineRunId: uuid("trigger_pipeline_run_id"),

    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyStatusIdx: index("training_runs_company_status_idx").on(table.companyId, table.status),
    companySkillIdx: index("training_runs_company_skill_idx").on(table.companyId, table.skillSlug),
    companyCreatedIdx: index("training_runs_company_created_idx").on(table.companyId, table.createdAt),
  }),
);
