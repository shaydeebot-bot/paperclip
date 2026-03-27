import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  Shield,
  XCircle,
} from "lucide-react";
import { pipelinesApi, type PipelinePhase, type PipelineRunWithPhases } from "../api/pipelines";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { MetricCard } from "../components/MetricCard";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "../lib/utils";

interface AgentStats {
  agentRole: string;
  totalPhases: number;
  passed: number;
  failed: number;
  retries: number;
  avgScore: number | null;
  skillGatePasses: number;
  skillGateTotal: number;
}

export function PipelineQA() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/runs" },
      { label: "QA Dashboard" },
    ]);
  }, [setBreadcrumbs]);

  const { data: runs, isLoading, error } = useQuery({
    queryKey: queryKeys.pipelines.runs(selectedCompanyId!),
    queryFn: () => pipelinesApi.listRuns(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  // Fetch all run details to get phases
  const runIds = useMemo(() => (runs ?? []).slice(0, 20).map((r) => r.id), [runs]);
  const runDetailQueries = runIds.map((id) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: queryKeys.pipelines.runDetail(id),
      queryFn: () => pipelinesApi.getRun(id),
      enabled: !!id,
      staleTime: 60_000,
    }),
  );

  const allPhases = useMemo(() => {
    const phases: PipelinePhase[] = [];
    for (const q of runDetailQueries) {
      if (q.data?.phases) {
        phases.push(...q.data.phases);
      }
    }
    return phases;
  }, [runDetailQueries.map((q) => q.data).filter(Boolean).length]);

  // Aggregate by agent role
  const agentStats = useMemo(() => {
    const map = new Map<string, AgentStats>();

    for (const phase of allPhases) {
      const role = phase.phaseKey;
      let stats = map.get(role);
      if (!stats) {
        stats = {
          agentRole: role,
          totalPhases: 0,
          passed: 0,
          failed: 0,
          retries: 0,
          avgScore: null,
          skillGatePasses: 0,
          skillGateTotal: 0,
        };
        map.set(role, stats);
      }

      stats.totalPhases++;
      if (phase.status === "passed") stats.passed++;
      if (phase.status === "failed") stats.failed++;
      if (phase.attempt > 1) stats.retries += phase.attempt - 1;
      if (phase.skillGateResult != null) {
        stats.skillGateTotal++;
        if (phase.skillGateResult.ok) stats.skillGatePasses++;
      }

      // Accumulate scores for averaging
      if (phase.scores?._total != null) {
        if (stats.avgScore == null) {
          stats.avgScore = phase.scores._total;
        } else {
          // Running average
          const prevCount = stats.totalPhases - 1;
          stats.avgScore = (stats.avgScore * prevCount + phase.scores._total) / stats.totalPhases;
        }
      }
    }

    return [...map.values()].sort((a, b) => b.totalPhases - a.totalPhases);
  }, [allPhases]);

  // Global stats
  const globalStats = useMemo(() => {
    const total = allPhases.length;
    const passed = allPhases.filter((p) => p.status === "passed").length;
    const failed = allPhases.filter((p) => p.status === "failed").length;
    const gateTotal = allPhases.filter((p) => p.skillGateResult != null).length;
    const gatePassed = allPhases.filter((p) => p.skillGateResult?.ok).length;
    const retries = allPhases.filter((p) => p.attempt > 1).length;

    // Collect retry reasons
    const retryReasonCounts = new Map<string, number>();
    for (const phase of allPhases) {
      if (phase.attempt > 1 && phase.skillGateResult && !phase.skillGateResult.ok) {
        for (const skill of phase.skillGateResult.missingSkills) {
          retryReasonCounts.set(skill, (retryReasonCounts.get(skill) ?? 0) + 1);
        }
      }
    }
    const topRetryReasons = [...retryReasonCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return { total, passed, failed, gateTotal, gatePassed, retries, topRetryReasons };
  }, [allPhases]);

  if (!selectedCompanyId) {
    return <EmptyState icon={Shield} message="Select a company to view QA dashboard." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  const anyLoading = runDetailQueries.some((q) => q.isLoading);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">QA Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Aggregated quality metrics across pipeline runs.
          {anyLoading && " Loading run details..."}
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load runs"}
          </CardContent>
        </Card>
      ) : null}

      {/* Global metrics */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="border border-border">
          <MetricCard
            icon={CheckCircle2}
            value={globalStats.total > 0 ? `${Math.round((globalStats.passed / globalStats.total) * 100)}%` : "—"}
            label="Phase Pass Rate"
            description={`${globalStats.passed} of ${globalStats.total} phases`}
          />
        </div>
        <div className="border border-border">
          <MetricCard
            icon={Shield}
            value={globalStats.gateTotal > 0 ? `${Math.round((globalStats.gatePassed / globalStats.gateTotal) * 100)}%` : "—"}
            label="Skill Gate Pass Rate"
            description={`${globalStats.gatePassed} of ${globalStats.gateTotal} gates`}
          />
        </div>
        <div className="border border-border">
          <MetricCard
            icon={RefreshCcw}
            value={globalStats.retries}
            label="Total Retries"
          />
        </div>
        <div className="border border-border">
          <MetricCard
            icon={XCircle}
            value={globalStats.failed}
            label="Failed Phases"
          />
        </div>
      </div>

      {/* Agent breakdown table */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Per-Phase Breakdown
        </h2>

        {agentStats.length === 0 ? (
          <div className="py-8">
            <EmptyState icon={Shield} message="No phase data available yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-3 py-2 font-medium">Phase</th>
                  <th className="px-3 py-2 font-medium">Total Runs</th>
                  <th className="px-3 py-2 font-medium">Pass Rate</th>
                  <th className="px-3 py-2 font-medium">Gate Pass Rate</th>
                  <th className="px-3 py-2 font-medium">Avg Score</th>
                  <th className="px-3 py-2 font-medium">Retries</th>
                </tr>
              </thead>
              <tbody>
                {agentStats.map((stats) => {
                  const passRate = stats.totalPhases > 0
                    ? Math.round((stats.passed / stats.totalPhases) * 100)
                    : 0;
                  const gateRate = stats.skillGateTotal > 0
                    ? Math.round((stats.skillGatePasses / stats.skillGateTotal) * 100)
                    : null;

                  return (
                    <tr key={stats.agentRole} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-2.5 font-medium">{stats.agentRole}</td>
                      <td className="px-3 py-2.5 text-muted-foreground tabular-nums">{stats.totalPhases}</td>
                      <td className="px-3 py-2.5">
                        <span className={cn(
                          "inline-flex items-center gap-1 tabular-nums",
                          passRate >= 80 ? "text-green-600 dark:text-green-400" :
                          passRate >= 50 ? "text-yellow-600 dark:text-yellow-400" :
                          "text-red-600 dark:text-red-400"
                        )}>
                          {passRate >= 80 ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                          {passRate}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                        {gateRate != null ? (
                          <span className={cn(
                            "inline-flex items-center gap-1",
                            gateRate >= 80 ? "text-green-600 dark:text-green-400" :
                            gateRate >= 50 ? "text-yellow-600 dark:text-yellow-400" :
                            "text-red-600 dark:text-red-400"
                          )}>
                            {gateRate}%
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {stats.avgScore != null ? (
                          <span className={cn(
                            stats.avgScore >= 80 ? "text-green-600 dark:text-green-400" :
                            stats.avgScore >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                            "text-red-600 dark:text-red-400"
                          )}>
                            {Math.round(stats.avgScore)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                        {stats.retries > 0 ? (
                          <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                            <RefreshCcw className="h-3 w-3" /> {stats.retries}
                          </span>
                        ) : "0"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top retry reasons */}
      {globalStats.topRetryReasons.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Most Common Retry Reasons (Missing Skills)
          </h2>
          <div className="border border-border">
            {globalStats.topRetryReasons.map(([skill, count]) => (
              <div key={skill} className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-b-0">
                <code className="text-xs rounded bg-red-50 px-1.5 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  {skill}
                </code>
                <span className="text-xs text-muted-foreground tabular-nums">{count} occurrence{count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
