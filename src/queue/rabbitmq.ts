import amqp, { type Channel, type ChannelModel } from "amqplib";
import type { EnrichedLog } from "../types/log";
import { FallbackQueue } from "./fallbackQueue";

const EXCHANGES = [
  "exchange_service1",
  "exchange_service2",
  "exchange_service3",
] as const;

const QUEUES = ["queue_service1", "queue_service2", "queue_service3"] as const;

const ROUTING_KEY = "log.write";
const PUBLISH_TIMEOUT_MS = 5_000;

export class RabbitMQPublisher {
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly fallbackQueue: FallbackQueue) {}

  async connect(): Promise<void> {
    const host = process.env.RABBITMQ_HOST ?? "localhost";
    const port = process.env.RABBITMQ_PORT ?? "5672";
    const user = process.env.RABBITMQ_USER ?? "guest";
    const password = process.env.RABBITMQ_PASS ?? "guest";

    try {
      this.connection = await amqp.connect(
        `amqp://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}`,
      );

      this.channel = await this.connection.createChannel();

      for (let i = 0; i < EXCHANGES.length; i++) {
        await this.channel.assertExchange(EXCHANGES[i], "direct", {
          durable: true,
        });

        await this.channel.assertQueue(QUEUES[i], {
          durable: true,
        });

        await this.channel.bindQueue(QUEUES[i], EXCHANGES[i], ROUTING_KEY);
      }
    } catch (error) {
      console.warn("RabbitMQ unavailable, using fallback queue", error);

      this.connection = undefined;
      this.channel = undefined;
    }
  }

  async publish(destination: string, log: EnrichedLog): Promise<boolean> {
    const exchange = this.getExchange(destination);

    if (!this.channel || !exchange) {
      this.fallbackQueue.push(destination, log);
      return false;
    }

    try {
      const message = Buffer.from(JSON.stringify(log));

      await Promise.race([
        Promise.resolve(
          this.channel.publish(exchange, ROUTING_KEY, message, {
            persistent: true,
          }),
        ),
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error("RabbitMQ publishing timeout")),
            PUBLISH_TIMEOUT_MS,
          );
        }),
      ]);

      return true;
    } catch (error) {
      console.error("RabbitMQ publish failed", error);

      this.fallbackQueue.push(destination, log);

      return false;
    }
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();

    this.channel = undefined;
    this.connection = undefined;
  }

  private getExchange(destination: string): string | undefined {
    if (destination === "service1" || destination === "queue_service1") {
      return "exchange_service1";
    }

    if (destination === "service2" || destination === "queue_service2") {
      return "exchange_service2";
    }

    if (destination === "service3" || destination === "queue_service3") {
      return "exchange_service3";
    }

    return undefined;
  }
}
