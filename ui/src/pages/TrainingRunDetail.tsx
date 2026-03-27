import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@/lib/router";
import {
  ArrowRight,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Dumbbell,
  GraduationCap,
  Play,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { trainingApi, type TrainingRun, type TrainingIteration } from "../api/training";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { MetricCard } from "../components/MetricCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { relativeTime, formatDateTime } from "../lib/utils";

function statusIcon(status: TrainingRun["status"]) {
  const map = {
    pending: { icon: Clock, label: "Pending", className: "text-yellow-600 dark:text-yellow-400" },
    running: { icon: Play, label: "Running", className: "text-cyan-600 dark:text-cyan-400" },
    converged: { icon: CheckCircle2, label: "Converged", className: "text-green-600 dark:text-green-400" },
    max_iterations: { icon: Target, label: "Max Iterations", className: "text-orange-600 dark:text-orange-400" },
    failed: { icon: XCircle, label: "Failed", className: "text-red-600 dark:text-red-400" },
    cancelled: { icon: Ban, label: "Cancelled", className: "text-muted-foreground" },
  } as const;
  return map[status] ?? map.pending;
}

function IterationRow({ iteration, isLast }: { iteration: TrainingIteration; isLast: boolean }) {
  const [open, setOpen] = useState(isLast);
  const isNotDone = iteration.notDone === "yes";
  const delta = iteration.scoreDelta;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border">
          {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}

          <span className="text-sm font-medium w-20">
            Iter {iteration.iterationNumber}
          </span>

          {/* Score with icon */}
          <span className={`inline-flex items-center gap-1 tabular-nums text-sm font-medium ${
            iteration.scorePercent >= 80
              ? "text-green-600 dark:text-green-400"
              : iteration.scorePercent >= 60
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-red-600 dark:text-red-400"
          }`}>
            {iteration.scorePercent >= 80 ? <CheckCircle2 className="h-3 w-3" /> :
             iteration.scorePercent >= 60 ? <Target className="h-3 w-3" /> :
             <XCircle className="h-3 w-3" />}
            {iteration.scorePercent}%
          </span>

          {/* Delta */}
          {iteration.iterationNumber > 1 && (
            <span className={`inline-flex items-center gap-0.5 text-xs tabular-nums ${
              delta > 0 ? "text-green-600 dark:text-green-400" :
              delta < 0 ? "text-red-600 dark:text-red-400" :
              "text-muted-foreground"
            }`}>
              {delta > 0 ? <TrendingUp className="h-3 w-3" /> :
               delta < 0 ? <TrendingDown className="h-3 w-3" /> :
               <ArrowRight className="h-3 w-3" />}
              {delta > 0 ? "+" : ""}{delta}
            </span>
          )}

          {/* NOT_DONE badge */}
          {isNotDone && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
              <XCircle className="h-3 w-3" />
              NOT_DONE
            </span>
          )}

          <span className="flex-1" />

          {/* Duration */}
          {(iteration.generatorDurationMs || iteration.evaluatorDurationMs) && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {Math.round(((iteration.generatorDurationMs ?? 0) + (iteration.evaluatorDurationMs ?? 0)) / 1000)}s
            </span>
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-6 py-3 space-y-3 bg-muted/20 border-b border-border">
          {/* Score dimensions */}
          {iteration.scores?.dimensions && Object.keys(iteration.scores.dimensions).length > 0 && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Score Breakdown
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(iteration.scores.dimensions).map(([dim, score]) => (
                  <span key={dim} className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                    score >= 8 ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                    score >= 6 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                    "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                  }`}>
                    {dim}: {score}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Critique accountability */}
          {iteration.critiqueAccountability && (
            <div>
              <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Critique Accountability
              </h4>
              <p className="text-xs text-muted-foreground">
                <CheckCircle2 className="inline h-3 w-3 text-green-600 mr-1" />
                {iteration.critiqueAccountability.addressed}/{iteration.critiqueAccountability.total} addressed
                {iteration.critiqueAccountability.skipped.length > 0 && (
                  <span className="ml-2">
                    <XCircle className="inline h-3 w-3 text-red-600 mr-1" />
                    Skipped: {iteration.critiqueAccountability.skipped.join(", ")}
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Evaluator critique */}
          <div>
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Evaluator Critique
            </h4>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-60 overflow-y-auto rounded bg-muted/30 p-2">
              {iteration.evaluatorCritique.slice(0, 2000)}
              {iteration.evaluatorCritique.length > 2000 && "..."}
            </pre>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function TrainingRunDetail() {
  const { runId } = useParams<{ runId: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();
  const queryClient = useQueryClient();

  const { data: run, isLoading, error } = useQuery({
    queryKey: queryKeys.training.runDetail(runId!),
    queryFn: () => trainingApi.getRun(runId!),
    enabled: !!runId,
    refetchInterval: (query) => {
      const d = query.state.data;
      return d && (d.status === "pending" || d.status === "running") ? 5_000 : false;
    },
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/templates" },
      { label: "Agent Trainer", href: "/pipelines/training" },
      { label: run?.skillSlug ?? "Run Detail" },
    ]);
  }, [setBreadcrumbs, run?.skillSlug]);

  const applyMutation = useMutation({
    mutationFn: () => trainingApi.applyUpdate(runId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.training.runDetail(runId!) }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => trainingApi.rejectUpdate(runId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.training.runDetail(runId!) }),
  });

  const cancelMutation = useMutation({
    mutationFn: () => trainingApi.cancelRun(runId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.training.runDetail(runId!) }),
  });

  if (isLoading) return <PageSkeleton variant="detail" />;
  if (error) return (
    <Card><CardContent className="pt-6 text-sm text-destructive">
      {error instanceof Error ? error.message : "Failed to load training run"}
    </CardContent></Card>
  );
  if (!run) return <EmptyState icon={GraduationCap} message="Training run not found." />;

  const si = statusIcon(run.status);
  const StatusIcon = si.icon;
  const improvement = run.baselineScore != null && run.bestScore != null
    ? run.bestScore - run.baselineScore : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Training: {run.skillSlug}
          </h1>
          <p className="text-sm text-muted-foreground">
            {run.scenario?.slice(0, 120)}{(run.scenario?.length ?? 0) > 120 ? "..." : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 ${si.className}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{si.label}</span>
          </span>
          {(run.status === "pending" || run.status === "running") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        <MetricCard
          icon={Dumbbell}
          label="Iteration"
          value={`${run.currentIteration}/${run.maxIterations}`}
        />
        <MetricCard
          icon={Target}
          label="Threshold"
          value={`${run.convergenceThreshold}%`}
        />
        <MetricCard
          icon={Play}
          label="Baseline"
          value={run.baselineScore != null ? `${run.baselineScore}%` : "—"}
        />
        <MetricCard
          icon={TrendingUp}
          label="Best Score"
          value={run.bestScore != null ? `${run.bestScore}%` : "—"}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Improvement"
          value={improvement != null ? `+${improvement}pts` : "—"}
        />
      </div>

      {/* Error display */}
      {run.error && (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            <XCircle className="inline h-4 w-4 mr-1" />
            {run.error}
          </CardContent>
        </Card>
      )}

      {/* Proposed skill update (if converged) */}
      {run.proposedSkillUpdate && run.updateApplied === "pending" && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Proposed Skill Update
            </h3>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto rounded bg-muted/30 p-2">
              {run.proposedSkillUpdate.slice(0, 3000)}
              {run.proposedSkillUpdate.length > 3000 && "..."}
            </pre>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Apply Update
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
              >
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {run.updateApplied === "applied" && (
        <Card>
          <CardContent className="pt-6 text-sm">
            <CheckCircle2 className="inline h-4 w-4 mr-1 text-green-600" />
            Skill update applied successfully.
          </CardContent>
        </Card>
      )}

      {run.updateApplied === "rejected" && (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            <Ban className="inline h-4 w-4 mr-1" />
            Skill update was rejected.
          </CardContent>
        </Card>
      )}

      {/* Iterations timeline */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Iterations
        </h2>
        {(run.iterations ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No iterations recorded yet.</p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            {run.iterations.map((iter, i) => (
              <IterationRow
                key={iter.id}
                iteration={iter}
                isLast={i === run.iterations.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Created: {formatDateTime(run.createdAt)}</p>
        {run.startedAt && <p>Started: {formatDateTime(run.startedAt)}</p>}
        {run.finishedAt && <p>Finished: {formatDateTime(run.finishedAt)}</p>}
        <p>Source: {run.triggerSource}</p>
      </div>
    </div>
  );
}