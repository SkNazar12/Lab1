import { userRepo, type UserEntity } from "../repositories/user.repository.js";
import { ApiError } from "../middlewares/error.middleware.js";

export class UserService {
    getAll() { return { items: userRepo.getAll() }; }

    create(dto: Omit<UserEntity, "id">) {
        if (!dto.name || dto.name.length < 2) {
            throw new ApiError(400, "VALIDATION_ERROR", "Ім'я занадто коротке");
        }
        if (!dto.email.includes("@")) {
            throw new ApiError(400, "VALIDATION_ERROR", "Некоректний формат email");
        }
        return userRepo.create(dto);
    }

    delete(id: string) {
        const deleted = userRepo.delete(id);
        if (!deleted) throw new ApiError(404, "NOT_FOUND", "Користувача не знайдено");
    }
}
export const userService = new UserService();