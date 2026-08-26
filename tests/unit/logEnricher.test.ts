import { describe, expect, it } from "vitest";
import { enrichLog } from "../../src/enrichment/logEnricher";
import type { Request } from "express";
import type { LogEntry } from "../../src/types/log";

const log: LogEntry = {
  timestamp: "2026-08-26T10:00:00Z",
  service: "claims",
  level: "ERROR",
  message: "Database failed",
};

function createRequest(
  headers: Record<string, string> = {},
  remoteAddress?: string,
): Request {
  return {
    headers,
    socket: {
      remoteAddress,
    },
  } as unknown as Request;
}

describe("enrichLog", () => {
  it("adds received_at, source_ip, and env", () => {
    const req = createRequest({}, "192.168.1.10");

    const result = enrichLog(log, req, "production");

    expect(result.timestamp).toBe(log.timestamp);
    expect(result.service).toBe(log.service);
    expect(result.level).toBe(log.level);
    expect(result.message).toBe(log.message);

    expect(result.received_at).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/,
    );

    expect(result.source_ip).toBe("192.168.1.10");
    expect(result.env).toBe("production");
  });

  it("uses X-Forwarded-For when available", () => {
    const req = createRequest(
      {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      },
      "192.168.1.10",
    );

    const result = enrichLog(log, req, "staging");

    expect(result.source_ip).toBe("203.0.113.10");
    expect(result.env).toBe("staging");
  });

  it("uses socket address when X-Forwarded-For is missing", () => {
    const req = createRequest({}, "192.168.1.20");

    const result = enrichLog(log, req);

    expect(result.source_ip).toBe("192.168.1.20");
  });

  it('uses "unknown" when no IP is available', () => {
    const req = createRequest({});

    const result = enrichLog(log, req);

    expect(result.source_ip).toBe("unknown");
  });

  it("preserves the original log fields", () => {
    const req = createRequest({}, "127.0.0.1");

    const result = enrichLog(log, req, "dev");

    expect(result).toMatchObject({
      timestamp: "2026-08-26T10:00:00Z",
      service: "claims",
      level: "ERROR",
      message: "Database failed",
      source_ip: "127.0.0.1",
      env: "dev",
    });
  });
});
