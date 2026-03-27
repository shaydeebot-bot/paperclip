import { Router } from "express";

export function helloRoutes() {
  const router = Router();

  router.get("/hello", (_req, res) => {
    res.json({ message: "Hello from Shaydee pipeline" });
  });

  return router;
}
