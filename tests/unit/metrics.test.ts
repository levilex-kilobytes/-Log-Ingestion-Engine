import { describe, expect, it } from "vitest";
import { MetricsCollector } from "../../src/monitoring/metrics";
import type { EnrichedLog } from "../../src/types/log";

const createLog = (
  service: string,
  level: EnrichedLog["level"],
): EnrichedLog => ({
  timestamp: "2026-08-26T10:00:00Z",
  service,
  level,
  message: "Test log",
  received_at: "2026-08-26T10:00:00.123456Z",
  source_ip: "127.0.0.1",
  env: "production",
});

describe("MetricsCollector", () => {
  it("tracks total logs", () => {
    const metrics = new MetricsCollector();

    metrics.record(createLog("service1", "INFO"));
    metrics.record(createLog("service1", "ERROR"));

    expect(metrics.getMetrics().total_logs).toBe(2);
  });

  it("tracks logs by level", () => {
    const metrics = new MetricsCollector();

    metrics.record(createLog("service1", "INFO"));
    metrics.record(createLog("service1", "INFO"));
    metrics.record(createLog("service1", "ERROR"));

    expect(metrics.getMetrics().logs_by_level).toEqual({
      INFO: 2,
      ERROR: 1,
    });
  });

  it("tracks logs by service", () => {
    const metrics = new MetricsCollector();

    metrics.record(createLog("service1", "INFO"));
    metrics.record(createLog("service1", "ERROR"));
    metrics.record(createLog("service2", "INFO"));

    expect(metrics.getMetrics().logs_by_service).toEqual({
      service1: 2,
      service2: 1,
    });
  });

  it("tracks error rate", () => {
    const metrics = new MetricsCollector();

    metrics.record(createLog("service1", "INFO"));
    metrics.record(createLog("service1", "ERROR"));
    metrics.record(createLog("service1", "ERROR"));
    metrics.record(createLog("service1", "INFO"));

    expect(metrics.getMetrics().error_rate).toBe(50);
  });

  it("tracks queue backlog", () => {
    const metrics = new MetricsCollector();

    metrics.setQueueBacklog(25);

    expect(metrics.getMetrics().queue_backlog).toBe(25);
  });

  it("resets all metrics", () => {
    const metrics = new MetricsCollector();

    metrics.record(createLog("service1", "ERROR"));
    metrics.setQueueBacklog(10);

    metrics.reset();

    expect(metrics.getMetrics()).toEqual({
      total_logs: 0,
      logs_by_level: {},
      logs_by_service: {},
      error_rate: 0,
      throughput: 0,
      queue_backlog: 0,
    });
  });
});
