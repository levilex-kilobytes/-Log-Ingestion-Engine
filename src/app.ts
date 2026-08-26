import express from "express";
import routes from "./routes/routes";
import { contentTypeMiddleware } from "./middleware/contentType";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(contentTypeMiddleware);

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.use(rateLimiter);

app.use(routes);

app.use(errorHandler);

export default app;
