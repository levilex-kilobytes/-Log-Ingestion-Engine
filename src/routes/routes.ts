import { Router } from "express";

import { ingestLogs } from "../ingestor/logController";
import { metrics } from "../monitoring/metrics";
import { dashboardController } from "../dashboard/dashboardController";

const router = Router();

router.post("/logs", ingestLogs);

router.get("/metrics", (_req, res) => {
  res.status(200).json(metrics.getMetrics());
});

router.get(
  "/dashboard",
  dashboardController,
);

export default router;