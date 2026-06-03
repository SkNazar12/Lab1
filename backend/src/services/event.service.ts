import { eventRepo } from "../repositories/event.repository.js";
import type { EventEntity } from "../repositories/event.repository.js";
import { ApiError } from "../middlewares/error.middleware.js";

export class EventService {
    getAll(search?: string, sortBy?: string, sortDir?: string) {
        let items = [...eventRepo.getAll()];
        
        // Додатковий REST-функціонал: Фільтрація (Пошук)
        if (search) items = items.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
        
        // Додатковий REST-функціонал: Сортування
        if (sortBy === "date") {
            items.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return sortDir === "desc" ? dateB - dateA : dateA - dateB;
            });
        }
        return { items };
    }

    getById(id: string) {
        const event = eventRepo.getById(id);
        if (!event) throw new ApiError(404, "NOT_FOUND", "Подію не знайдено");
        return event;
    }

    create(dto: Omit<EventEntity, "id">) {
        this.validate(dto);
        return eventRepo.create(dto);
    }

    update(id: string, dto: Omit<EventEntity, "id">) {
        this.validate(dto);
        const updated = eventRepo.update(id, dto);
        if (!updated) throw new ApiError(404, "NOT_FOUND", "Подію не знайдено");
        return updated;
    }

    delete(id: string) {
        const deleted = eventRepo.delete(id);
        if (!deleted) throw new ApiError(404, "NOT_FOUND", "Подію не знайдено");
    }

    private validate(dto: any) {
        const errors = [];
        if (!dto.title || dto.title.length < 3) errors.push({ field: "title", message: "Назва мінімум 3 символи" });
        if (!dto.date) errors.push({ field: "date", message: "Дата обов'язкова" });
        if (!dto.location) errors.push({ field: "location", message: "Локація обов'язкова" });
        if (!dto.capacity || isNaN(dto.capacity) || dto.capacity < 1) errors.push({ field: "capacity", message: "К-сть місць більше 0" });
        if (!dto.desc) errors.push({ field: "desc", message: "Опис обов'язковий" });

        if (errors.length > 0) {
            throw new ApiError(400, "VALIDATION_ERROR", "Помилка валідації", errors);
        }
    }
}
export const eventService = new EventService();