import express from "express";
import cors from "cors";
import eventRoutes from "./routes/event.routes.js";
// import userRoutes from "./routes/user.routes"; // Розкоментуй після створення User
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);

// Маршрути
app.use("/api/events", eventRoutes);
// app.use("/api/users", userRoutes); // Розкоментуй після створення User

// Обробка помилок (завжди в кінці)
app.use(errorHandler);

app.listen(3000, () => {
    console.log("API started on http://localhost:3000");
});