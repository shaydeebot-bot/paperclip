import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Save,
  Send,
  Wand2,
} from "lucide-react";
import { pipelinesApi, type PipelinePhaseDefinition } from "../api/pipelines";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WizardMessage {
  role: "wizard" | "user";
  content: string;
  warnings?: string[];
  phasePreview?: PipelinePhaseDefinition[];
}

interface WizardState {
  step: number;
  answers: Record<string, string>;
  phases: PipelinePhaseDefinition[];
  warnings: string[];
  complete: boolean;
}

// ---------------------------------------------------------------------------
// Wizard Logic (deterministic — no LLM needed)
// ---------------------------------------------------------------------------

const WIZARD_QUESTIONS: Array<{
  key: string;
  question: string;
  help: string;
}> = [
  {
    key: "projectType",
    question: "What kind of project is this?",
    help: "Examples: SaaS landing page, API backend, mobile app, content site, CLI tool",
  },
  {
    key: "hasFrontend",
    question: "Does this project have a frontend/UI? (yes/no)",
    help: "Landing pages, dashboards, web apps — anything users see",
  },
  {
    key: "hasBackend",
    question: "Does it have a backend or API? (yes/no)",
    help: "Server, database, API endpoints, webhooks",
  },
  {
    key: "handlesUserData",
    question: "Will it handle user data (emails, passwords, PII)? (yes/no)",
    help: "Login systems, signups, user profiles, payment info",
  },
  {
    key: "needsMarketing",
    question: "Do you need marketing copy (landing page, social, emails)? (yes/no)",
    help: "Launch copy, SEO content, email sequences, social media",
  },
  {
    key: "needsDocs",
    question: "Do you need user-facing docs or help content? (yes/no)",
    help: "Help articles, onboarding guides, FAQ, tooltips",
  },
  {
    key: "qaLevel",
    question: "What QA level do you want? (basic/standard/strict)",
    help: "basic = no QA gates, standard = 60% threshold, strict = 80% + mandatory retries",
  },
];

function buildPipeline(answers: Record<string, string>): { phases: PipelinePhaseDefinition[]; warnings: string[] } {
  const phases: PipelinePhaseDefinition[] = [];
  const warnings: string[] = [];
  const yes = (key: string) => (answers[key] ?? "").toLowerCase().startsWith("y");
  const qaLevel = (answers.qaLevel ?? "standard").toLowerCase();
  const qaThreshold = qaLevel === "strict" ? 80 : qaLevel === "basic" ? 0 : 60;
  const maxRetries = qaLevel === "strict" ? 3 : qaLevel === "basic" ? 0 : 1;

  // Phase 1: Blueprint (always)
  phases.push({
    key: "blueprint",
    name: "Blueprint",
    agentRole: "architect",
    dependsOn: [],
    skills: { required: ["spec-handoff", "system-design"], recommended: ["engineering--architecture"] },
    qaThreshold,
    maxRetries,
  });

  // Phase 2: Hype Pass 1 (if marketing needed)
  if (yes("needsMarketing")) {
    phases.push({
      key: "hype-pass1",
      name: "Hype Pass 1",
      agentRole: "marketer",
      dependsOn: ["blueprint"],
      skills: { required: ["vibe-marketing"], recommended: ["content-creation"] },
      qaThreshold,
      maxRetries,
    });
  }

  // Phase 3: Build
  const buildDeps = ["blueprint"];
  if (yes("needsMarketing")) buildDeps.push("hype-pass1");

  const buildSkills: { required: string[]; recommended: string[] } = {
    required: [],
    recommended: ["engineering--code-review"],
  };
  if (yes("hasFrontend")) buildSkills.required.push("frontend-design");
  if (yes("hasBackend")) buildSkills.required.push("engineering--system-design");
  if (buildSkills.required.length === 0) buildSkills.required.push("frontend-design");

  phases.push({
    key: "build",
    name: "Build",
    agentRole: "engineer",
    dependsOn: buildDeps,
    skills: buildSkills,
    qaThreshold,
    maxRetries: Math.max(maxRetries, 1), // Always allow at least 1 retry for build
  });

  // Phase 4: Security (always recommended)
  phases.push({
    key: "security",
    name: "Security Review",
    agentRole: "security",
    dependsOn: ["build"],
    skills: { required: ["engineering--code-review"], recommended: [] },
    qaThreshold: Math.max(qaThreshold, 60), // Never go below 60 for security
  });

  // Phase 5: Legal (if user data)
  if (yes("handlesUserData")) {
    phases.push({
      key: "legal",
      name: "Legal & Compliance",
      agentRole: "legal",
      dependsOn: ["build"],
      skills: { required: ["legal--compliance"], recommended: [] },
      qaThreshold: Math.max(qaThreshold, 60),
    });
  }

  // Phase 6: Hype Pass 2 (if marketing, after build)
  if (yes("needsMarketing")) {
    phases.push({
      key: "hype-pass2",
      name: "Hype Pass 2",
      agentRole: "marketer",
      dependsOn: ["build", "security"],
      skills: { required: ["vibe-marketing"], recommended: ["seo-audit", "content-creation"] },
      qaThreshold,
      maxRetries,
    });
  }

  // Phase 7: CS/Docs (if needed)
  if (yes("needsDocs")) {
    const docDeps = ["build"];
    if (yes("needsMarketing")) docDeps.push("hype-pass2");
    phases.push({
      key: "cs-docs",
      name: "Customer Docs",
      agentRole: "cs-agent",
      dependsOn: docDeps,
      skills: { required: ["customer-support--knowledge-management"], recommended: [] },
      qaThreshold,
      maxRetries,
    });
  }

  // Warnings
  if (yes("handlesUserData") && qaLevel === "basic") {
    warnings.push("You handle user data but chose 'basic' QA level. Strongly recommend 'standard' or 'strict' — data breaches from skipped security are costly.");
  }
  if (!yes("handlesUserData") && !phases.find((p) => p.key === "legal")) {
    // No warning needed — legal phase correctly omitted
  }
  if (yes("needsMarketing") && !phases.find((p) => p.key === "hype-pass2")) {
    warnings.push("Single-pass marketing often produces placeholder copy. Consider enabling a second pass after build.");
  }
  if (qaLevel === "basic") {
    warnings.push("Without QA gates, agents may skip required skills. This was the #1 failure mode in Shaydee V1-V2.");
  }

  return { phases, warnings };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PipelineWizard() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<WizardState>({
    step: 0,
    answers: {},
    phases: [],
    warnings: [],
    complete: false,
  });

  const [messages, setMessages] = useState<WizardMessage[]>([
    {
      role: "wizard",
      content: "I'll help you build an optimal pipeline template. I'll ask a few questions about your project, then assemble a pipeline with the right phases, QA gates, and skill requirements.\n\nLet's get started!",
    },
    {
      role: "wizard",
      content: WIZARD_QUESTIONS[0].question + "\n\n_" + WIZARD_QUESTIONS[0].help + "_",
    },
  ]);

  const [input, setInput] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateSlug, setTemplateSlug] = useState("");

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/templates" },
      { label: "Wizard" },
    ]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || state.complete) return;

    const currentQ = WIZARD_QUESTIONS[state.step];
    const newAnswers = { ...state.answers, [currentQ.key]: trimmed };

    // Add user message
    const newMessages: WizardMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    const nextStep = state.step + 1;

    if (nextStep < WIZARD_QUESTIONS.length) {
      // Ask next question
      const nextQ = WIZARD_QUESTIONS[nextStep];
      newMessages.push({
        role: "wizard",
        content: nextQ.question + "\n\n_" + nextQ.help + "_",
      });

      setState({ ...state, step: nextStep, answers: newAnswers });
    } else {
      // Build the pipeline
      const { phases, warnings } = buildPipeline(newAnswers);

      const summary = [
        "Here's your pipeline template:\n",
        ...phases.map((p, i) => `**${i + 1}. ${p.name}** (${p.agentRole}) — depends on: ${p.dependsOn.length === 0 ? "none" : p.dependsOn.join(", ")}`),
        "",
        `**QA Threshold:** ${phases[0]?.qaThreshold ?? 60}%`,
        `**Max Retries:** ${phases[0]?.maxRetries ?? 1}`,
        `**Total Phases:** ${phases.length}`,
      ].join("\n");

      newMessages.push({
        role: "wizard",
        content: summary,
        warnings,
        phasePreview: phases,
      });

      if (warnings.length > 0) {
        newMessages.push({
          role: "wizard",
          content: "Enter a **name** for this template to save it, or type 'restart' to start over.",
        });
      } else {
        newMessages.push({
          role: "wizard",
          content: "Enter a **name** for this template to save it, or type 'restart' to start over.",
        });
      }

      setState({ ...state, step: nextStep, answers: newAnswers, phases, warnings, complete: true });
    }

    setMessages(newMessages);
    setInput("");
  }, [input, state, messages]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!selectedCompanyId) throw new Error("No company selected");
      const slug = templateSlug || templateName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return pipelinesApi.createTemplate(selectedCompanyId, {
        slug,
        name: templateName,
        description: `Created by Pipeline Wizard. Project: ${state.answers.projectType ?? "unknown"}`,
        phases: state.phases,
        defaultQaThreshold: state.phases[0]?.qaThreshold ?? 60,
        defaultMaxRetries: state.phases[0]?.maxRetries ?? 1,
      });
    },
    onSuccess: (template) => {
      setMessages((prev) => [
        ...prev,
        { role: "wizard", content: `Template saved! Redirecting to template detail...` },
      ]);
      setTimeout(() => navigate(`/pipelines/templates/${template.id}`), 1000);
    },
  });

  const handleSaveName = useCallback(() => {
    const name = input.trim();
    if (!name) return;

    if (name.toLowerCase() === "restart") {
      setState({ step: 0, answers: {}, phases: [], warnings: [], complete: false });
      setMessages([
        { role: "wizard", content: "Starting over!\n\n" + WIZARD_QUESTIONS[0].question + "\n\n_" + WIZARD_QUESTIONS[0].help + "_" },
      ]);
      setInput("");
      return;
    }

    setTemplateName(name);
    setTemplateSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    setMessages((prev) => [
      ...prev,
      { role: "user", content: name },
      { role: "wizard", content: `Saving template "${name}"...` },
    ]);
    setInput("");
    saveMutation.mutate();
  }, [input, saveMutation]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-4rem)]">
      <div className="space-y-1 px-1 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Wand2 className="h-6 w-6" />
          Pipeline Wizard
        </h1>
        <p className="text-sm text-muted-foreground">
          Answer a few questions and get an optimized pipeline template.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}>
              {/* Render markdown-like content */}
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={`${j > 0 ? "mt-1" : ""} ${line.startsWith("_") && line.endsWith("_") ? "text-xs text-muted-foreground italic" : ""}`}>
                  {line.startsWith("**") && line.includes("**")
                    ? <><strong>{line.replace(/\*\*/g, "").split(" — ")[0]}</strong>{line.includes(" — ") ? " — " + line.split(" — ").slice(1).join(" — ").replace(/\*\*/g, "") : ""}</>
                    : line.startsWith("_") && line.endsWith("_")
                      ? line.slice(1, -1)
                      : line || "\u00A0"}
                </p>
              ))}

              {/* Warnings */}
              {msg.warnings && msg.warnings.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {msg.warnings.map((w, j) => (
                    <div key={j} className="flex gap-2 rounded bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1.5 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <span className="text-yellow-800 dark:text-yellow-200">{w}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Phase preview diagram */}
              {msg.phasePreview && msg.phasePreview.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {msg.phasePreview.map((phase, j) => (
                    <span key={phase.key} className="inline-flex items-center gap-1">
                      <span className="rounded bg-background px-2 py-0.5 text-xs font-medium border border-border">
                        {phase.name}
                      </span>
                      {j < msg.phasePreview!.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border pt-3 px-1">
        {saveMutation.isError && (
          <p className="text-xs text-destructive mb-2">
            {saveMutation.error instanceof Error ? saveMutation.error.message : "Failed to save template"}
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (state.complete && templateName) return; // Already saving
            if (state.complete) handleSaveName();
            else handleSubmit();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={state.complete ? "Template name (or 'restart')..." : "Type your answer..."}
            disabled={saveMutation.isPending}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : state.complete ? (
              <Save className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}