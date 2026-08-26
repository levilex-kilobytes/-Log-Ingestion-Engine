import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { createIngestLogs } from "../../src/ingestor/logController";
import { RawLogChannel } from "../../src/queue/rawLogChannel";

function createTestApp(channel: RawLogChannel) {
  const app = express();

  app.use(express.json());

  app.post("/logs", createIngestLogs(channel));

  return app;
}

const validLog = {
  timestamp: "2026-08-26T10:00:00Z",
  service: "claims",
  level: "ERROR" as const,
  message: "Database failed",
};

describe("POST /logs - ingestion channel", () => {
  it("returns 503 when the raw log channel is full", async () => {
    const channel = new RawLogChannel(1, 10);
    const app = createTestApp(channel);

    // Fill the channel.
    expect(await channel.push(validLog)).toBe(true);

    const response = await request(app)
      .post("/logs")
      .set("Content-Type", "application/json")
      .send([validLog]);

    expect(response.status).toBe(503);

    expect(response.body).toEqual({
      error: "ingestion overloaded",
    });
  });
});
