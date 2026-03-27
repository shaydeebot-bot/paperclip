import { Router } from "express";
import { z } from "zod";
import type { Db } from "@paperclipai/db";
import { validate } from "../middleware/validate.js";
import { pipelineService } from "../services/pipeline/index.js";
import { assertBoard, assertCompanyAccess } from "./authz.js";

// ── Validation Schemas ───────────────────────────────────────────────────────

const phaseDefinitionSchema = z.object({
  key: z.string().min(1),
  name: z.string().min(1),
  agentRole: z.string().min(1),
  agentId: z.string().uuid().optional(),
  dependsOn: z.array(z.string()).default([]),
  parallel: z.boolean().optional(),
  skills: z.object({
    required: z.array(z.string()).default([]),
    recommended: z.array(z.string()).default([]),
  }),
  qaThreshold: z.number().min(0).max(100).optional(),
  maxRetries: z.number().min(0).max(10).optional(),
  timeoutMs: z.number().positive().optional(),
});

const createTemplateSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  phases: z.array(phaseDefinitionSchema).min(1),
  signalConfig: z.record(z.unknown()).optional(),
  defaultQaThreshold: z.number().min(0).max(100).optional(),
  defaultMaxRetries: z.number().min(0).max(10).optional(),
});

const startRunSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().max(200).optional(),
  inputContext: z.record(z.unknown()).optional(),
  triggerSource: z.string().optional(),
});

const completePhaseSchema = z.object({
  agentOutput: z.string(),
  heartbeatRunId: z.string().uuid().optional(),
});

// ── Routes ───────────────────────────────────────────────────────────────────

export function pipelineRoutes(db: Db) {
  const router = Router();
  const svc = pipelineService(db);

  // ── Templates ────────────────────────────────────────────────────────────

  // POST /api/companies/:companyId/pipeline-templates
  router.post(
    "/companies/:companyId/pipeline-templates",
    validate(createTemplateSchema),
    async (req, res) => {
      assertBoard(req);
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);

      const template = await svc.createTemplate(companyId, req.body);
      res.status(201).json(template);
    },
  );

  // GET /api/companies/:companyId/pipeline-templates
  router.get("/companies/:companyId/pipeline-templates", async (req, res) => {
    assertBoard(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);

    const templates = await svc.listTemplates(companyId);
    res.json(templates);
  });

  // GET /api/pipeline-templates/:id
  router.get("/pipeline-templates/:id", async (req, res) => {
    assertBoard(req);

    const template = await svc.getTemplate(req.params.id as string);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    assertCompanyAccess(req, template.companyId);

    res.json(template);
  });

  // DELETE /api/pipeline-templates/:id (archive)
  router.delete("/pipeline-templates/:id", async (req, res) => {
    assertBoard(req);

    const template = await svc.getTemplate(req.params.id as string);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    assertCompanyAccess(req, template.companyId);

    const archived = await svc.archiveTemplate(template.id);
    res.json(archived);
  });

  // ── Runs ─────────────────────────────────────────────────────────────────

  // POST /api/companies/:companyId/pipeline-runs
  router.post(
    "/companies/:companyId/pipeline-runs",
    validate(startRunSchema),
    async (req, res) => {
      assertBoard(req);
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);

      const run = await svc.startRun(companyId, {
        ...req.body,
        triggeredByUserId: req.actor?.type === "board" ? req.actor.userId : undefined,
      });
      res.status(201).json(run);
    },
  );

  // GET /api/companies/:companyId/pipeline-runs
  router.get("/companies/:companyId/pipeline-runs", async (req, res) => {
    assertBoard(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const runs = await svc.listRuns(companyId, Math.min(limit, 200));
    res.json(runs);
  });

  // GET /api/pipeline-runs/:id
  router.get("/pipeline-runs/:id", async (req, res) => {
    assertBoard(req);

    const run = await svc.getRunWithPhases(req.params.id as string);
    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }
    assertCompanyAccess(req, run.companyId);

    res.json(run);
  });

  // POST /api/pipeline-runs/:id/advance
  router.post("/pipeline-runs/:id/advance", async (req, res) => {
    assertBoard(req);

    const run = await svc.getRun(req.params.id as string);
    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }
    assertCompanyAccess(req, run.companyId);

    const startedPhases = await svc.advanceRun(run.id);
    res.json({ startedPhases, completed: startedPhases === null });
  });

  // POST /api/pipeline-runs/:id/cancel
  router.post("/pipeline-runs/:id/cancel", async (req, res) => {
    assertBoard(req);

    const run = await svc.getRun(req.params.id as string);
    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }
    assertCompanyAccess(req, run.companyId);

    const cancelled = await svc.cancelRun(run.id);
    res.json(cancelled);
  });

  // POST /api/pipeline-runs/:id/plan-skills
  router.post("/pipeline-runs/:id/plan-skills", async (req, res) => {
    assertBoard(req);

    const run = await svc.getRun(req.params.id as string);
    if (!run) {
      res.status(404).json({ error: "Run not found" });
      return;
    }
    assertCompanyAccess(req, run.companyId);

    const plan = await svc.planSkills(run.id);
    res.json(plan);
  });

  // ── Phases ───────────────────────────────────────────────────────────────

  // POST /api/pipeline-phases/:id/complete
  router.post(
    "/pipeline-phases/:id/complete",
    validate(completePhaseSchema),
    async (req, res) => {
      // This endpoint is called by the pipeline orchestration loop
      // or by agents reporting completion. Allow both board and agent actors.
      const result = await svc.completePhase(
        req.params.id as string,
        req.body.agentOutput,
        req.body.heartbeatRunId,
      );
      res.json(result);
    },
  );

  return router;
}
