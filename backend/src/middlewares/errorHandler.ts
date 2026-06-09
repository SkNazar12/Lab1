import type { NextFunction, Request, Response } from "express";

type AppError = Error & {
  status?: number;
  errors?: Record<string, string[]>;
};

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const message = err.message || "Internal Server Error";

  if (err.status) {
    return res.status(err.status).json({
      error: {
        message,
        errors: err.errors ?? null
      }
    });
  }

  if (message.includes("FOREIGN KEY constraint failed")) {
    return res.status(400).json({
      error: {
        message: "Related record does not exist. Check userId or ticketId."
      }
    });
  }

  if (message.includes("UNIQUE constraint failed")) {
    return res.status(409).json({
      error: {
        message: "Conflict: record already exists"
      }
    });
  }

  if (
    message.includes("NOT NULL constraint failed") ||
    message.includes("CHECK constraint failed")
  ) {
    return res.status(400).json({
      error: {
        message
      }
    });
  }

  console.error("[SERVER ERROR]", err);

  return res.status(500).json({
    error: {
      message: "Internal Server Error"
    }
  });
}