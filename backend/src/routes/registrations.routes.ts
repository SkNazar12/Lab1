import { Router, type NextFunction, type Request, type Response } from "express";
import { demoAuth } from "../middlewares/demoAuth.js";
import * as repo from "../repositories/registrationsRepo.js";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const registrations = await repo.getAllRegistrations();
    res.status(200).json({ data: registrations, meta: { count: registrations.length } });
  } catch (err) {
    next(err);
  }
});

router.get("/me", demoAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = Number(res.locals.currentUserId);
    const registrations = await repo.getMyRegistrations(currentUserId);
    res.status(200).json({ data: registrations, meta: { count: registrations.length } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrationId = parseId(req.params.id);

    if (!registrationId) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Registration ID must be a positive integer" }
      });
    }

    const registration = await repo.getById(registrationId);

    if (!registration) {
      return res.status(404).json({
        error: { code: "REGISTRATION_NOT_FOUND", message: "Registration not found" }
      });
    }

    res.status(200).json({ data: registration });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = Number(req.body.eventId);
    const userId = Number(req.body.userId);

    if (!Number.isInteger(eventId) || eventId < 1 || !Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "eventId and userId must be positive integers" }
      });
    }

    const created = await repo.createRegistration(eventId, userId);
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrationId = parseId(req.params.id);
    const eventId = Number(req.body.eventId);
    const userId = Number(req.body.userId);

    if (!registrationId) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Registration ID must be a positive integer" }
      });
    }

    if (!Number.isInteger(eventId) || eventId < 1 || !Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "eventId and userId must be positive integers" }
      });
    }

    const updated = await repo.updateRegistration(registrationId, eventId, userId);

    if (!updated) {
      return res.status(404).json({
        error: { code: "REGISTRATION_NOT_FOUND", message: "Registration not found" }
      });
    }

    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/my-event", demoAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrationId = parseId(req.params.id);
    const newEventId = Number(req.body.eventId);

    if (!registrationId) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Registration ID must be a positive integer" }
      });
    }

    if (!Number.isInteger(newEventId) || newEventId < 1) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "eventId must be a positive integer" }
      });
    }

    const currentUserId = Number(res.locals.currentUserId);
    const updated = await repo.updateForUser(registrationId, currentUserId, newEventId);

    if (!updated) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Access denied" }
      });
    }

    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const registrationId = parseId(req.params.id);

    if (!registrationId) {
      return res.status(400).json({
        error: { code: "BAD_REQUEST", message: "Registration ID must be a positive integer" }
      });
    }

    const deleted = await repo.removeRegistration(registrationId);

    if (!deleted) {
      return res.status(404).json({
        error: { code: "REGISTRATION_NOT_FOUND", message: "Registration not found" }
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
