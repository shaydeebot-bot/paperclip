import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router";
import {
  Ban,
  CheckCircle2,
  Clock,
  Dumbbell,
  GraduationCap,
  Play,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { trainingApi, type TrainingRun } from "../api/training";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTime } from "../lib/utils";

/** Status icon with text label (colorblind-safe: icon + text, never color alone). */
function TrainingStatusIcon({ status }: { status: TrainingRun["status"] }) {
  const map = {
    pending: { icon: Clock, label: "Pending", className: "text-yellow-600 dark:text-yellow-400" },
    running: { icon: Play, label: "Running", className: "text-cyan-600 dark:text-cyan-400" },
    converged: { icon: CheckCircle2, label: "Converged", className: "text-green-600 dark:text-green-400" },
    max_iterations: { icon: Target, label: "Max Iters", className: "text-orange-600 dark:text-orange-400" },
    failed: { icon: XCircle, label: "Failed", className: "text-red-600 dark:text-red-400" },
    cancelled: { icon: Ban, label: "Cancelled", className: "text-muted-foreground" },
  } as const;

  const entry = map[status] ?? map.pending;
  const Icon = entry.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 ${entry.className}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-xs font-medium">{entry.label}</span>
    </span>
  );
}

function ScoreDisplay({ score, threshold }: { score: number | null; threshold: number }) {
  if (score == null) return <span className="text-muted-foreground">—</span>;
  const passed = score >= threshold;
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums font-medium ${
      passed
        ? "text-green-600 dark:text-green-400"
        : "text-red-600 dark:text-red-400"
    }`}>
      {passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {score}%
    </span>
  );
}

export function TrainingRuns() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/templates" },
      { label: "Agent Trainer", href: "/pipelines/training" },
      { label: "Runs" },
    ]);
  }, [setBreadcrumbs]);

  const { data: runs, isLoading, error } = useQuery({
    queryKey: queryKeys.training.runs(selectedCompanyId!),
    queryFn: () => trainingApi.listRuns(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    refetchInterval: 10_000,
  });

  if (!selectedCompanyId) {
    return <EmptyState icon={GraduationCap} message="Select a company to view training runs." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Training Runs</h1>
        <p className="text-sm text-muted-foreground">
          Skill distillation sessions. Each run improves a skill via Generator/Evaluator iterations.
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load training runs"}
          </CardContent>
        </Card>
      ) : null}

      {(runs ?? []).length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Dumbbell}
            message="No training runs yet. Start a training session from Skill Health or Training Configs."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Skill</th>
                <th className="px-3 py-2 font-medium">Iteration</th>
                <th className="px-3 py-2 font-medium">Baseline</th>
                <th className="px-3 py-2 font-medium">Best</th>
                <th className="px-3 py-2 font-medium">Final</th>
                <th className="px-3 py-2 font-medium">Threshold</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {(runs ?? []).map((run) => (
                <tr
                  key={run.id}
                  className="align-middle border-b border-border transition-colors hover:bg-accent/50 last:border-b-0 cursor-pointer"
                  onClick={() => navigate(`/pipelines/training/${run.id}`)}
                >
                  <td className="px-3 py-2.5">
                    <TrainingStatusIcon status={run.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-medium">{run.skillSlug}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                    {run.currentIteration}/{run.maxIterations}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {run.baselineScore != null ? `${run.baselineScore}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {run.bestScore != null ? (
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        {run.bestScore}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <ScoreDisplay score={run.finalScore} threshold={run.convergenceThreshold} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                    {run.convergenceThreshold}%
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-xs">
                    {run.triggerSource}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {run.startedAt ? relativeTime(run.startedAt) : "Not started"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}