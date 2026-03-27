import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const startTraining = useMutation({
    mutationFn: (skillSlug: string) =>
      trainingApi.startRun(selectedCompanyId!, { skillSlug }),
    onSuccess: (run) => {
      setShowStartDialog(false);
      setSkillInput("");
      queryClient.invalidateQueries({ queryKey: queryKeys.training.runs(selectedCompanyId!) });
      navigate(`/pipelines/training/${run.id}`);
    },
  });

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
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Training Runs</h1>
          <p className="text-sm text-muted-foreground">
            Skill distillation sessions. Each run improves a skill via Generator/Evaluator iterations.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          onClick={() => setShowStartDialog(true)}
        >
          <Dumbbell className="h-3.5 w-3.5" />
          Start Training
        </button>
      </div>

      {showStartDialog && (
        <Card>
          <CardContent className="pt-5 space-y-3">
            <h3 className="text-sm font-medium">Start a new training run</h3>
            <p className="text-xs text-muted-foreground">
              Enter the skill slug to train. The Generator/Evaluator loop will run automatically.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="e.g. frontend-design, vibe-marketing, spec-handoff"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && skillInput.trim()) {
                    startTraining.mutate(skillInput.trim());
                  }
                }}
                autoFocus
              />
              <button
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={!skillInput.trim() || startTraining.isPending}
                onClick={() => startTraining.mutate(skillInput.trim())}
              >
                <Play className="h-3 w-3" />
                {startTraining.isPending ? "Starting..." : "Train"}
              </button>
              <button
                className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                onClick={() => { setShowStartDialog(false); setSkillInput(""); }}
              >
                Cancel
              </button>
            </div>
            {startTraining.isError && (
              <p className="text-xs text-destructive">
                {startTraining.error instanceof Error ? startTraining.error.message : "Failed to start training"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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