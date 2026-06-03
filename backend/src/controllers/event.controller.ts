import type { Request, Response, NextFunction } from "express";
import { eventService } from "../services/event.service.js";

export class EventController {
    getAll = (req: Request, res: Response, next: NextFunction) => {
        try {
            const { search, sortBy, sortDir } = req.query;
            const result = eventService.getAll(search as string, sortBy as string, sortDir as string);
            res.status(200).json(result);
        } catch (e) { next(e); }
    };

    getById = (req: Request, res: Response, next: NextFunction) => {
        try {
            const event = eventService.getById(req.params.id as string);
            res.status(200).json(event);
        } catch (e) { next(e); }
    };

    create = (req: Request, res: Response, next: NextFunction) => {
        try {
            const created = eventService.create(req.body);
            res.status(201).json(created);
        } catch (e) { next(e); }
    };

    update = (req: Request, res: Response, next: NextFunction) => {
        try {
            const updated = eventService.update(req.params.id as string, req.body);
            res.status(200).json(updated);
        } catch (e) { next(e); }
    };

    delete = (req: Request, res: Response, next: NextFunction) => {
        try {
            eventService.delete(req.params.id as string);
            res.status(204).send();
        } catch (e) { next(e); }
    };
}
export const eventController = new EventController();