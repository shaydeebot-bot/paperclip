import { pgTable, uuid, text, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

/**
 * Pipeline templates define reusable multi-phase workflows.
 * Each template has an ordered list of phases with agent assignments,
 * skill requirements, dependencies, and QA thresholds.
 *
 * The Shaydee Build Pipeline is one template; users can create others
 * (Ops Pipeline, Audit Pipeline, etc.) or use the Pipeline Builder Wizard.
 */
export const pipelineTemplates = pgTable(
  "pipeline_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),

    /**
     * Ordered phase definitions. Each entry:
     * {
     *   key: string,              // unique within template, e.g. "blueprint", "forge", "sentinel"
     *   name: string,             // display name
     *   agentRole: string,        // agent role to assign (resolved at runtime)
     *   agentId?: string,         // optional pinned agent UUID
     *   dependsOn: string[],      // phase keys that must complete first
     *   parallel?: boolean,       // can run alongside other phases with no deps
     *   skills: { required: string[], recommended: string[] },
     *   qaThreshold?: number,     // minimum score to pass (0-100)
     *   maxRetries?: number,      // retries on QA failure (default 1)
     *   timeoutMs?: number,       // phase timeout
     * }
     */
    phases: jsonb("phases").$type<PipelinePhaseDefinition[]>().notNull().default([]),

    /**
     * Signal patterns for the skill planner.
     * If null, uses the built-in default signal set.
     * Custom templates can override with domain-specific signals.
     */
    signalConfig: jsonb("signal_config").$type<Record<string, unknown>>(),

    /** Default QA threshold for phases that don't specify one */
    defaultQaThreshold: integer("default_qa_threshold").notNull().default(80),

    /** Max retries for skill gate failures per phase */
    defaultMaxRetries: integer("default_max_retries").notNull().default(1),

    status: text("status").notNull().default("active"),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companySlugIdx: index("pipeline_templates_company_slug_idx").on(table.companyId, table.slug),
    companyStatusIdx: index("pipeline_templates_company_status_idx").on(table.companyId, table.status),
  }),
);

/** TypeScript type for phase definitions stored in the JSONB column */
export interface PipelinePhaseDefinition {
  key: string;
  name: string;
  agentRole: string;
  agentId?: string;
  dependsOn: string[];
  parallel?: boolean;
  skills: {
    required: string[];
    recommended: string[];
  };
  qaThreshold?: number;
  maxRetries?: number;
  timeoutMs?: number;

  /**
   * Closed-loop signal config: auto-create Issues from phase findings.
   * When a phase completes, the pipeline service can automatically create
   * Issues assigned to agents for follow-up work.
   */
  onComplete?: {
    /** Create issues from findings when the phase completes */
    createIssues?: boolean;
    /** Template for auto-created issues */
    issueDefaults?: {
      priority?: string;
      assigneeAgentRole?: string;
      assigneeAgentId?: string;
      titlePrefix?: string;
    };
    /** Only create issues if the phase score is below this threshold */
    issueOnScoreBelow?: number;
  };
}
