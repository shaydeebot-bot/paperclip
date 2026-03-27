import { Router } from "express";
import { z } from "zod";
import type { Db } from "@paperclipai/db";
import { validate } from "../middleware/validate.js";
import { agentTrainerService } from "../services/agent-trainer.js";
import { assertBoard, assertCompanyAccess } from "./authz.js";

// ── Validation Schemas ───────────────────────────────────────────────────────

const saveConfigSchema = z.object({
  skillSlug: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  evaluatorInstructions: z.string().min(1),
  generatorScenarios: z.array(z.string()).min(1),
  rubric: z.object({
    dimensions: z.array(z.object({
      name: z.string(),
      weight: z.number().positive(),
      description: z.string(),
    })),
    maxScore: z.number().positive(),
  }).optional(),
  benchmarkRef: z.string().optional(),
  maxIterations: z.number().min(1).max(20).optional(),
  convergenceThreshold: z.number().min(0).max(100).optional(),
  baselineScore: z.number().min(0).max(100).optional(),
});

const startTrainingSchema = z.object({
  skillSlug: z.string().min(1),
  configId: z.string().uuid().optional(),
  scenario: z.string().optional(),
  evaluatorInstructions: z.string().optional(),
  maxIterations: z.number().min(1).max(20).optional(),
  convergenceThreshold: z.number().min(0).max(100).optional(),
});

const recordIterationSchema = z.object({
  generatorOutput: z.string(),
  evaluatorCritique: z.string(),
  scores: z.object({
    dimensions: z.record(z.number()),
    total: z.number(),
    maxScore: z.number().positive(),
    percentage: z.number().min(0).max(100),
  }),
  critiqueAccountability: z.object({
    total: z.number(),
    addressed: z.number(),
    skipped: z.array(z.string()),
  }).optional(),
  notDone: z.boolean().optional(),
  generatorDurationMs: z.number().optional(),
  evaluatorDurationMs: z.number().optional(),
});

const proposeUpdateSchema = z.object({
  proposedMarkdown: z.string().min(1),
});

// ── Routes ───────────────────────────────────────────────────────────────────

export function trainingRoutes(db: Db) {
  const router = Router();
  const svc = agentTrainerService(db);

  // ── Configs ──────────────────────────────────────────────────────────────

  // POST /api/companies/:companyId/training-configs
  router.post(
    "/companies/:companyId/training-configs",
    validate(saveConfigSchema),
    async (req, res) => {
      assertBoard(req);
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);

      const config = await svc.saveConfig(companyId, req.body);
      res.status(201).json(config);
    },
  );

  // GET /api/companies/:companyId/training-configs
  router.get("/companies/:companyId/training-configs", async (req, res) => {
    assertBoard(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);

    const configs = await svc.listConfigs(companyId);
    res.json(configs);
  });

  // GET /api/training-configs/:id
  router.get("/training-configs/:id", async (req, res) => {
    assertBoard(req);
    const config = await svc.getConfig(req.params.id as string);
    if (!config) {
      res.status(404).json({ error: "Training config not found" });
      return;
    }
    res.json(config);
  });

  // ── Runs ─────────────────────────────────────────────────────────────────

  // POST /api/companies/:companyId/training-runs
  router.post(
    "/companies/:companyId/training-runs",
    validate(startTrainingSchema),
    async (req, res) => {
      assertBoard(req);
      const companyId = req.params.companyId as string;
      assertCompanyAccess(req, companyId);

      const run = await svc.startTraining(companyId, req.body);
      res.status(201).json(run);
    },
  );

  // GET /api/companies/:companyId/training-runs
  router.get("/companies/:companyId/training-runs", async (req, res) => {
    assertBoard(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);

    const limit = parseInt(req.query.limit as string, 10) || 50;
    const skillSlug = req.query.skillSlug as string | undefined;

    const runs = skillSlug
      ? await svc.listRunsForSkill(companyId, skillSlug, Math.min(limit, 200))
      : await svc.listRuns(companyId, Math.min(limit, 200));
    res.json(runs);
  });

  // GET /api/training-runs/:id
  router.get("/training-runs/:id", async (req, res) => {
    assertBoard(req);
    const run = await svc.getRunWithIterations(req.params.id as string);
    if (!run) {
      res.status(404).json({ error: "Training run not found" });
      return;
    }
    res.json(run);
  });

  // POST /api/training-runs/:id/cancel
  router.post("/training-runs/:id/cancel", async (req, res) => {
    assertBoard(req);
    const run = await svc.getRun(req.params.id as string);
    if (!run) {
      res.status(404).json({ error: "Training run not found" });
      return;
    }

    const cancelled = await svc.cancelRun(run.id);
    res.json(cancelled);
  });

  // ── Iterations ───────────────────────────────────────────────────────────

  // POST /api/training-runs/:id/iterations
  router.post(
    "/training-runs/:id/iterations",
    validate(recordIterationSchema),
    async (req, res) => {
      const result = await svc.recordIteration(req.params.id as string, req.body);
      res.status(201).json(result);
    },
  );

  // ── Skill Updates ────────────────────────────────────────────────────────

  // POST /api/training-runs/:id/propose-update
  router.post(
    "/training-runs/:id/propose-update",
    validate(proposeUpdateSchema),
    async (req, res) => {
      assertBoard(req);
      const updated = await svc.proposeSkillUpdate(
        req.params.id as string,
        req.body.proposedMarkdown,
      );
      res.json(updated);
    },
  );

  // POST /api/training-runs/:id/apply-update
  router.post("/training-runs/:id/apply-update", async (req, res) => {
    assertBoard(req);
    const updated = await svc.applySkillUpdate(req.params.id as string);
    res.json(updated);
  });

  // POST /api/training-runs/:id/reject-update
  router.post("/training-runs/:id/reject-update", async (req, res) => {
    assertBoard(req);
    const updated = await svc.rejectSkillUpdate(req.params.id as string);
    res.json(updated);
  });

  // ── Skill Health ─────────────────────────────────────────────────────────

  // GET /api/companies/:companyId/skill-health
  router.get("/companies/:companyId/skill-health", async (req, res) => {
    assertBoard(req);
    const companyId = req.params.companyId as string;
    assertCompanyAccess(req, companyId);

    const health = await svc.getSkillHealth(companyId);
    res.json(health);
  });

  return router;
}
