import { api } from "./client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrainingRubricDimension {
  name: string;
  weight: number;
  description: string;
}

export interface TrainingRubric {
  dimensions: TrainingRubricDimension[];
  maxScore: number;
}

export interface TrainingConfig {
  id: string;
  companyId: string;
  skillId: string | null;
  skillSlug: string;
  name: string;
  description: string | null;
  evaluatorInstructions: string;
  generatorScenarios: string[];
  rubric: TrainingRubric | null;
  benchmarkRef: string | null;
  maxIterations: number;
  convergenceThreshold: number;
  baselineScore: number | null;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface TrainingIterationScores {
  dimensions: Record<string, number>;
  total: number;
  maxScore: number;
  percentage: number;
}

export interface TrainingIteration {
  id: string;
  trainingRunId: string;
  iterationNumber: number;
  generatorOutput: string;
  evaluatorCritique: string;
  scores: TrainingIterationScores;
  scorePercent: number;
  scoreDelta: number;
  critiqueAccountability: {
    total: number;
    addressed: number;
    skipped: string[];
  } | null;
  notDone: string | null;
  status: string;
  generatorDurationMs: number | null;
  evaluatorDurationMs: number | null;
  createdAt: string;
}

export interface TrainingRun {
  id: string;
  companyId: string;
  skillId: string | null;
  skillSlug: string;
  configId: string | null;
  status: "pending" | "running" | "converged" | "max_iterations" | "failed" | "cancelled";
  currentIteration: number;
  maxIterations: number;
  convergenceThreshold: number;
  baselineScore: number | null;
  finalScore: number | null;
  bestScore: number | null;
  bestIteration: number | null;
  scenario: string | null;
  evaluatorInstructions: string;
  proposedSkillUpdate: string | null;
  updateApplied: "pending" | "approved" | "rejected" | "applied" | null;
  triggerSource: string;
  triggerPipelineRunId: string | null;
  error: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingRunWithIterations extends TrainingRun {
  iterations: TrainingIteration[];
}

export interface SkillHealth {
  skillSlug: string;
  latestScore: number | null;
  bestScore: number | null;
  baselineScore: number | null;
  improvement: number | null;
  totalRuns: number;
  lastTrainedAt: string | null;
  status: string;
  trend: "improving" | "stable" | "degrading" | "unknown";
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const trainingApi = {
  // Configs
  listConfigs: (companyId: string) =>
    api.get<TrainingConfig[]>(`/companies/${companyId}/training-configs`),

  getConfig: (configId: string) =>
    api.get<TrainingConfig>(`/training-configs/${configId}`),

  saveConfig: (companyId: string, data: {
    skillSlug: string;
    name: string;
    description?: string;
    evaluatorInstructions: string;
    generatorScenarios: string[];
    rubric?: TrainingRubric;
    benchmarkRef?: string;
    maxIterations?: number;
    convergenceThreshold?: number;
    baselineScore?: number;
  }) => api.post<TrainingConfig>(`/companies/${companyId}/training-configs`, data),

  // Runs
  listRuns: (companyId: string, limit: number = 50) =>
    api.get<TrainingRun[]>(`/companies/${companyId}/training-runs?limit=${limit}`),

  listRunsForSkill: (companyId: string, skillSlug: string, limit: number = 20) =>
    api.get<TrainingRun[]>(`/companies/${companyId}/training-runs?skillSlug=${encodeURIComponent(skillSlug)}&limit=${limit}`),

  getRun: (runId: string) =>
    api.get<TrainingRunWithIterations>(`/training-runs/${runId}`),

  startRun: (companyId: string, data: {
    skillSlug: string;
    configId?: string;
    scenario?: string;
    evaluatorInstructions?: string;
    maxIterations?: number;
    convergenceThreshold?: number;
  }) => api.post<TrainingRun>(`/companies/${companyId}/training-runs`, data),

  cancelRun: (runId: string) =>
    api.post<TrainingRun>(`/training-runs/${runId}/cancel`, {}),

  applyUpdate: (runId: string) =>
    api.post<TrainingRun>(`/training-runs/${runId}/apply-update`, {}),

  rejectUpdate: (runId: string) =>
    api.post<TrainingRun>(`/training-runs/${runId}/reject-update`, {}),

  // Skill Health
  getSkillHealth: (companyId: string) =>
    api.get<SkillHealth[]>(`/companies/${companyId}/skill-health`),
};