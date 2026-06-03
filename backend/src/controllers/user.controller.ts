import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";

export class UserController {
    getAll = (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = userService.getAll();
            res.status(200).json(users);
        } catch (e) { next(e); }
    };

    create = (req: Request, res: Response, next: NextFunction) => {
        try {
            const newUser = userService.create(req.body);
            res.status(201).json(newUser);
        } catch (e) { next(e); }
    };

    delete = (req: Request, res: Response, next: NextFunction) => {
        try {
            userService.delete(req.params.id);
            res.status(204).send();
        } catch (e) { next(e); }
    };
}
export const userController = new UserController();