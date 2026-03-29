/**
 * eval.ts — Eval-driven development system.
 *
 * Ported from Shaydee V3 eval.js. Deterministic score parsing, history
 * management, cross-run pattern detection, and auto-threshold tightening.
 *
 * In Paperclip, eval data lives in the DB (pipeline_runs.evalResults and
 * pipeline_phases.scores) instead of JSON files. This module provides the
 * pure logic — the pipeline service handles DB reads/writes.
 */

// ── Score Parsing ────────────────────────────────────────────────────────────

/**
 * Extract numeric scores from a reflector's output.
 * Looks for patterns like "| Category | 85 |" or "**Total: 85/100**"
 *
 * All scores are clamped to 0–100. Values outside that range are treated
 * as parse artefacts and dropped.
 */
export function parseReflectorScores(outputContent: string): Record<string, number> {
  const scores: Record<string, number> = {};

  // Skip score parsing for sentinel-style output that uses severity counts
  // instead of percentage scores (e.g. "critical: 0, high: 2, medium: 1").
  if (isSentinelSeverityOutput(outputContent)) {
    const sentinelScore = deriveSentinelScore(outputContent);
    if (sentinelScore !== null) {
      scores._total = sentinelScore;
    }
    return scores;
  }

  // Pattern 1: markdown table rows — "| Category Name | 85 |"
  const tableRows = outputContent.matchAll(/\|\s*([^|]+?)\s*\|\s*(\d{1,3})\s*\|/g);
  for (const match of tableRows) {
    const category = match[1].trim().toLowerCase().replace(/\s+/g, "_");
    const score = parseInt(match[2], 10);
    if (score >= 0 && score <= 100 && category !== "category" && category !== "weight") {
      scores[category] = score;
    }
  }

  // Pattern 2: Explicit score patterns — "**Total: 85/100**", "Total Score: 85", "_total: 85"
  // More restrictive than before: require ":" before the number to avoid grabbing stray numbers.
  const totalMatch = outputContent.match(
    /(?:\*{0,2})(?:total|overall|weighted|_total)[^:\n]{0,20}:\s*(\d{1,3})(?:\s*\/\s*100)?(?:\*{0,2})/i,
  );
  if (totalMatch) {
    const total = parseInt(totalMatch[1], 10);
    if (total >= 0 && total <= 100) {
      scores._total = total;
    }
    // Score > 100 is a parse error — drop it rather than storing bad data
  }

  return scores;
}

/**
 * Detect if output is sentinel-style severity counts rather than percentage scores.
 * Sentinel outputs look like: "critical: 0", "high: 2", "medium: 1", "low: 3"
 */
function isSentinelSeverityOutput(output: string): boolean {
  const severityPattern = /\b(?:critical|high|medium|low)\s*:\s*\d+/gi;
  const matches = output.match(severityPattern);
  // If we see 3+ severity labels, this is a sentinel report, not a quality score
  return (matches?.length ?? 0) >= 3;
}

/**
 * Convert sentinel severity counts to a 0–100 quality score.
 * 0 critical + 0 high = 100; any critical = 0; any high = 50; medium-only = 80.
 */
function deriveSentinelScore(output: string): number | null {
  const extract = (label: string): number => {
    const m = output.match(new RegExp(`\\b${label}\\s*:\\s*(\\d+)`, "i"));
    return m ? parseInt(m[1], 10) : 0;
  };
  const critical = extract("critical");
  const high = extract("high");
  const medium = extract("medium");

  if (critical > 0) return 0;
  if (high > 0) return 50;
  if (medium > 0) return 80;
  return 100;
}

// ── Pattern Detection ────────────────────────────────────────────────────────

export interface EvalRunEntry {
  runId: string;
  timestamp: string;
  scores: Record<string, unknown>;
  retries: Record<string, number>;
  durationMs: number;
  skillGateFailures: Array<{ agent: string; skill: string }>;
  reflectorResults: Record<string, unknown>;
}

export interface PatternAnalysis {
  updated: string;
  recurringWeaknesses: Array<{
    category: string;
    runsBelowThreshold: number;
    avgScore: number;
    threshold: number;
    runIds: string[];
  }>;
  improvements: Array<{
    category: string;
    trend: "improving";
    scores: number[];
  }>;
  skillImprovementCandidates: Array<{
    skill: string;
    agent: string;
    reason: string;
  }>;
}

export interface ThresholdAdjustment {
  category: string;
  old: number;
  new: number;
  avg: number;
}

/**
 * Analyze run history for recurring patterns.
 * Only meaningful with 2+ runs.
 */
export function detectPatterns(
  runs: EvalRunEntry[],
  thresholds: Record<string, number>,
): PatternAnalysis | null {
  if (runs.length < 2) return null;

  const last3 = runs.slice(-3);
  const result: PatternAnalysis = {
    updated: new Date().toISOString(),
    recurringWeaknesses: [],
    improvements: [],
    skillImprovementCandidates: [],
  };

  // Flatten all category scores across runs
  const categoryScores: Record<string, Array<{ score: number; runId: string }>> = {};
  for (const run of last3) {
    if (!run.scores) continue;
    flattenScores(run.scores, "", categoryScores, run.runId);
  }

  // Find recurring weaknesses: categories below threshold in 2+ of last 3 runs
  for (const [category, entries] of Object.entries(categoryScores)) {
    if (entries.length < 2) continue;

    const threshold = findThreshold(category, thresholds);
    const belowThreshold = entries.filter((e) => e.score < threshold);

    if (belowThreshold.length >= 2) {
      const avgScore = Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length);
      result.recurringWeaknesses.push({
        category,
        runsBelowThreshold: belowThreshold.length,
        avgScore,
        threshold,
        runIds: belowThreshold.map((e) => e.runId),
      });
    }
  }

  // Find improvements: categories trending upward
  for (const [category, entries] of Object.entries(categoryScores)) {
    if (entries.length < 2) continue;

    // Sort by run order (assumes runs are chronologically ordered)
    const sorted = [...entries];

    let improving = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].score <= sorted[i - 1].score) {
        improving = false;
        break;
      }
    }

    if (improving) {
      result.improvements.push({
        category,
        trend: "improving",
        scores: sorted.map((e) => e.score),
      });
    }
  }

  // Find agents with recurring skill gate failures
  const skillFailures: Record<string, number> = {};
  for (const run of last3) {
    for (const failure of run.skillGateFailures || []) {
      const key = `${failure.agent}:${failure.skill}`;
      skillFailures[key] = (skillFailures[key] || 0) + 1;
    }
  }
  for (const [key, count] of Object.entries(skillFailures)) {
    if (count >= 2) {
      const [agent, skill] = key.split(":");
      result.skillImprovementCandidates.push({
        skill,
        agent,
        reason: `Skill gate failure in ${count}/${last3.length} recent runs`,
      });
    }
  }

  return result;
}

/**
 * Auto-tighten thresholds after 4+ runs.
 * If a category's average score exceeds its threshold by 5+, raise threshold by 5.
 * Never exceed 90.
 */
export function adjustThresholds(
  runs: EvalRunEntry[],
  thresholds: Record<string, number>,
): { adjustments: ThresholdAdjustment[]; updatedThresholds: Record<string, number> } {
  const updated = { ...thresholds };
  const adjustments: ThresholdAdjustment[] = [];

  if (runs.length < 4) return { adjustments, updatedThresholds: updated };

  const last4 = runs.slice(-4);
  const categoryScores: Record<string, Array<{ score: number; runId: string }>> = {};

  for (const run of last4) {
    if (!run.scores) continue;
    flattenScores(run.scores, "", categoryScores, run.runId);
  }

  for (const [category, entries] of Object.entries(categoryScores)) {
    if (entries.length < 3) continue;

    const avg = Math.round(entries.reduce((s, e) => s + e.score, 0) / entries.length);
    const currentThreshold = findThreshold(category, updated);

    if (avg >= currentThreshold + 5 && currentThreshold < 90) {
      const newThreshold = Math.min(currentThreshold + 5, 90);
      updated[category] = newThreshold;
      adjustments.push({ category, old: currentThreshold, new: newThreshold, avg });
    }
  }

  return { adjustments, updatedThresholds: updated };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function flattenScores(
  obj: Record<string, unknown>,
  prefix: string,
  accumulator: Record<string, Array<{ score: number; runId: string }>>,
  runId: string,
): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "number") {
      if (!accumulator[fullKey]) accumulator[fullKey] = [];
      accumulator[fullKey].push({ score: value, runId });
    } else if (typeof value === "object" && value !== null) {
      flattenScores(value as Record<string, unknown>, fullKey, accumulator, runId);
    }
  }
}

export function findThreshold(category: string, thresholds: Record<string, number>): number {
  if (thresholds[category] !== undefined) return thresholds[category];

  const parts = category.split(".");
  while (parts.length > 1) {
    parts.pop();
    const parent = parts.join(".");
    if (thresholds[parent] !== undefined) return thresholds[parent];
  }

  return 80; // default threshold
}
