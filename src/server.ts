import app from "./app";
import { config } from "./config/env";
import { rawLogChannel } from "./ingestor/ingestionChannel";
import { LogConsumer } from "./queue/logConsumer";
import { handleLogBatch } from "./queue/logConsumerHandler";

const consumer = new LogConsumer(
  rawLogChannel,
  handleLogBatch,
);

consumer.start();

app.listen(config.port, () => {
  console.log(`Log ingestion engine running on port ${config.port}`);
});
