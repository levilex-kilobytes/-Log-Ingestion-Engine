import { Router } from "express";
import { ingestLogs } from "../ingestor/logController";

const router = Router();

router.post("/logs", ingestLogs);

export default router;
