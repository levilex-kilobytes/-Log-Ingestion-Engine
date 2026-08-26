import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { validateLog, LogEntry } from "../validation/logValidator";

export function ingestLogs(req: Request, res: Response): void {
  const logs = req.body;

  if (!Array.isArray(logs)) {
    res.status(400).json({
      error: "Request body must be an array of log entries",
    });
    return;
  }

  const validLogs: LogEntry[] = [];
  const invalidLogs: {
    index: number;
    details: {
      field: string;
      reason: string;
    }[];
  }[] = [];

  logs.forEach((log, index) => {
    const result = validateLog(log);

    if (result.valid) {
      validLogs.push(log as LogEntry);
    } else {
      invalidLogs.push({
        index,
        details: result.errors,
      });
    }
  });

  const batchId = randomUUID();

  res.status(202).json({
    status: "accepted",
    batchId,
    accepted: validLogs.length,
    rejected: invalidLogs.length,
    errors: invalidLogs,
  });
}
