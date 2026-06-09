import type { NextFunction, Request, Response } from "express";

type AppError = Error & {
  status?: number;
  code?: string;
  errors?: Record<string, string[]>;
};

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;

  if (process.env.NODE_ENV !== "production") {
    console.error("[ERROR]", err);
  }

  if (err.message?.includes("UNIQUE constraint failed")) {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "Conflict: record already exists"
      }
    });
  }

  if (err.message?.includes("FOREIGN KEY constraint failed")) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Related record does not exist"
      }
    });
  }

  if (
    err.message?.includes("CHECK constraint failed") ||
    err.message?.includes("NOT NULL constraint failed")
  ) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        message: "Invalid data"
      }
    });
  }

  if (status !== 500) {
    return res.status(status).json({
      error: {
        code: err.code ?? "REQUEST_ERROR",
        message: err.message,
        errors: err.errors ?? undefined
      }
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error"
    }
  });
}