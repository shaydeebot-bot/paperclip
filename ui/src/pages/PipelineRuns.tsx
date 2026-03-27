import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  CircleDot,
  Clock,
  Play,
  XCircle,
} from "lucide-react";
import { pipelinesApi, type PipelineRun } from "../api/pipelines";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTime } from "../lib/utils";

/** Status icon with text label for accessibility (colorblind-safe). */
function RunStatusIcon({ status }: { status: PipelineRun["status"] }) {
  const map = {
    pending: { icon: Clock, label: "Pending", className: "text-yellow-600 dark:text-yellow-400" },
    running: { icon: Play, label: "Running", className: "text-cyan-600 dark:text-cyan-400" },
    completed: { icon: CheckCircle2, label: "Completed", className: "text-green-600 dark:text-green-400" },
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

export function PipelineRuns() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/runs" },
      { label: "Runs" },
    ]);
  }, [setBreadcrumbs]);

  const { data: runs, isLoading, error } = useQuery({
    queryKey: queryKeys.pipelines.runs(selectedCompanyId!),
    queryFn: () => pipelinesApi.listRuns(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    refetchInterval: 10_000,
  });

  const { data: templates } = useQuery({
    queryKey: queryKeys.pipelines.templates(selectedCompanyId!),
    queryFn: () => pipelinesApi.listTemplates(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const templateById = useMemo(
    () => new Map((templates ?? []).map((t) => [t.id, t])),
    [templates],
  );

  if (!selectedCompanyId) {
    return <EmptyState icon={Play} message="Select a company to view pipeline runs." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Runs</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline execution history. Click a run to view phase-by-phase detail.
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load runs"}
          </CardContent>
        </Card>
      ) : null}

      {(runs ?? []).length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Play}
            message="No pipeline runs yet. Start a run from a template to begin."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Template</th>
                <th className="px-3 py-2 font-medium">Current Phase</th>
                <th className="px-3 py-2 font-medium">Retries</th>
                <th className="px-3 py-2 font-medium">Gate Failures</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {(runs ?? []).map((run) => {
                const template = templateById.get(run.templateId);
                return (
                  <tr
                    key={run.id}
                    className="align-middle border-b border-border transition-colors hover:bg-accent/50 last:border-b-0 cursor-pointer"
                    onClick={() => navigate(`/pipelines/runs/${run.id}`)}
                  >
                    <td className="px-3 py-2.5">
                      <RunStatusIcon status={run.status} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium">
                        {run.name ?? run.id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {template?.name ?? "Unknown"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {run.currentPhaseKey ?? (run.status === "completed" ? "Done" : "—")}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                      {run.totalRetries > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                          {run.totalRetries}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                      {run.totalSkillGateFailures > 0 ? (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                          <XCircle className="h-3 w-3" />
                          {run.totalSkillGateFailures}
                        </span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground text-xs">
                      {run.triggerSource ?? "manual"}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {run.startedAt ? relativeTime(run.startedAt) : "Not started"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
