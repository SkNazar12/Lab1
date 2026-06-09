import type { NextFunction, Request, Response } from "express";
import { getUserById } from "../repositories/usersRepo.js";

export async function demoAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const rawUserId = req.header("X-Demo-UserId");

    if (!rawUserId) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Header X-Demo-UserId is required"
        }
      });
    }

    const userId = Number(rawUserId);

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid X-Demo-UserId"
        }
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Unknown user"
        }
      });
    }

    res.locals.currentUserId = user.id;
    next();
  } catch (err) {
    next(err);
  }
}