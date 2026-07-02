import express, { Router } from "express";
import { prisma } from "@repo/db/prisma";

const router: Router = express.Router();

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      db: "ok",
      timestamp: Date.now(),
    });
  } catch {
    res.status(503).json({
      status: "error",
      db: "down",
      timestamp: Date.now(),
    });
  }
});

export default router;
