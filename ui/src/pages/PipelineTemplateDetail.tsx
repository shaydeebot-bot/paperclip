import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@/lib/router";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  RefreshCcw,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { pipelinesApi } from "../api/pipelines";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

export function PipelineTemplateDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const { setBreadcrumbs } = useBreadcrumbs();

  const { data: template, isLoading, error } = useQuery({
    queryKey: queryKeys.pipelines.templateDetail(templateId!),
    queryFn: () => pipelinesApi.getTemplate(templateId!),
    enabled: !!templateId,
  });

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/templates" },
      { label: "Templates", href: "/pipelines/templates" },
      { label: template?.name ?? "Template" },
    ]);
  }, [setBreadcrumbs, template?.name]);

  if (isLoading) {
    return <PageSkeleton variant="detail" />;
  }

  if (error || !template) {
    return (
      <EmptyState
        icon={Layers}
        message={error instanceof Error ? error.message : "Template not found."}
      />
    );
  }

  // Build a dependency graph to show execution order
  const phasesByKey = useMemo(
    () => new Map(template.phases.map((p) => [p.key, p])),
    [template.phases],
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{template.name}</h1>
        {template.description && (
          <p className="text-sm text-muted-foreground">{template.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
          <span>Slug: <code>{template.slug}</code></span>
          <span>QA Threshold: {template.defaultQaThreshold}%</span>
          <span>Max Retries: {template.defaultMaxRetries}</span>
          <span>Created: {formatDate(template.createdAt)}</span>
        </div>
      </div>

      {/* Phase list */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Phases ({template.phases.length})
        </h2>

        <div className="space-y-2">
          {template.phases.map((phase, index) => (
            <div
              key={phase.key}
              className="border border-border p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-xs font-medium tabular-nums">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{phase.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Key: <code>{phase.key}</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {phase.parallel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      <Zap className="h-3 w-3" /> Parallel
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                {/* Agent role */}
                <div className="flex items-start gap-2">
                  <User className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-muted-foreground">Agent Role</p>
                    <p>{phase.agentRole}</p>
                  </div>
                </div>

                {/* Dependencies */}
                <div className="flex items-start gap-2">
                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-muted-foreground">Depends On</p>
                    <p>
                      {phase.dependsOn.length > 0
                        ? phase.dependsOn
                            .map((dep) => phasesByKey.get(dep)?.name ?? dep)
                            .join(", ")
                        : "None"}
                    </p>
                  </div>
                </div>

                {/* QA */}
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-muted-foreground">QA Threshold</p>
                    <p>{phase.qaThreshold ?? template.defaultQaThreshold}%</p>
                  </div>
                </div>

                {/* Retries */}
                <div className="flex items-start gap-2">
                  <RefreshCcw className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-muted-foreground">Max Retries</p>
                    <p>{phase.maxRetries ?? template.defaultMaxRetries}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              {(phase.skills.required.length > 0 || phase.skills.recommended.length > 0) && (
                <div className="flex items-start gap-2 text-xs">
                  <Shield className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="space-y-1">
                    {phase.skills.required.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground">Required: </span>
                        {phase.skills.required.map((skill) => (
                          <code
                            key={skill}
                            className="mr-1.5 rounded bg-red-50 px-1.5 py-0.5 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          >
                            {skill}
                          </code>
                        ))}
                      </div>
                    )}
                    {phase.skills.recommended.length > 0 && (
                      <div>
                        <span className="font-medium text-muted-foreground">Recommended: </span>
                        {phase.skills.recommended.map((skill) => (
                          <code
                            key={skill}
                            className="mr-1.5 rounded bg-muted px-1.5 py-0.5 text-muted-foreground"
                          >
                            {skill}
                          </code>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Closed-loop signals */}
              {phase.onComplete?.createIssues && (
                <div className="text-xs text-muted-foreground border-t border-border/60 pt-2">
                  Auto-creates issues on completion
                  {phase.onComplete.issueOnScoreBelow != null && (
                    <> when score &lt; {phase.onComplete.issueOnScoreBelow}</>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
