import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router";
import { Layers, Plus } from "lucide-react";
import { pipelinesApi, type PipelineTemplate } from "../api/pipelines";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { queryKeys } from "../lib/queryKeys";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/PageSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { relativeTime } from "../lib/utils";

export function PipelineTemplates() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Pipelines", href: "/pipelines/templates" },
      { label: "Templates" },
    ]);
  }, [setBreadcrumbs]);

  const { data: templates, isLoading, error } = useQuery({
    queryKey: queryKeys.pipelines.templates(selectedCompanyId!),
    queryFn: () => pipelinesApi.listTemplates(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const activeTemplates = useMemo(
    () => (templates ?? []).filter((t) => t.status === "active"),
    [templates],
  );

  if (!selectedCompanyId) {
    return <EmptyState icon={Layers} message="Select a company to view pipeline templates." />;
  }

  if (isLoading) {
    return <PageSkeleton variant="list" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          <p className="text-sm text-muted-foreground">
            Pipeline templates define phase sequences, agent assignments, and quality gates.
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          New template
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load templates"}
          </CardContent>
        </Card>
      ) : null}

      {activeTemplates.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Layers}
            message="No pipeline templates yet. Create one to define an orchestrated multi-agent workflow."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b border-border">
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Slug</th>
                <th className="px-3 py-2 font-medium">Phases</th>
                <th className="px-3 py-2 font-medium">QA Threshold</th>
                <th className="px-3 py-2 font-medium">Max Retries</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {activeTemplates.map((template) => (
                <tr
                  key={template.id}
                  className="align-middle border-b border-border transition-colors hover:bg-accent/50 last:border-b-0 cursor-pointer"
                  onClick={() => navigate(`/pipelines/templates/${template.id}`)}
                >
                  <td className="px-3 py-2.5">
                    <div className="min-w-[180px]">
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-xs">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <code className="text-xs text-muted-foreground">{template.slug}</code>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {template.phases.length} phase{template.phases.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                    {template.defaultQaThreshold}%
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground tabular-nums">
                    {template.defaultMaxRetries}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={template.status} />
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {relativeTime(template.updatedAt)}
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
