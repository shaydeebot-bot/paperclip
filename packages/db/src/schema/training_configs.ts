import { pgTable, uuid, text, timestamp, jsonb, index, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { companySkills } from "./company_skills.js";

/**
 * Training configs define reusable rubrics and scenarios for skill distillation.
 * Each config targets a specific skill and can be shared across training runs.
 *
 * Based on the proven Shaydee V3 GAN-inspired distillation pattern:
 * - Generator builds iterations using the skill + a test scenario
 * - Evaluator (independent agent) scores against a rubric + benchmark
 * - Loop until convergence or max iterations
 */
export const trainingConfigs = pgTable(
  "training_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),

    /** The skill being trained */
    skillId: uuid("skill_id").references(() => companySkills.id, { onDelete: "set null" }),

    /** Skill slug for display and lookup (survives skill deletion) */
    skillSlug: text("skill_slug").notNull(),

    name: text("name").notNull(),
    description: text("description"),

    /**
     * Instructions for the evaluator agent.
     * Defines the scoring rubric, dimensions, weights, and benchmark reference.
     * e.g. "Score on: visual hierarchy (3x), originality (2x), craft (2x), function (1x)"
     */
    evaluatorInstructions: text("evaluator_instructions").notNull(),

    /**
     * Test scenarios the generator runs against.
     * Each scenario is a prompt/task that exercises the skill.
     * e.g. ["Build a SaaS landing page for an analytics tool", "Redesign a pricing page"]
     */
    generatorScenarios: jsonb("generator_scenarios").$type<string[]>().notNull().default([]),

    /**
     * Scoring rubric: dimensions with weights and descriptions.
     * { dimensions: [{ name, weight, description }], maxScore: number }
     */
    rubric: jsonb("rubric").$type<TrainingRubric>(),

    /** URL or reference for benchmark comparison (e.g. "https://linear.app") */
    benchmarkRef: text("benchmark_ref"),

    /** Maximum iterations before stopping */
    maxIterations: integer("max_iterations").notNull().default(6),

    /** Score threshold (0-100) to consider training converged */
    convergenceThreshold: integer("convergence_threshold").notNull().default(85),

    /** Baseline score — what the skill achieves before training */
    baselineScore: integer("baseline_score"),

    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companySkillIdx: uniqueIndex("training_configs_company_skill_idx").on(table.companyId, table.skillSlug),
    companyStatusIdx: index("training_configs_company_status_idx").on(table.companyId, table.status),
  }),
);

export interface TrainingRubric {
  dimensions: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
  maxScore: number;
}
