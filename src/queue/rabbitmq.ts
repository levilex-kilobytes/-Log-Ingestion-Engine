import amqp, { type Channel, type ChannelModel } from "amqplib";

import type { EnrichedLog } from "../types/log";
import { FallbackQueue } from "./fallbackQueue";

const DESTINATIONS = ["service1", "service2", "service3"] as const;

const ROUTING_KEY = "log.write";
const PUBLISH_TIMEOUT_MS = 5_000;

export class RabbitMQPublisher {
  private connection?: ChannelModel;
  private channel?: Channel;

  constructor(private readonly fallbackQueue: FallbackQueue) {}

  async connect(): Promise<void> {
    const host = process.env.RABBITMQ_HOST;
    const port = process.env.RABBITMQ_PORT;
    const user = process.env.RABBITMQ_USER;
    const password = process.env.RABBITMQ_PASS;

    if (!host || !port || !user || !password) {
      console.warn(
        "RabbitMQ configuration is incomplete, using fallback queue",
      );

      return;
    }

    try {
      this.connection = await amqp.connect(
        `amqp://${encodeURIComponent(user)}:${encodeURIComponent(
          password,
        )}@${host}:${port}`,
      );

      this.channel = await this.connection.createChannel();

      for (const destination of DESTINATIONS) {
        const exchange = this.getExchange(destination);

        const queue = `queue_${destination}`;

        await this.channel.assertExchange(exchange, "direct", {
          durable: true,
        });

        await this.channel.assertQueue(queue, {
          durable: true,
        });

        await this.channel.bindQueue(queue, exchange, ROUTING_KEY);
      }

      console.log("RabbitMQ connected");
    } catch (error) {
      console.warn("RabbitMQ unavailable, using fallback queue", error);

      this.connection = undefined;
      this.channel = undefined;
    }
  }

  async publish(destination: string, log: EnrichedLog): Promise<boolean> {
    const exchange = this.getExchange(destination);

    if (!this.channel) {
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

  private getExchange(destination: string): string {
    switch (destination) {
      case "service1":
        return "exchange_service1";

      case "service2":
        return "exchange_service2";

      case "service3":
        return "exchange_service3";

      default:
        throw new Error(`Unknown RabbitMQ destination: ${destination}`);
    }
  }
}
