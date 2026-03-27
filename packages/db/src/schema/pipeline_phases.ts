import { pgTable, uuid, text, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { pipelineRuns } from "./pipeline_runs.js";
import { agents } from "./agents.js";
import { heartbeatRuns } from "./heartbeat_runs.js";

/**
 * Pipeline phases track the execution of each phase within a pipeline run.
 * Each row is one attempt at one phase — retries create new rows with retryOf set.
 *
 * The pipeline service creates phase rows as it advances through the template,
 * runs agents via executeRun (heartbeat), verifies skill gates, and records scores.
 */
export const pipelinePhases = pgTable(
  "pipeline_phases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    runId: uuid("run_id").notNull().references(() => pipelineRuns.id, { onDelete: "cascade" }),

    /** Phase key from the template definition (e.g. "blueprint", "forge", "sentinel") */
    phaseKey: text("phase_key").notNull(),

    /** Display name */
    phaseName: text("phase_name").notNull(),

    /** pending → running → passed | failed | skipped | cancelled */
    status: text("status").notNull().default("pending"),

    /** Agent assigned to execute this phase */
    agentId: uuid("agent_id").references(() => agents.id, { onDelete: "set null" }),

    /** The heartbeat run that executed this phase (links to existing execution system) */
    heartbeatRunId: uuid("heartbeat_run_id").references(() => heartbeatRuns.id, { onDelete: "set null" }),

    /** Attempt number (1 = first try, 2+ = retries) */
    attempt: integer("attempt").notNull().default(1),

    /** If this is a retry, points to the previous phase attempt */
    retryOfPhaseId: uuid("retry_of_phase_id"),

    /** Task prompt sent to the agent (includes skill plan injection) */
    taskPrompt: text("task_prompt"),

    /** Raw agent output */
    agentOutput: text("agent_output"),

    /**
     * Skill gate verification result.
     * { ok: boolean, hasPlanned: boolean, hasUsed: boolean, missingSkills: string[], reason?: string }
     */
    skillGateResult: jsonb("skill_gate_result").$type<Record<string, unknown>>(),

    /**
     * QA/reflection scores for this phase.
     * { total: number, categories: Record<string, number> }
     */
    scores: jsonb("scores").$type<Record<string, unknown>>(),

    /** QA threshold that was applied (from template or default) */
    qaThreshold: integer("qa_threshold"),

    /** Whether this phase passed the QA threshold */
    qaPassed: text("qa_passed"),

    /** Skills that were required for this phase */
    requiredSkills: jsonb("required_skills").$type<string[]>().default([]),

    /** Skills that were actually used (parsed from agent output) */
    usedSkills: jsonb("used_skills").$type<string[]>().default([]),

    /** Phase-level error message */
    error: text("error"),

    /** Duration of this phase execution */
    durationMs: integer("duration_ms"),

    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    runPhaseIdx: index("pipeline_phases_run_phase_idx").on(table.runId, table.phaseKey),
    companyRunIdx: index("pipeline_phases_company_run_idx").on(table.companyId, table.runId),
    runStatusIdx: index("pipeline_phases_run_status_idx").on(table.runId, table.status),
  }),
);

/** TypeScript type for the skill gate result stored in JSONB */
export interface SkillGateResult {
  ok: boolean;
  hasPlanned: boolean;
  hasUsed: boolean;
  missingSkills: string[];
  reason?: string | null;
}
