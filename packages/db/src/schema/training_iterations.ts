import { pgTable, uuid, text, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";
import { trainingRuns } from "./training_runs.js";

/**
 * Training iterations track each Generator→Evaluator cycle within a training run.
 * Each row captures the generator's output, the evaluator's critique and scores,
 * and whether the critique items from the previous iteration were addressed.
 */
export const trainingIterations = pgTable(
  "training_iterations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainingRunId: uuid("training_run_id").notNull().references(() => trainingRuns.id, { onDelete: "cascade" }),

    /** 1-indexed iteration number */
    iterationNumber: integer("iteration_number").notNull(),

    /** Generator's full output (HTML, markdown, code, etc.) */
    generatorOutput: text("generator_output"),

    /** Evaluator's critique (markdown with specific feedback) */
    evaluatorCritique: text("evaluator_critique"),

    /**
     * Scores from this iteration.
     * { dimensions: { [name]: score }, total: number, maxScore: number, percentage: number }
     */
    scores: jsonb("scores").$type<IterationScores>(),

    /** Score as a percentage (0-100) for easy querying */
    scorePercent: integer("score_percent"),

    /** Delta from previous iteration's score */
    scoreDelta: integer("score_delta"),

    /**
     * Critique accountability: which items from previous iteration were addressed.
     * { total: number, addressed: number, skipped: string[] }
     */
    critiqueAccountability: jsonb("critique_accountability").$type<CritiqueAccountability>(),

    /** Whether the evaluator issued a NOT_DONE signal (skipped too many critique items) */
    notDone: text("not_done"),

    /** Status of this iteration: completed | not_done | error */
    status: text("status").notNull().default("pending"),

    /** Time taken for generator step (ms) */
    generatorDurationMs: integer("generator_duration_ms"),

    /** Time taken for evaluator step (ms) */
    evaluatorDurationMs: integer("evaluator_duration_ms"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    runIterationIdx: index("training_iterations_run_iteration_idx").on(
      table.trainingRunId,
      table.iterationNumber,
    ),
  }),
);

export interface IterationScores {
  dimensions: Record<string, number>;
  total: number;
  maxScore: number;
  percentage: number;
}

export interface CritiqueAccountability {
  total: number;
  addressed: number;
  skipped: string[];
}
