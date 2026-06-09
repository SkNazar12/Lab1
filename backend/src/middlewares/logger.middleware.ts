import type { NextFunction, Request, Response } from "express";

export function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${durationMs}ms`);
  });

  next();
}