import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  GraduationCap,
  Settings2,
  Target,
} from "lucide-react";
import { trainingApi, type TrainingConfig } from "../api/training";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTime } from "../lib/utils";

export function TrainingConfigs() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/templates" },
      { label: "Agent Trainer", href: "/pipelines/training" },
      { label: "Configs" },
    ]);
  }, [setBreadcrumbs]);

  const { data: configs, isLoading, error } = useQuery({
    queryKey: queryKeys.training.configs(selectedCompanyId!),
    queryFn: () => trainingApi.listConfigs(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  if (!selectedCompanyId) {
    return <EmptyState icon={Settings2} message="Select a company to view training configs." />;
  }

  if (isLoading) return <PageSkeleton variant="list" />;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Training Configs</h1>
        <p className="text-sm text-muted-foreground">
          Reusable evaluator instructions and generator scenarios per skill.
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load configs"}
          </CardContent>
        </Card>
      ) : null}

      {(configs ?? []).length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={BookOpen}
            message="No training configs yet. Configs are created when training a skill for the first time."
          />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {(configs ?? []).map((config) => (
            <ConfigCard key={config.id} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigCard({ config }: { config: TrainingConfig }) {
  const rubricDims = config.rubric?.dimensions ?? [];
  return (
    <Card className="hover:bg-accent/30 transition-colors">
      <CardContent className="pt-6 space-y-3">
        <div>
          <h3 className="font-medium text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            {config.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Skill: <span className="font-medium">{config.skillSlug}</span>
          </p>
        </div>

        {config.description && (
          <p className="text-xs text-muted-foreground">{config.description}</p>
        )}

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Target className="h-3 w-3" />
            Threshold: {config.convergenceThreshold}%
          </span>
          <span className="text-muted-foreground">
            Max: {config.maxIterations} iters
          </span>
          <span className="text-muted-foreground">
            Scenarios: {(config.generatorScenarios ?? []).length}
          </span>
        </div>

        {rubricDims.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rubricDims.map((dim) => (
              <span
                key={dim.name}
                className="inline-block rounded px-1.5 py-0.5 text-xs bg-muted text-muted-foreground"
              >
                {dim.name} ({dim.weight}x)
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Updated {relativeTime(config.updatedAt)}
        </p>
      </CardContent>
    </Card>
  );
}