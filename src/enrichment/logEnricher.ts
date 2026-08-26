import type { Request } from "express";
import type { LogEntry, EnrichedLog } from "../types/log";

export function enrichLog(
  log: LogEntry,
  req: Request,
  env: string = process.env.NODE_ENV ?? "production",
): EnrichedLog {
  const forwardedFor = req.headers["x-forwarded-for"];

  let sourceIp = "unknown";

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    sourceIp = forwardedFor.split(",")[0].trim();
  } else if (req.socket.remoteAddress) {
    sourceIp = req.socket.remoteAddress;
  }

  return {
    ...log,
    received_at: getMicrosecondTimestamp(),
    source_ip: sourceIp,
    env,
  };
}

function getMicrosecondTimestamp(): string {
  const now = new Date();

  const iso = now.toISOString();

  const milliseconds = iso.slice(20, 23);

  return `${iso.slice(0, 20)}${milliseconds}000Z`;
}
