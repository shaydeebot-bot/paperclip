import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@/lib/router";
import { Layers, Play, Plus } from "lucide-react";
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
  const queryClient = useQueryClient();
  const [runDialogTemplateId, setRunDialogTemplateId] = useState<string | null>(null);
  const [runName, setRunName] = useState("");
  const [inputContext, setInputContext] = useState("");

  const startRun = useMutation({
    mutationFn: async (template: PipelineTemplate) => {
      const name = runName.trim() || `${template.name} — ${new Date().toLocaleString()}`;
      const run = await pipelinesApi.startRun(selectedCompanyId!, {
        templateId: template.id,
        name,
        inputContext: inputContext.trim() ? { task: inputContext.trim() } : undefined,
        triggerSource: "ui",
      });
      await pipelinesApi.executeRun(run.id);
      return run;
    },
    onSuccess: (run) => {
      setRunDialogTemplateId(null);
      setRunName("");
      setInputContext("");
      queryClient.invalidateQueries({ queryKey: queryKeys.pipelines.runs(selectedCompanyId!) });
      navigate(`/pipelines/runs/${run.id}`);
    },
  });

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
                <th className="px-3 py-2 font-medium w-20"></th>
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
                  <td className="px-3 py-2.5">
                    <button
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRunDialogTemplateId(template.id);
                      }}
                    >
                      <Play className="h-3 w-3" />
                      Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {runDialogTemplateId && (() => {
            const tmpl = activeTemplates.find((t) => t.id === runDialogTemplateId);
            if (!tmpl) return null;
            return (
              <Card className="mt-4">
                <CardContent className="pt-5 space-y-3">
                  <h3 className="text-sm font-medium">
                    Start run — {tmpl.name}
                  </h3>
                  <input
                    type="text"
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder={`Run name (defaults to "${tmpl.name} — timestamp")`}
                    value={runName}
                    onChange={(e) => setRunName(e.target.value)}
                    autoFocus
                  />
                  <textarea
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px] resize-y"
                    placeholder="What should this pipeline build? (optional)"
                    value={inputContext}
                    onChange={(e) => setInputContext(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                      disabled={startRun.isPending}
                      onClick={() => startRun.mutate(tmpl)}
                    >
                      <Play className="h-3 w-3" />
                      {startRun.isPending ? "Starting..." : "Start"}
                    </button>
                    <button
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors"
                      onClick={() => { setRunDialogTemplateId(null); setRunName(""); setInputContext(""); }}
                    >
                      Cancel
                    </button>
                  </div>
                  {startRun.isError && (
                    <p className="text-xs text-destructive">
                      {startRun.error instanceof Error ? startRun.error.message : "Failed to start run"}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
}
