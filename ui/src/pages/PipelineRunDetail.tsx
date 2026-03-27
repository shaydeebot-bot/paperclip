import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@/lib/router";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Play,
  RefreshCcw,
  Shield,
  SkipForward,
  Timer,
  XCircle,
} from "lucide-react";
import { pipelinesApi, type PipelinePhase, type PipelineRunWithPhases } from "../api/pipelines";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { MetricCard } from "../components/MetricCard";
import { StatusBadge } from "../components/StatusBadge";
import { cn, formatDateTime, relativeTime } from "../lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ---------------------------------------------------------------------------
// Phase status icon — always paired with text label for colorblind safety
// ---------------------------------------------------------------------------

const phaseStatusConfig: Record<
  PipelinePhase["status"],
  { icon: typeof Clock; label: string; className: string }
> = {
  pending: { icon: Clock, label: "Pending", className: "text-yellow-600 dark:text-yellow-400" },
  running: { icon: Play, label: "Running", className: "text-cyan-600 dark:text-cyan-400 animate-pulse" },
  passed: { icon: CheckCircle2, label: "Passed", className: "text-green-600 dark:text-green-400" },
  failed: { icon: XCircle, label: "Failed", className: "text-red-600 dark:text-red-400" },
  skipped: { icon: SkipForward, label: "Skipped", className: "text-muted-foreground" },
  cancelled: { icon: Ban, label: "Cancelled", className: "text-muted-foreground" },
};

function PhaseStatusIcon({ status }: { status: PipelinePhase["status"] }) {
  const config = phaseStatusConfig[status] ?? phaseStatusConfig.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 ${config.className}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-xs font-medium">{config.label}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skill gate result display
// ---------------------------------------------------------------------------

function SkillGateDisplay({ phase }: { phase: PipelinePhase }) {
  const result = phase.skillGateResult;
  if (!result) return <span className="text-xs text-muted-foreground">No skill gate data</span>;

  return (
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        <span className={result.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
          {result.ok ? (
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Gate passed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Gate failed
            </span>
          )}
        </span>
      </div>
      {result.missingSkills.length > 0 && (
        <div className="text-muted-foreground">
          Missing: {result.missingSkills.map((s) => (
            <code key={s} className="mr-1 rounded bg-red-50 px-1 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {s}
            </code>
          ))}
        </div>
      )}
      {result.reason && (
        <p className="text-muted-foreground">{result.reason}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scores display
// ---------------------------------------------------------------------------

function ScoresDisplay({ scores }: { scores: Record<string, number> }) {
  const total = scores._total;
  const categories = Object.entries(scores).filter(([k]) => k !== "_total");

  return (
    <div className="space-y-1.5 text-xs">
      {total != null && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Total Score:</span>
          <span className={cn(
            "font-semibold tabular-nums",
            total >= 80 ? "text-green-600 dark:text-green-400" :
            total >= 60 ? "text-yellow-600 dark:text-yellow-400" :
            "text-red-600 dark:text-red-400"
          )}>
            {total}/100
          </span>
        </div>
      )}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(([category, score]) => (
            <span
              key={category}
              className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5"
            >
              <span className="text-muted-foreground">{category}:</span>
              <span className="font-medium tabular-nums">{score}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent output viewer (expandable, shows full output)
// ---------------------------------------------------------------------------

function AgentOutputViewer({ output }: { output: string }) {
  const [expanded, setExpanded] = useState(false);
  const charCount = output.length.toLocaleString();

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <FileText className="h-3 w-3" />
        Agent Output ({charCount} chars)
      </button>
      {expanded && (
        <pre className="max-h-[600px] overflow-auto rounded border border-border bg-background p-3 text-xs whitespace-pre-wrap break-words">
          {output}
        </pre>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Phase row (expandable)
// ---------------------------------------------------------------------------

function PhaseRow({ phase, isCurrentPhase }: { phase: PipelinePhase; isCurrentPhase: boolean }) {
  const [open, setOpen] = useState(false);

  const duration = phase.durationMs != null
    ? phase.durationMs >= 60_000
      ? `${(phase.durationMs / 60_000).toFixed(1)}m`
      : `${(phase.durationMs / 1000).toFixed(1)}s`
    : null;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full text-left">
        <div
          className={cn(
            "flex items-center gap-3 px-4 py-3 border-b border-border transition-colors hover:bg-accent/50",
            isCurrentPhase && "bg-accent/20 border-l-2 border-l-cyan-500",
          )}
        >
          {/* Expand indicator */}
          <span className="shrink-0 text-muted-foreground">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>

          {/* Phase name + status */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{phase.phaseName}</span>
              {phase.attempt > 1 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  <RefreshCcw className="h-2.5 w-2.5" /> Attempt {phase.attempt}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {phase.phaseKey}
            </p>
          </div>

          {/* Status */}
          <PhaseStatusIcon status={phase.status} />

          {/* QA pass/fail indicator */}
          {phase.qaPassed != null && (
            <span className={cn(
              "text-xs font-medium",
              phase.qaPassed === "yes"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}>
              QA: {phase.qaPassed === "yes" ? (
                <span className="inline-flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Pass</span>
              ) : (
                <span className="inline-flex items-center gap-0.5"><XCircle className="h-3 w-3" /> Fail</span>
              )}
            </span>
          )}

          {/* Duration */}
          {duration && (
            <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1">
              <Timer className="h-3 w-3" /> {duration}
            </span>
          )}

          {/* Output length hint */}
          {phase.agentOutput && (
            <span className="text-xs text-muted-foreground tabular-nums flex items-center gap-1">
              <FileText className="h-3 w-3" /> {phase.agentOutput.length.toLocaleString()} chars
            </span>
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="border-b border-border bg-muted/20 px-4 py-4 space-y-4">
          {/* Skill gate */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Skill Gate
            </p>
            <SkillGateDisplay phase={phase} />
          </div>

          {/* Scores */}
          {phase.scores && Object.keys(phase.scores).length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Reflection Scores
              </p>
              <ScoresDisplay scores={phase.scores} />
            </div>
          )}

          {/* Required skills */}
          {phase.requiredSkills && phase.requiredSkills.length > 0 && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {phase.requiredSkills.map((skill) => {
                  const used = phase.usedSkills?.includes(skill) ?? false;
                  return (
                    <code
                      key={skill}
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs",
                        used
                          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                      )}
                    >
                      {used ? (
                        <span className="inline-flex items-center gap-0.5"><CheckCircle2 className="h-2.5 w-2.5" /> {skill}</span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5"><XCircle className="h-2.5 w-2.5" /> {skill}</span>
                      )}
                    </code>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {phase.error && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Error
              </p>
              <p className="text-xs text-destructive">{phase.error}</p>
            </div>
          )}

          {/* Agent output — expandable */}
          {phase.agentOutput && (
            <AgentOutputViewer output={phase.agentOutput} />
          )}

          {/* Timestamps */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {phase.startedAt && <span>Started: {formatDateTime(phase.startedAt)}</span>}
            {phase.finishedAt && <span>Finished: {formatDateTime(phase.finishedAt)}</span>}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PipelineRunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data: run, isLoading, error } = useQuery({
    queryKey: queryKeys.pipelines.runDetail(runId!),
    queryFn: () => pipelinesApi.getRun(runId!),
    enabled: !!runId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "pending" || data.status === "running")) {
        return 5_000;
      }
      return false;
    },
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/runs" },
      { label: "Runs", href: "/pipelines/runs" },
      { label: run?.name ?? runId?.slice(0, 8) ?? "Run" },
    ]);
  }, [setBreadcrumbs, run?.name, runId]);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (error || !run) {
    return (
      <EmptyState
        icon={Play}
        message={error instanceof Error ? error.message : "Run not found."}
      />
    );
  }

  // Sort phases: running first, then by creation order
  const sortedPhases = [...(run.phases ?? [])].sort((a, b) => {
    if (a.status === "running" && b.status !== "running") return -1;
    if (b.status === "running" && a.status !== "running") return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  // Compute stats
  const totalPhases = sortedPhases.length;
  const passedPhases = sortedPhases.filter((p) => p.status === "passed").length;
  const failedPhases = sortedPhases.filter((p) => p.status === "failed").length;
  const totalDurationMs = sortedPhases
    .filter((p) => p.durationMs != null)
    .reduce((sum, p) => sum + (p.durationMs ?? 0), 0);
  const totalDuration = totalDurationMs >= 60_000
    ? `${(totalDurationMs / 60_000).toFixed(1)}m`
    : `${(totalDurationMs / 1000).toFixed(0)}s`;

  const skillGatePasses = sortedPhases.filter((p) => p.skillGateResult?.ok).length;
  const skillGateTotal = sortedPhases.filter((p) => p.skillGateResult != null).length;
  const skillGateRate = skillGateTotal > 0
    ? `${Math.round((skillGatePasses / skillGateTotal) * 100)}%`
    : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {run.name ?? `Run ${run.id.slice(0, 8)}`}
          </h1>
          <StatusBadge status={run.status} />
        </div>
        {run.error && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {run.error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>Source: {run.triggerSource ?? "manual"}</span>
          {run.startedAt && <span>Started: {formatDateTime(run.startedAt)}</span>}
          {run.finishedAt && <span>Finished: {formatDateTime(run.finishedAt)}</span>}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <div className="border border-border">
          <MetricCard icon={CheckCircle2} value={`${passedPhases}/${totalPhases}`} label="Phases Passed" />
        </div>
        <div className="border border-border">
          <MetricCard icon={XCircle} value={failedPhases} label="Phases Failed" />
        </div>
        <div className="border border-border">
          <MetricCard icon={RefreshCcw} value={run.totalRetries} label="Total Retries" />
        </div>
        <div className="border border-border">
          <MetricCard icon={Shield} value={skillGateRate} label="Skill Gate Pass Rate" />
        </div>
        <div className="border border-border">
          <MetricCard icon={Timer} value={totalDuration} label="Total Duration" />
        </div>
      </div>

      {/* Phase timeline */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Phase Timeline
        </h2>

        <div className="border border-border">
          {sortedPhases.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No phases recorded yet.
            </div>
          ) : (
            sortedPhases.map((phase) => (
              <PhaseRow
                key={phase.id}
                phase={phase}
                isCurrentPhase={phase.phaseKey === run.currentPhaseKey}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
