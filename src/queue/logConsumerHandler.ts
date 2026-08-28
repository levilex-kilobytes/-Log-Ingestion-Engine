import type { LogEntry, EnrichedLog } from "../types/log";
import { metrics } from "../monitoring/metrics";

export async function handleLogBatch(logs: LogEntry[]): Promise<void> {
  for (const log of logs) {
    const enrichedLog: EnrichedLog = {
      ...log,
      received_at: getMicrosecondTimestamp(),
      source_ip: "unknown",
      env: process.env.NODE_ENV ?? "production",
    };

    metrics.record(enrichedLog);
  }
}

function getMicrosecondTimestamp(): string {
  const now = new Date();

  const iso = now.toISOString();

  const milliseconds = iso.slice(20, 23);

  return `${iso.slice(0, 20)}${milliseconds}000Z`;
}
