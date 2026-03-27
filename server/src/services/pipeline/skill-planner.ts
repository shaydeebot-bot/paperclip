/**
 * skill-planner.ts — Deterministic skill deliberation.
 *
 * Ported from Shaydee V3 skill-planner.js. Reads blueprint spec content
 * and maps build characteristics to skills. Produces a skill plan consumed
 * by the skill gate and injected into each agent's task prompt.
 *
 * Cost: $0 — pure code, no LLM call.
 */

// ── Signal Definitions ──────────────────────────────────────────────────────

export interface SignalDefinition {
  id: string;
  patterns: RegExp[];
  skills: SignalSkillMapping[];
}

export interface SignalSkillMapping {
  agent: string;
  skill: string;
  priority: "required" | "recommended";
}

export interface AgentSkillPlan {
  required: string[];
  recommended: string[];
  reasons: string[];
}

export interface SkillPlanResult {
  plan: Record<string, AgentSkillPlan>;
  matchedSignals: string[];
  stats: {
    signalsDetected: number;
    totalSignalsChecked: number;
    agentsWithPlans: number;
    totalRequired: number;
    totalRecommended: number;
  };
}

export const SIGNALS: SignalDefinition[] = [
  // ── Frontend / UI ──
  {
    id: "frontend",
    patterns: [/\bhtml\b/i, /\bcss\b/i, /\blanding\s*page/i, /\bfrontend\b/i, /\bUI\b/, /\bweb\s*app/i, /\breact\b/i, /\bvue\b/i, /\bsvelte\b/i, /\bnext\.?js\b/i, /\btailwind/i, /\bpage\b.*\bdesign/i, /\bform\b/i, /\bdashboard\b/i],
    skills: [
      { agent: "forge", skill: "frontend-design", priority: "required" },
      { agent: "forge", skill: "design--accessibility-review", priority: "recommended" },
      { agent: "forge", skill: "design--ux-writing", priority: "recommended" },
      { agent: "forge-pass2", skill: "frontend-design", priority: "required" },
      { agent: "forge-pass2", skill: "design--accessibility-review", priority: "recommended" },
    ],
  },

  // ── API / Backend ──
  {
    id: "api",
    patterns: [/\bAPI\b/, /\bendpoint/i, /\bREST\b/i, /\bGraphQL\b/i, /\broute/i, /\bexpress\b/i, /\bserver\b/i, /\bbackend\b/i, /\bmiddleware\b/i, /\bwebhook/i],
    skills: [
      { agent: "blueprint", skill: "engineering--system-design", priority: "required" },
      { agent: "forge", skill: "engineering--testing-strategy", priority: "recommended" },
      { agent: "sentinel", skill: "engineering--testing-strategy", priority: "recommended" },
    ],
  },

  // ── Auth / Users / Accounts ──
  {
    id: "auth",
    patterns: [/\bauth\b/i, /\blogin\b/i, /\bsign[\s-]?up\b/i, /\buser\s*account/i, /\bpassword/i, /\bOAuth\b/i, /\bJWT\b/i, /\bsession/i, /\bregistr/i],
    skills: [
      { agent: "sentinel", skill: "engineering--testing-strategy", priority: "required" },
      { agent: "legal", skill: "legal--compliance", priority: "required" },
      { agent: "legal", skill: "legal--privacy-policy", priority: "required" },
      { agent: "legal", skill: "legal--cookie-policy", priority: "recommended" },
    ],
  },

  // ── Database / Data Models ──
  {
    id: "database",
    patterns: [/\bdatabase\b/i, /\bschema\b/i, /\bSQL\b/i, /\bPostgres/i, /\bSQLite/i, /\bMongo/i, /\bSupabase/i, /\bdata\s*model/i, /\btable\b/i, /\bmigrat/i, /\bPrisma\b/i],
    skills: [
      { agent: "blueprint", skill: "engineering--architecture", priority: "recommended" },
      { agent: "legal", skill: "legal--data-audit", priority: "recommended" },
      { agent: "sentinel", skill: "engineering--tech-debt", priority: "recommended" },
    ],
  },

  // ── Email / Notifications ──
  {
    id: "email",
    patterns: [/\bemail\b/i, /\bnotif/i, /\bResend\b/i, /\bSendGrid\b/i, /\bwelcome\s*(?:email|sequence|series)/i, /\bdigest\b/i, /\bnewsletter/i, /\bonboarding\s*email/i],
    skills: [
      { agent: "hype", skill: "marketing--email-sequence", priority: "required" },
      { agent: "hype-pass2", skill: "marketing--email-sequence", priority: "required" },
    ],
  },

  // ── SEO ──
  {
    id: "seo",
    patterns: [/\bSEO\b/i, /\bmeta\s*(?:tag|description|title)/i, /\bsitemap/i, /\bsearch\s*engine/i, /\borganic\s*traffic/i, /\bkeyword/i, /\bstructured\s*data/i, /\bschema\.org/i],
    skills: [
      { agent: "hype", skill: "marketing--seo-audit", priority: "required" },
      { agent: "hype-pass2", skill: "marketing--seo-audit", priority: "recommended" },
    ],
  },

  // ── Pricing / Monetization ──
  {
    id: "pricing",
    patterns: [/\bpric/i, /\bmonetiz/i, /\bsubscription/i, /\bfreemium/i, /\btier/i, /\bStripe\b/i, /\bpayment/i, /\bcheckout/i, /\bbilling/i, /\baffiliate/i],
    skills: [
      { agent: "hype", skill: "marketing--campaign-planning", priority: "recommended" },
      { agent: "legal", skill: "legal--terms-of-service", priority: "required" },
    ],
  },

  // ── Competitors / Market ──
  {
    id: "competitors",
    patterns: [/\bcompetitor/i, /\balternative/i, /\bmarket\s*(?:research|analysis|size)/i, /\bbattlecard/i, /\bpositioning/i, /\bdifferentiat/i],
    skills: [
      { agent: "hype", skill: "marketing--competitive-analysis", priority: "recommended" },
      { agent: "hype", skill: "marketing--brand-voice", priority: "recommended" },
    ],
  },

  // ── Deployment ──
  {
    id: "deployment",
    patterns: [/\bdeploy/i, /\bVercel\b/i, /\bRender\b/i, /\bNetlify\b/i, /\bAWS\b/i, /\bDocker\b/i, /\bCI\/CD\b/i, /\bGitHub\s*Actions/i, /\bproduction\b/i, /\bhosting\b/i],
    skills: [
      { agent: "forge", skill: "engineering--deploy-checklist", priority: "required" },
    ],
  },

  // ── LLM / AI Integration ──
  {
    id: "llm",
    patterns: [/\bLLM\b/i, /\bAI\b/, /\bGPT\b/i, /\bClaude\b/i, /\bOllama\b/i, /\bOpenAI\b/i, /\bprompt/i, /\bembedding/i, /\bvector/i, /\bRAG\b/i],
    skills: [
      { agent: "sentinel", skill: "llm-safety-audit", priority: "recommended" },
    ],
  },

  // ── Content-Heavy / Blog / Docs ──
  {
    id: "content",
    patterns: [/\bblog\b/i, /\bcontent\s*(?:marketing|strategy|calendar)/i, /\bcopywriting/i, /\bchangelog/i, /\bdocument/i],
    skills: [
      { agent: "hype", skill: "marketing--content-creation", priority: "recommended" },
      { agent: "hype-pass2", skill: "marketing--content-creation", priority: "recommended" },
    ],
  },

  // ── User Data / Privacy ──
  {
    id: "user-data",
    patterns: [/\bpersonal\s*data/i, /\bPII\b/i, /\bGDPR\b/i, /\bCCPA\b/i, /\bprivacy/i, /\bconsent/i, /\bcookie/i, /\btracking/i, /\banalytics\b/i],
    skills: [
      { agent: "legal", skill: "legal--compliance", priority: "required" },
      { agent: "legal", skill: "legal--privacy-policy", priority: "required" },
      { agent: "legal", skill: "legal--cookie-policy", priority: "required" },
      { agent: "legal", skill: "legal--data-audit", priority: "required" },
      { agent: "sentinel", skill: "legal--compliance", priority: "required" },
    ],
  },
];

// ── Always-On Skills ─────────────────────────────────────────────────────────

const ALWAYS_ON: SignalSkillMapping[] = [
  { agent: "forge", skill: "engineering--code-review", priority: "required" },
  { agent: "forge", skill: "engineering--standup", priority: "recommended" },
  { agent: "forge", skill: "engineering--debug", priority: "recommended" },
  { agent: "forge-pass2", skill: "engineering--code-review", priority: "recommended" },
  { agent: "verifier", skill: "engineering--code-review", priority: "required" },
  { agent: "sentinel", skill: "engineering--code-review", priority: "required" },
  { agent: "hype", skill: "anthropic-skills--vibe-marketing", priority: "required" },
  { agent: "hype-pass2", skill: "anthropic-skills--vibe-marketing", priority: "required" },
  { agent: "hype", skill: "marketing--brand-voice", priority: "recommended" },
  { agent: "cs-agent", skill: "customer-support--knowledge-management", priority: "required" },
  { agent: "cs-agent", skill: "design--ux-writing", priority: "recommended" },
  { agent: "cs-agent", skill: "customer-support--response-drafting", priority: "recommended" },
  { agent: "legal", skill: "legal--compliance", priority: "required" },
  { agent: "legal", skill: "legal--terms-of-service", priority: "recommended" },
  { agent: "blueprint", skill: "anthropic-skills--spec-handoff", priority: "required" },
  { agent: "reflect-code", skill: "reflection--code-review", priority: "required" },
  { agent: "reflect-copy", skill: "reflection--copy-review", priority: "required" },
  { agent: "reflect-copy-p2", skill: "reflection--copy-review", priority: "required" },
  { agent: "reflect-project", skill: "reflection--project-review", priority: "required" },
];

// ── Main Planner ─────────────────────────────────────────────────────────────

/**
 * Analyze spec content and produce a skill execution plan.
 * Zero LLM cost — pure pattern matching.
 */
export function generateSkillPlan(
  specContent: string,
  ideaContent = "",
  brandContent = "",
  customSignals?: SignalDefinition[],
): SkillPlanResult {
  const fullText = [specContent, ideaContent, brandContent].join("\n");
  const signals = customSignals ?? SIGNALS;

  // 1. Detect signals
  const matchedSignals: string[] = [];
  const triggeredSkills: SignalSkillMapping[] = [];

  for (const signal of signals) {
    const matched = signal.patterns.some((p) => p.test(fullText));
    if (matched) {
      matchedSignals.push(signal.id);
      triggeredSkills.push(...signal.skills);
    }
  }

  // 2. Add always-on skills
  triggeredSkills.push(...ALWAYS_ON);

  // 3. Deduplicate and organize by agent
  const plan: Record<string, AgentSkillPlan> = {};

  for (const { agent, skill, priority } of triggeredSkills) {
    if (!plan[agent]) {
      plan[agent] = { required: [], recommended: [], reasons: [] };
    }

    const bucket = priority === "required" ? "required" : "recommended";

    if (!plan[agent][bucket].includes(skill)) {
      plan[agent][bucket].push(skill);
    }

    // required wins over recommended — don't duplicate
    if (bucket === "required" && plan[agent].recommended.includes(skill)) {
      plan[agent].recommended = plan[agent].recommended.filter((s) => s !== skill);
    }
    if (bucket === "recommended" && plan[agent].required.includes(skill)) {
      continue;
    }
  }

  // 4. Add reasons based on matched signals
  for (const agent of Object.keys(plan)) {
    const reasons: string[] = [];
    for (const signalId of matchedSignals) {
      const signal = signals.find((s) => s.id === signalId);
      if (signal && signal.skills.some((s) => s.agent === agent)) {
        reasons.push(signalId);
      }
    }
    plan[agent].reasons = reasons;
  }

  // 5. Stats
  const stats = {
    signalsDetected: matchedSignals.length,
    totalSignalsChecked: signals.length,
    agentsWithPlans: Object.keys(plan).length,
    totalRequired: Object.values(plan).reduce((n, p) => n + p.required.length, 0),
    totalRecommended: Object.values(plan).reduce((n, p) => n + p.recommended.length, 0),
  };

  return { plan, matchedSignals, stats };
}

/**
 * Format a skill plan section for injection into an agent's task prompt.
 */
export function formatSkillPromptSection(
  agentPlan: AgentSkillPlan | null | undefined,
): string {
  if (!agentPlan) return "";

  const lines = [
    "",
    "── SKILL PLAN (auto-generated) ──",
    "",
    "You MUST invoke these skills before or during your work:",
  ];

  if (agentPlan.required.length > 0) {
    lines.push("");
    lines.push("REQUIRED (invoke all):");
    for (const s of agentPlan.required) {
      lines.push(`  ✓ /${s}`);
    }
  }

  if (agentPlan.recommended.length > 0) {
    lines.push("");
    lines.push("RECOMMENDED (invoke if relevant to your output):");
    for (const s of agentPlan.recommended) {
      lines.push(`  ○ /${s}`);
    }
  }

  lines.push("");
  lines.push("Record all invoked skills in your SKILLS_USED block at the end of your output.");
  lines.push("── END SKILL PLAN ──");
  lines.push("");

  return lines.join("\n");
}
