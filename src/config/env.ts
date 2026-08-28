import "dotenv/config";

export const config = {
  port: Number(process.env.PORT),

  environment: process.env.ENVIRONMENT,

  rateLimit: Number(process.env.RATE_LIMIT),

  rawLogBufferSize: Number(process.env.RAW_LOG_BUFFER_SIZE),

  rawLogBatchSize: Number(process.env.RAW_LOG_BATCH_SIZE),

  rawLogTimeoutMs: Number(process.env.RAW_LOG_TIMEOUT_MS),

  rabbitmq: {
    host: process.env.RABBITMQ_HOST,

    port: Number(process.env.RABBITMQ_PORT),

    user: process.env.RABBITMQ_USER,

    password: process.env.RABBITMQ_PASS,
  },
};
