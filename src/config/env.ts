import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 3000),

  environment: process.env.ENVIRONMENT ?? "production",

  rateLimit: Number(process.env.RATE_LIMIT ?? 1000),

  rawLogBufferSize: Number(process.env.RAW_LOG_BUFFER_SIZE ?? 10000),

  rawLogBatchSize: Number(process.env.RAW_LOG_BATCH_SIZE ?? 50),

  rawLogTimeoutMs: Number(process.env.RAW_LOG_TIMEOUT_MS ?? 100),

  rabbitmq: {
    host: process.env.RABBITMQ_HOST ?? "localhost",
    port: Number(process.env.RABBITMQ_PORT ?? 5672),
    user: process.env.RABBITMQ_USER ?? "guest",
    password: process.env.RABBITMQ_PASS ?? "guest",
  },
};
