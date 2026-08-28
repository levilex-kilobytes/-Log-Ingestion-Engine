import { describe, expect, it } from "vitest";
import { routeLog } from "../../src/routing/route";
import type { RoutingRule } from "../../src/types/routing";
import type { LogEntry } from "../../src/types/log";

describe("routeLog", () => {
  const log: LogEntry = {
    timestamp: "2026-08-26T10:00:00Z",
    service: "claims",
    level: "ERROR",
    message: "Database failed",
  };

  it("routes a log when the service matches", () => {
    const rules: RoutingRule[] = [
      {
        field: "service",
        value: "claims",
        destination: "claims-queue",
      },
    ];

    expect(routeLog(log, rules)).toBe("claims-queue");
  });

  it("routes a log when the level matches", () => {
    const rules: RoutingRule[] = [
      {
        field: "level",
        value: "ERROR",
        destination: "error-queue",
      },
    ];

    expect(routeLog(log, rules)).toBe("error-queue");
  });

  it("returns default when no rule matches", () => {
    const rules: RoutingRule[] = [
      {
        field: "service",
        value: "payments",
        destination: "payments-queue",
      },
    ];

    expect(routeLog(log, rules)).toBe("default");
  });
});
