import { describe, expect, it } from "vitest";
import { RabbitMQPublisher } from "../../src/queue/rabbitmq";
import { FallbackQueue } from "../../src/queue/fallbackQueue";
import type { EnrichedLog } from "../../src/types/log";

const log: EnrichedLog = {
  timestamp: "2026-08-26T10:00:00Z",
  service: "service1",
  level: "INFO",
  message: "Test log",
  received_at: "2026-08-26T10:00:00.123456Z",
  source_ip: "127.0.0.1",
  env: "production",
};

describe("RabbitMQPublisher", () => {
  it("uses the fallback queue when RabbitMQ is unavailable", async () => {
    const fallback = new FallbackQueue();
    const publisher = new RabbitMQPublisher(fallback);

    await publisher.publish("service1", log);

    expect(fallback.size("service1")).toBe(1);

    const logs = fallback.pull("service1", 10);

    expect(logs).toEqual([log]);
  });

  it("returns false when publishing without a RabbitMQ connection", async () => {
    const fallback = new FallbackQueue();
    const publisher = new RabbitMQPublisher(fallback);

    const result = await publisher.publish(
      "service1",
      log,
    );

    expect(result).toBe(false);
  });

  it("stores logs separately for different destinations", async () => {
    const fallback = new FallbackQueue();
    const publisher = new RabbitMQPublisher(fallback);

    await publisher.publish("service1", log);
    await publisher.publish("service2", log);

    expect(fallback.size("service1")).toBe(1);
    expect(fallback.size("service2")).toBe(1);
  });
});
