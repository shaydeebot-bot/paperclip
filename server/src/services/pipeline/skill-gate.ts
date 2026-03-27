/**
 * skill-gate.ts — Deterministic skill gate enforcement.
 *
 * Ported from Shaydee V3 skill-gate.js. Verifies that agents actually
 * invoked mandatory skills by parsing their output for SKILLS_PLANNED
 * and SKILLS_USED blocks. No LLM involved — pure regex verification.
 *
 * Two-layer enforcement:
 * 1. Static MANDATORY_SKILLS — hardcoded floor, always checked
 * 2. Dynamic skill plan — merges "required" skills from the skill planner
 */

/** Result of skill gate verification — also used as the JSONB type in pipeline_phases */
export interface SkillGateResult {
  ok: boolean;
  hasPlanned: boolean;
  hasUsed: boolean;
  missingSkills: string[];
  reason?: string | null;
}

// ── Static mandatory skills by agent role ────────────────────────────────────
// The floor that always applies regardless of the skill plan.

export interface MandatorySkillEntry {
  skill: string;
  condition: "always" | "html_css_ui";
}

export const MANDATORY_SKILLS: Record<string, MandatorySkillEntry[]> = {
  forge: [{ skill: "frontend-design", condition: "html_css_ui" }],
  "forge-pass2": [{ skill: "frontend-design", condition: "html_css_ui" }],
  verifier: [{ skill: "engineering--code-review", condition: "always" }],
  sentinel: [{ skill: "engineering--code-review", condition: "always" }],
  hype: [{ skill: "anthropic-skills--vibe-marketing", condition: "always" }],
  "hype-pass2": [{ skill: "anthropic-skills--vibe-marketing", condition: "always" }],
  "cs-agent": [{ skill: "customer-support--knowledge-management", condition: "always" }],
  legal: [{ skill: "legal--compliance", condition: "always" }],
  "reflect-code": [{ skill: "reflection--code-review", condition: "always" }],
  "reflect-copy": [{ skill: "reflection--copy-review", condition: "always" }],
  "reflect-copy-p2": [{ skill: "reflection--copy-review", condition: "always" }],
  "reflect-project": [{ skill: "reflection--project-review", condition: "always" }],
};

/**
 * Merge static mandatory skills with dynamic skill plan "required" skills.
 */
export function getMandatorySkills(
  agentRole: string,
  skillPlan?: Record<string, { required?: string[]; recommended?: string[] }> | null,
): MandatorySkillEntry[] {
  const staticSkills = (MANDATORY_SKILLS[agentRole] || []).slice();

  if (skillPlan?.[agentRole]) {
    const dynamicRequired = skillPlan[agentRole].required || [];
    for (const skill of dynamicRequired) {
      if (!staticSkills.some((s) => s.skill === skill)) {
        staticSkills.push({ skill, condition: "always" });
      }
    }
  }

  return staticSkills;
}

/**
 * Verify that an agent's output contains proper SKILLS_PLANNED and SKILLS_USED
 * blocks, and that all mandatory skills for this agent were actually invoked.
 */
export function verifySkillGate(
  agentRole: string,
  output: string,
  skillPlan?: Record<string, { required?: string[]; recommended?: string[] }> | null,
): SkillGateResult {
  const result: SkillGateResult = {
    ok: true,
    hasPlanned: false,
    hasUsed: false,
    missingSkills: [],
    reason: null,
  };

  // Check mandatory skills for this agent (static + dynamic)
  const mandatory = getMandatorySkills(agentRole, skillPlan);

  result.hasPlanned = output.includes("SKILLS_PLANNED:");
  result.hasUsed = output.includes("SKILLS_USED:");

  // Only count skills with condition "always" as enforceable
  const enforceableSkills = mandatory.filter((s) => s.condition === "always");

  // If no enforceable mandatory skills exist, don't require the blocks — auto-pass
  if (enforceableSkills.length === 0) {
    result.ok = true;
    return result;
  }

  if (!result.hasPlanned || !result.hasUsed) {
    result.ok = false;
    const missing = [];
    if (!result.hasPlanned) missing.push("SKILLS_PLANNED");
    if (!result.hasUsed) missing.push("SKILLS_USED");
    result.reason = `Missing ${missing.join(" and ")} block(s)`;
    return result;
  }

  // Extract the SKILLS_USED section
  const usedMatch = output.match(/SKILLS_USED:[\s\S]*?(?=\n(?:#{1,3}\s|---|\n\n)|$)/);
  const usedSection = usedMatch ? usedMatch[0] : "";

  for (const { skill, condition } of mandatory) {
    if (condition !== "always") continue; // TODO: condition-based checks

    const skillPattern = new RegExp(`\\[x\\]\\s*.*${escapeRegex(skill)}`, "i");
    if (!skillPattern.test(usedSection)) {
      result.missingSkills.push(skill);
    }
  }

  if (result.missingSkills.length > 0) {
    result.ok = false;
    result.reason = `Mandatory skills not invoked: ${result.missingSkills.join(", ")}`;
  }

  return result;
}

/**
 * Extract the list of skills actually used from agent output.
 * Parses [x] /skill-name patterns from the SKILLS_USED block.
 */
export function parseUsedSkills(output: string): string[] {
  const usedMatch = output.match(/SKILLS_USED:[\s\S]*?(?=\n(?:#{1,3}\s|---|\n\n)|$)/);
  if (!usedMatch) return [];

  const skills: string[] = [];
  const lines = usedMatch[0].split("\n");
  for (const line of lines) {
    const match = line.match(/\[x\]\s*\/?([a-z][a-z0-9_-]*(?:--[a-z0-9_-]+)*)/i);
    if (match) {
      skills.push(match[1]);
    }
  }
  return skills;
}

/**
 * Build a task addendum that instructs an agent to invoke missed skills.
 * Used when re-running an agent after a skill gate failure.
 */
export function buildSkillGateRetryTask(
  missingSkills: string[],
  originalTask: string,
): string {
  return [
    "SKILL GATE FAILURE — RE-RUN REQUIRED.",
    "",
    "Your previous run did not invoke the following mandatory skills:",
    ...missingSkills.map((s) => `  - ${s}`),
    "",
    "You MUST invoke these skills BEFORE doing any work. The skill's methodology guides your output.",
    "",
    "Original task (still applies):",
    originalTask,
  ].join("\n");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
