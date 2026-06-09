import { Router, type NextFunction, type Request, type Response } from "express";
import { demoAuth } from "../middlewares/demoAuth.js";
import * as repo from "../repositories/registrationsRepo.js";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

router.get("/me", demoAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = Number(res.locals.currentUserId);
    const registrations = await repo.getMyRegistrations(currentUserId);

    res.status(200).json({ data: registrations });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", demoAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrationId = parseId(req.params.id);

    if (!registrationId) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "Registration ID must be a positive integer"
        }
      });
    }

    const currentUserId = Number(res.locals.currentUserId);
    const registration = await repo.getByIdForUser(registrationId, currentUserId);

    if (!registration) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Access denied"
        }
      });
    }

    res.status(200).json({ data: registration });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", demoAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrationId = parseId(req.params.id);
    const newEventId = Number(req.body.eventId);

    if (!registrationId) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "Registration ID must be a positive integer"
        }
      });
    }

    if (!Number.isInteger(newEventId) || newEventId < 1) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "eventId must be a positive integer"
        }
      });
    }

    const currentUserId = Number(res.locals.currentUserId);
    const updated = await repo.updateForUser(registrationId, currentUserId, newEventId);

    if (!updated) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Access denied"
        }
      });
    }

    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", demoAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrationId = parseId(req.params.id);

    if (!registrationId) {
      return res.status(400).json({
        error: {
          code: "BAD_REQUEST",
          message: "Registration ID must be a positive integer"
        }
      });
    }

    const currentUserId = Number(res.locals.currentUserId);
    const deleted = await repo.removeForUser(registrationId, currentUserId);

    if (!deleted) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "Access denied"
        }
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;