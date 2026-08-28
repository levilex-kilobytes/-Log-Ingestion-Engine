import express from "express";
import request from "supertest";
import { describe, expect, it, beforeEach } from "vitest";
import routes from "../../src/routes/routes";
import { metrics } from "../../src/monitoring/metrics";

const app = express();

app.use(express.json());
app.use(routes);

describe("GET /metrics", () => {
  beforeEach(() => {
    metrics.reset();
  });

  it("returns metrics as JSON", async () => {
    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      total_logs: 0,
      logs_by_level: {},
      logs_by_service: {},
      error_rate: 0,
      throughput: 0,
      queue_backlog: 0,
    });
  });

  it("returns recorded log metrics", async () => {
    metrics.record({
      timestamp: "2026-08-26T10:00:00Z",
      service: "service1",
      level: "ERROR",
      message: "Database failed",
      received_at: "2026-08-26T10:00:00.123456Z",
      source_ip: "127.0.0.1",
      env: "production",
    });

    const response = await request(app).get("/metrics");

    expect(response.status).toBe(200);
    expect(response.body.total_logs).toBe(1);
    expect(response.body.logs_by_level.ERROR).toBe(1);
    expect(response.body.logs_by_service.service1).toBe(1);
    expect(response.body.error_rate).toBe(100);
  });
});
