// 🩺 CreatorBharat SaaS Health & Probes Router
import express from 'express';
import { HealthChecker } from '../observability/healthChecker.js';

const router = express.Router();

// GET /health and GET /health/live — Liveness probe (Kubernetes / Render / Cloud Run)
router.get(['/', '/live'], (req, res) => {
  const liveness = HealthChecker.getLiveness();
  res.status(200).json(liveness);
});

// GET /health/ready — Readiness probe
router.get('/ready', async (req, res) => {
  const readiness = await HealthChecker.getReadiness();
  const statusCode = readiness.isReady ? 200 : 503;
  res.status(statusCode).json(readiness);
});

export default router;
