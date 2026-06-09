import { Router, type NextFunction, type Request, type Response } from "express";
import * as repo from "../repositories/eventsRepo.js";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

function validateEventBody(body: any): {
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string | null;
} {
  const errors: Record<string, string[]> = {};

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const date = typeof body.date === "string" ? body.date.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const capacity = Number(body.capacity);
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  if (title.length < 3) {
    errors.title = ["Title must contain at least 3 characters"];
  }

  if (!date) {
    errors.date = ["Date is required"];
  }

  if (location.length < 2) {
    errors.location = ["Location must contain at least 2 characters"];
  }

  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = ["Capacity must be a positive integer"];
  }

  if (Object.keys(errors).length > 0) {
    const err = new Error("Validation error") as Error & {
      status?: number;
      errors?: Record<string, string[]>;
    };

    err.status = 400;
    err.errors = errors;
    throw err;
  }

  return {
    title,
    date,
    location,
    capacity,
    description
  };
}

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await repo.getAll({
      q: req.query.q?.toString(),
      sort: req.query.sort?.toString(),
      order: req.query.order?.toString(),
      limit: req.query.limit ? Number(req.query.limit) : undefined
    });

    res.status(200).json({ data: events });
  } catch (err) {
    next(err);
  }
});

router.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await repo.getStats();
    res.status(200).json({ data: stats });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: {
          message: "ID must be a positive integer"
        }
      });
    }

    const event = await repo.getById(id);

    if (!event) {
      return res.status(404).json({
        error: {
          message: "Event not found"
        }
      });
    }

    res.status(200).json({ data: event });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = validateEventBody(req.body);

    const created = await repo.create(
      dto.title,
      dto.date,
      dto.location,
      dto.capacity,
      dto.description
    );

    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: {
          message: "ID must be a positive integer"
        }
      });
    }

    const dto = validateEventBody(req.body);

    const updated = await repo.update(
      id,
      dto.title,
      dto.date,
      dto.location,
      dto.capacity,
      dto.description
    );

    if (!updated) {
      return res.status(404).json({
        error: {
          message: "Event not found"
        }
      });
    }

    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        error: {
          message: "ID must be a positive integer"
        }
      });
    }

    const deleted = await repo.remove(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          message: "Event not found"
        }
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

router.post("/:id/register", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseId(req.params.id);
    const userId = Number(req.body.userId);

    if (!eventId) {
      return res.status(400).json({
        error: {
          message: "Event ID must be a positive integer"
        }
      });
    }

    if (!Number.isInteger(userId) || userId < 1) {
      return res.status(400).json({
        error: {
          message: "userId must be a positive integer"
        }
      });
    }

    const registration = await repo.registerUser(eventId, userId);

    res.status(201).json({ data: registration });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/registrations", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventId = parseId(req.params.id);

    if (!eventId) {
      return res.status(400).json({
        error: {
          message: "Event ID must be a positive integer"
        }
      });
    }

    const registrations = await repo.getRegistrations(eventId);
    res.status(200).json({ data: registrations });
  } catch (err) {
    next(err);
  }
});

export default router;