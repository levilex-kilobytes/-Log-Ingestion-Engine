import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";

import { validateLog } from "../validation/logValidator";
import type { LogEntry, EnrichedLog } from "../types/log";

import { enrichLog } from "../enrichment/logEnricher";
import { metrics } from "../monitoring/metrics";

import { rawLogChannel } from "./ingestionChannel";
import type { RawLogChannel } from "../queue/rawLogChannel";

export function createIngestLogs(channel: RawLogChannel) {
  return async function ingestLogs(req: Request, res: Response): Promise<void> {
    const logs = req.body;

    if (!Array.isArray(logs)) {
      res.status(400).json({
        error: "Request body must be an array of log entries",
      });

      return;
    }

    const invalidLogs: {
      index: number;
      details: {
        field: string;
        reason: string;
      }[];
    }[] = [];

    let accepted = 0;

    for (const [index, log] of logs.entries()) {
      const result = validateLog(log);

      if (!result.valid) {
        invalidLogs.push({
          index,
          details: result.errors,
        });

        continue;
      }

      const enrichedLog: EnrichedLog = enrichLog(log as LogEntry, req);

      const pushed = await channel.push(enrichedLog);

      if (!pushed) {
        metrics.setQueueBacklog(channel.size());

        res.status(503).json({
          error: "ingestion overloaded",
        });

        return;
      }

      metrics.record(enrichedLog);
      metrics.setQueueBacklog(channel.size());

      accepted++;
    }

    metrics.setQueueBacklog(channel.size());

    const batchId = randomUUID();

    res.status(202).json({
      status: "accepted",
      batchId,
      accepted,
      rejected: invalidLogs.length,
      errors: invalidLogs,
    });
  };
}

export const ingestLogs = createIngestLogs(rawLogChannel);
