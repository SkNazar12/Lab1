import express from "express";
import cors from "cors";
import eventsRouter from "./routes/events.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());
app.use(loggerMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/events", eventsRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found"
    }
  });
});

app.use(errorHandler);

export { app };