import cors from "cors";
import express from "express";
import eventsRouter from "./routes/events.routes.js";
import registrationsRouter from "./routes/registrations.routes.js";
import usersRouter from "./routes/user.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Demo-UserId"]
  })
);

app.use(express.json());
app.use(loggerMiddleware);

app.get("/health", (_req, res) => {
  res.status(200).json({ data: { status: "ok" } });
});

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/events", eventsRouter);
app.use("/api/v1/registrations", registrationsRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "Route not found"
    }
  });
});

app.use(errorHandler);

export { app };
