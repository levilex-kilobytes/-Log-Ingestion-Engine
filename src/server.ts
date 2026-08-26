import app from "./app";
import { config } from "./config/env";

app.listen(config.port, () => {
  console.log(`Log ingestion engine running on port ${config.port}`);
});
