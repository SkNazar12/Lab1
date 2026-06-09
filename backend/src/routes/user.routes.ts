import { Router } from "express";
import { userController } from "../controllers/user.controller.js";

const router = Router();
router.get("/", userController.getAll);
router.post("/", userController.create);
router.delete("/:id", userController.delete);

export default router;