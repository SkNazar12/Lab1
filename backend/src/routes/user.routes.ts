import { Router, type NextFunction, type Request, type Response } from "express";
import * as repo from "../repositories/usersRepo.js";

const router = Router();

function parseId(value: string): number | null {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

function validateUserBody(body: any): { email: string; name: string } {
  const errors: Record<string, string[]> = {};

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!email.includes("@")) {
    errors.email = ["Email must contain @"];
  }

  if (name.length < 2) {
    errors.name = ["Name must contain at least 2 characters"];
  }

  if (Object.keys(errors).length > 0) {
    const err = new Error("Validation error") as Error & {
      status?: number;
      code?: string;
      errors?: Record<string, string[]>;
    };

    err.status = 400;
    err.code = "VALIDATION_ERROR";
    err.errors = errors;
    throw err;
  }

  return { email, name };
}

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await repo.getAllUsers();
    res.status(200).json({ data: users, meta: { count: users.length } });
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
          code: "BAD_REQUEST",
          message: "ID must be a positive integer"
        }
      });
    }

    const user = await repo.getUserById(id);

    if (!user) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found"
        }
      });
    }

    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = validateUserBody(req.body);
    const created = await repo.createUser(dto.email, dto.name);
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
          code: "BAD_REQUEST",
          message: "ID must be a positive integer"
        }
      });
    }

    const dto = validateUserBody(req.body);
    const updated = await repo.updateUser(id, dto.email, dto.name);

    if (!updated) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found"
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
          code: "BAD_REQUEST",
          message: "ID must be a positive integer"
        }
      });
    }

    const deleted = await repo.removeUser(id);

    if (!deleted) {
      return res.status(404).json({
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found"
        }
      });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
