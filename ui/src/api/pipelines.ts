import { api } from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PipelinePhaseDefinition {
  key: string;
  name: string;
  agentRole: string;
  agentId?: string;
  dependsOn: string[];
  parallel?: boolean;
  skills: {
    required: string[];
    recommended: string[];
  };
  qaThreshold?: number;
  maxRetries?: number;
  timeoutMs?: number;
  onComplete?: {
    createIssues?: boolean;
    issueDefaults?: {
      priority?: string;
      assigneeAgentRole?: string;
      assigneeAgentId?: string;
      titlePrefix?: string;
    };
    issueOnScoreBelow?: number;
  };
}

export interface PipelineTemplate {
  id: string;
  companyId: string;
  slug: string;
  name: string;
  description: string | null;
  phases: PipelinePhaseDefinition[];
  signalConfig: Record<string, unknown> | null;
  defaultQaThreshold: number;
  defaultMaxRetries: number;
  status: "active" | "archived";
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SkillGateResult {
  ok: boolean;
  hasPlanned: boolean;
  hasUsed: boolean;
  missingSkills: string[];
  reason?: string | null;
}

export interface PipelinePhase {
  id: string;
  companyId: string;
  runId: string;
  phaseKey: string;
  phaseName: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped" | "cancelled";
  agentId: string | null;
  heartbeatRunId: string | null;
  attempt: number;
  retryOfPhaseId: string | null;
  taskPrompt: string | null;
  agentOutput: string | null;
  skillGateResult: SkillGateResult | null;
  scores: Record<string, number> | null;
  qaThreshold: number | null;
  qaPassed: "yes" | "no" | null;
  requiredSkills: string[] | null;
  usedSkills: string[] | null;
  error: string | null;
  durationMs: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineRun {
  id: string;
  companyId: string;
  templateId: string;
  name: string | null;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  currentPhaseKey: string | null;
  inputContext: Record<string, unknown> | null;
  skillPlan: Record<string, unknown> | null;
  evalResults: {
    entry?: Record<string, unknown>;
    patterns?: {
      recurringWeaknesses?: Array<{
        category: string;
        runsBelowThreshold: number;
        avgScore: number;
        threshold: number;
        runIds: string[];
      }>;
      improvements?: Array<{
        category: string;
        trend: string;
        scores: number[];
      }>;
      skillImprovementCandidates?: Array<{
        skill: string;
        agent: string;
        reason: string;
      }>;
    };
    thresholdAdjustments?: Record<string, unknown>;
    thresholds?: Record<string, unknown>;
  } | null;
  triggeredByAgentId: string | null;
  triggeredByUserId: string | null;
  triggerSource: string | null;
  retryOfRunId: string | null;
  totalSkillGateFailures: number;
  totalRetries: number;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineRunWithPhases extends PipelineRun {
  phases: PipelinePhase[];
}

export interface SkillPlanResult {
  plan: Record<string, { required: string[]; recommended: string[]; reasons: string[] }>;
  matchedSignals: string[];
  stats: {
    signalsDetected: number;
    totalSignalsChecked: number;
    agentsWithPlans: number;
    totalRequired: number;
    totalRecommended: number;
  };
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const pipelinesApi = {
  // Templates
  listTemplates: (companyId: string) =>
    api.get<PipelineTemplate[]>(`/companies/${companyId}/pipeline-templates`),

  getTemplate: (templateId: string) =>
    api.get<PipelineTemplate>(`/pipeline-templates/${templateId}`),

  createTemplate: (companyId: string, data: {
    slug: string;
    name: string;
    description?: string;
    phases: PipelinePhaseDefinition[];
    signalConfig?: Record<string, unknown>;
    defaultQaThreshold?: number;
    defaultMaxRetries?: number;
  }) => api.post<PipelineTemplate>(`/companies/${companyId}/pipeline-templates`, data),

  archiveTemplate: (templateId: string) =>
    api.delete<PipelineTemplate>(`/pipeline-templates/${templateId}`),

  // Runs
  listRuns: (companyId: string, limit: number = 50) =>
    api.get<PipelineRun[]>(`/companies/${companyId}/pipeline-runs?limit=${limit}`),

  startRun: (companyId: string, data: {
    templateId: string;
    name?: string;
    inputContext?: Record<string, unknown>;
    triggerSource?: string;
  }) => api.post<PipelineRun>(`/companies/${companyId}/pipeline-runs`, data),

  getRun: (runId: string) =>
    api.get<PipelineRunWithPhases>(`/pipeline-runs/${runId}`),

  advanceRun: (runId: string) =>
    api.post<{ startedPhases: string[] | null; completed: boolean }>(`/pipeline-runs/${runId}/advance`, {}),

  cancelRun: (runId: string) =>
    api.post<PipelineRun>(`/pipeline-runs/${runId}/cancel`, {}),

  executeRun: (runId: string) =>
    api.post<PipelineRun>(`/pipeline-runs/${runId}/execute`, {}),

  planSkills: (runId: string) =>
    api.post<SkillPlanResult>(`/pipeline-runs/${runId}/plan-skills`, {}),

  // Phases
  completePhase: (phaseId: string, data: {
    agentOutput: string;
    heartbeatRunId?: string;
  }) => api.post<unknown>(`/pipeline-phases/${phaseId}/complete`, data),
};
