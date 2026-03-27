import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { trainingApi, type SkillHealth as SkillHealthType } from "../api/training";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { MetricCard } from "../components/MetricCard";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTime } from "../lib/utils";

function TrendIcon({ trend }: { trend: SkillHealthType["trend"] }) {
  const map = {
    improving: { icon: TrendingUp, label: "Improving", className: "text-green-600 dark:text-green-400" },
    stable: { icon: ArrowRight, label: "Stable", className: "text-muted-foreground" },
    degrading: { icon: TrendingDown, label: "Degrading", className: "text-red-600 dark:text-red-400" },
    unknown: { icon: Activity, label: "Unknown", className: "text-muted-foreground" },
  } as const;
  const entry = map[trend] ?? map.unknown;
  const Icon = entry.icon;
  return (
    <span className={`inline-flex items-center gap-1 ${entry.className}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="text-xs font-medium">{entry.label}</span>
    </span>
  );
}

function ScoreBar({ score, label }: { score: number | null; label: string }) {
  if (score == null) return null;
  const width = Math.min(Math.max(score, 0), 100);
  const colorClass = score >= 80
    ? "bg-green-500 dark:bg-green-400"
    : score >= 60
      ? "bg-yellow-500 dark:bg-yellow-400"
      : "bg-red-500 dark:bg-red-400";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-16">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs tabular-nums font-medium w-10 text-right">
        {score >= 80 ? <CheckCircle2 className="inline h-3 w-3 text-green-600 mr-0.5" /> :
         score < 60 ? <XCircle className="inline h-3 w-3 text-red-600 mr-0.5" /> : null}
        {score}%
      </span>
    </div>
  );
}

export function SkillHealth() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/templates" },
      { label: "Agent Trainer", href: "/pipelines/training" },
      { label: "Skill Health" },
    ]);
  }, [setBreadcrumbs]);

  const { data: health, isLoading, error } = useQuery({
    queryKey: queryKeys.training.skillHealth(selectedCompanyId!),
    queryFn: () => trainingApi.getSkillHealth(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const stats = useMemo(() => {
    if (!health || health.length === 0) return null;
    const scored = health.filter((h) => h.latestScore != null);
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((s, h) => s + (h.latestScore ?? 0), 0) / scored.length)
      : 0;
    const improving = health.filter((h) => h.trend === "improving").length;
    const degrading = health.filter((h) => h.trend === "degrading").length;
    return { total: health.length, avgScore, improving, degrading };
  }, [health]);

  if (!selectedCompanyId) {
    return <EmptyState icon={HeartPulse} message="Select a company to view skill health." />;
  }

  if (isLoading) return <PageSkeleton variant="list" />;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Skill Health</h1>
        <p className="text-sm text-muted-foreground">
          Current scores, trends, and training history for all skills.
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load skill health"}
          </CardContent>
        </Card>
      ) : null}

      {stats && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <MetricCard icon={Dumbbell} label="Skills Tracked" value={String(stats.total)} />
          <MetricCard icon={GraduationCap} label="Avg Score" value={`${stats.avgScore}%`} />
          <MetricCard icon={TrendingUp} label="Improving" value={String(stats.improving)} />
          <MetricCard icon={TrendingDown} label="Degrading" value={String(stats.degrading)} />
        </div>
      )}

      {(health ?? []).length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={HeartPulse}
            message="No training data yet. Train a skill to see health metrics."
          />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(health ?? []).map((skill) => (
            <Card
              key={skill.skillSlug}
              className="hover:bg-accent/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/pipelines/training?skill=${encodeURIComponent(skill.skillSlug)}`)}
            >
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{skill.skillSlug}</h3>
                  <TrendIcon trend={skill.trend} />
                </div>

                <div className="space-y-1.5">
                  <ScoreBar score={skill.latestScore} label="Latest" />
                  <ScoreBar score={skill.bestScore} label="Best" />
                  <ScoreBar score={skill.baselineScore} label="Baseline" />
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {skill.totalRuns} run{skill.totalRuns !== 1 ? "s" : ""}
                    {skill.improvement != null && (
                      <span className={skill.improvement > 0 ? "text-green-600 dark:text-green-400 ml-1" : "ml-1"}>
                        {skill.improvement > 0 ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : null}
                        {skill.improvement > 0 ? "+" : ""}{skill.improvement}pts
                      </span>
                    )}
                  </span>
                  <span>
                    {skill.lastTrainedAt ? `Last: ${relativeTime(skill.lastTrainedAt)}` : "Never trained"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}