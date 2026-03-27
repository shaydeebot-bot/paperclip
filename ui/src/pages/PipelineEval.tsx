import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import { pipelinesApi, type PipelineRunWithPhases } from "../api/pipelines";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { MetricCard } from "../components/MetricCard";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime, relativeTime } from "../lib/utils";

interface ScoreTrend {
  phaseKey: string;
  scores: Array<{ runId: string; score: number; timestamp: string }>;
  latestScore: number;
  trend: "up" | "down" | "stable";
  change: number;
}

export function PipelineEval() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/runs" },
      { label: "Eval Dashboard" },
    ]);
  }, [setBreadcrumbs]);

  const { data: runs, isLoading, error } = useQuery({
    queryKey: queryKeys.pipelines.runs(selectedCompanyId!),
    queryFn: () => pipelinesApi.listRuns(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  // Fetch recent run details for eval data
  const completedRuns = useMemo(
    () => (runs ?? []).filter((r) => r.status === "completed").slice(0, 20),
    [runs],
  );

  const completedRunIds = useMemo(() => completedRuns.map((r) => r.id), [completedRuns]);
  const { data: runDetails, isLoading: detailsLoading } = useQuery({
    queryKey: [...queryKeys.pipelines.runs(selectedCompanyId!), "eval-details", ...completedRunIds],
    queryFn: () => Promise.all(completedRunIds.map((id) => pipelinesApi.getRun(id))),
    enabled: completedRunIds.length > 0,
    staleTime: 60_000,
  });

  // Build score trends per phase
  const scoreTrends = useMemo(() => {
    const phaseScores = new Map<string, Array<{ runId: string; score: number; timestamp: string }>>();

    for (const run of runDetails ?? []) {
      if (!run?.phases) continue;
      for (const phase of run.phases) {
        if (phase.scores?._total == null) continue;
        const entries = phaseScores.get(phase.phaseKey) ?? [];
        entries.push({
          runId: run.id,
          score: phase.scores._total,
          timestamp: phase.finishedAt ?? phase.createdAt,
        });
        phaseScores.set(phase.phaseKey, entries);
      }
    }

    const trends: ScoreTrend[] = [];
    for (const [phaseKey, scores] of phaseScores) {
      const sorted = scores.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );
      const latest = sorted[sorted.length - 1]?.score ?? 0;
      const previous = sorted.length >= 2 ? sorted[sorted.length - 2]?.score ?? latest : latest;
      const change = latest - previous;
      const trend: "up" | "down" | "stable" = change > 2 ? "up" : change < -2 ? "down" : "stable";

      trends.push({ phaseKey, scores: sorted, latestScore: latest, trend, change });
    }

    return trends.sort((a, b) => a.phaseKey.localeCompare(b.phaseKey));
  }, [runDetails]);

  // Collect eval results from runs that have them
  const evalPatterns = useMemo(() => {
    const weaknesses: Array<{ category: string; avgScore: number; threshold: number; count: number }> = [];
    const improvements: Array<{ category: string; scores: number[] }> = [];
    const candidates: Array<{ skill: string; agent: string; reason: string }> = [];

    for (const run of runDetails ?? []) {
      if (!run?.evalResults?.patterns) continue;
      const patterns = run.evalResults.patterns;

      if (patterns.recurringWeaknesses) {
        for (const w of patterns.recurringWeaknesses) {
          weaknesses.push({
            category: w.category,
            avgScore: w.avgScore,
            threshold: w.threshold,
            count: w.runsBelowThreshold,
          });
        }
      }
      if (patterns.improvements) {
        for (const imp of patterns.improvements) {
          improvements.push({ category: imp.category, scores: imp.scores });
        }
      }
      if (patterns.skillImprovementCandidates) {
        for (const c of patterns.skillImprovementCandidates) {
          candidates.push(c);
        }
      }
    }

    // Deduplicate
    const uniqueWeaknesses = [...new Map(weaknesses.map((w) => [w.category, w])).values()];
    const uniqueImprovements = [...new Map(improvements.map((i) => [i.category, i])).values()];
    const uniqueCandidates = [...new Map(candidates.map((c) => [`${c.skill}:${c.agent}`, c])).values()];

    return { weaknesses: uniqueWeaknesses, improvements: uniqueImprovements, candidates: uniqueCandidates };
  }, [runDetails]);

  if (!selectedCompanyId) {
    return <EmptyState icon={BarChart3} message="Select a company to view eval dashboard." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  const anyLoading = detailsLoading;
  const avgLatestScore = scoreTrends.length > 0
    ? Math.round(scoreTrends.reduce((sum, t) => sum + t.latestScore, 0) / scoreTrends.length)
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Eval Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Score trends, pattern detection, and threshold adjustments across pipeline runs.
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

      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <div className="border border-border">
          <MetricCard
            icon={BarChart3}
            value={completedRuns.length}
            label="Completed Runs"
          />
        </div>
        <div className="border border-border">
          <MetricCard
            icon={TrendingUp}
            value={avgLatestScore != null ? `${avgLatestScore}/100` : "—"}
            label="Avg Latest Score"
          />
        </div>
        <div className="border border-border">
          <MetricCard
            icon={AlertTriangle}
            value={evalPatterns.weaknesses.length}
            label="Recurring Weaknesses"
          />
        </div>
        <div className="border border-border">
          <MetricCard
            icon={ArrowUp}
            value={evalPatterns.improvements.length}
            label="Improving Categories"
          />
        </div>
      </div>

      {/* Score trends table */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Score Trends by Phase
        </h2>

        {scoreTrends.length === 0 ? (
          <div className="py-8">
            <EmptyState icon={BarChart3} message="No scored phases available yet." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-3 py-2 font-medium">Phase</th>
                  <th className="px-3 py-2 font-medium">Latest Score</th>
                  <th className="px-3 py-2 font-medium">Trend</th>
                  <th className="px-3 py-2 font-medium">Change</th>
                  <th className="px-3 py-2 font-medium">History (last 5)</th>
                </tr>
              </thead>
              <tbody>
                {scoreTrends.map((trend) => (
                  <tr key={trend.phaseKey} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2.5 font-medium">{trend.phaseKey}</td>
                    <td className="px-3 py-2.5 tabular-nums">
                      <span className={cn(
                        "font-semibold",
                        trend.latestScore >= 80 ? "text-green-600 dark:text-green-400" :
                        trend.latestScore >= 60 ? "text-yellow-600 dark:text-yellow-400" :
                        "text-red-600 dark:text-red-400"
                      )}>
                        {trend.latestScore}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {trend.trend === "up" && (
                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ArrowUp className="h-3.5 w-3.5" /> Improving
                        </span>
                      )}
                      {trend.trend === "down" && (
                        <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                          <ArrowDown className="h-3.5 w-3.5" /> Declining
                        </span>
                      )}
                      {trend.trend === "stable" && (
                        <span className="text-muted-foreground">Stable</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 tabular-nums">
                      <span className={cn(
                        trend.change > 0 ? "text-green-600 dark:text-green-400" :
                        trend.change < 0 ? "text-red-600 dark:text-red-400" :
                        "text-muted-foreground"
                      )}>
                        {trend.change > 0 ? "+" : ""}{trend.change}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {trend.scores.slice(-5).map((s, i) => (
                          <span
                            key={i}
                            className={cn(
                              "inline-flex items-center justify-center h-6 w-8 rounded text-xs font-medium tabular-nums",
                              s.score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                              s.score >= 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                              "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                            )}
                            title={`Score: ${s.score} (${formatDateTime(s.timestamp)})`}
                          >
                            {s.score}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recurring weaknesses */}
      {evalPatterns.weaknesses.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Recurring Weaknesses
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Avg Score</th>
                  <th className="px-3 py-2 font-medium">Threshold</th>
                  <th className="px-3 py-2 font-medium">Runs Below</th>
                </tr>
              </thead>
              <tbody>
                {evalPatterns.weaknesses.map((w) => (
                  <tr key={w.category} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-2.5 font-medium">{w.category}</td>
                    <td className="px-3 py-2.5 tabular-nums text-red-600 dark:text-red-400">
                      <span className="inline-flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> {Math.round(w.avgScore)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{w.threshold}</td>
                    <td className="px-3 py-2.5 tabular-nums text-muted-foreground">{w.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Skill improvement candidates */}
      {evalPatterns.candidates.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Skill Improvement Candidates
          </h2>
          <div className="border border-border">
            {evalPatterns.candidates.map((c, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-orange-500" />
                <div className="text-sm">
                  <p>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{c.skill}</code>
                    {" "}for agent <span className="font-medium">{c.agent}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improving categories */}
      {evalPatterns.improvements.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Improving Categories
          </h2>
          <div className="border border-border">
            {evalPatterns.improvements.map((imp) => (
              <div key={imp.category} className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-b-0">
                <span className="flex items-center gap-2">
                  <ArrowUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-sm">{imp.category}</span>
                </span>
                <div className="flex items-center gap-1">
                  {imp.scores.slice(-5).map((score, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-flex items-center justify-center h-6 w-8 rounded text-xs font-medium tabular-nums",
                        score >= 80 ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" :
                        score >= 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" :
                        "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                      )}
                    >
                      {score}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
