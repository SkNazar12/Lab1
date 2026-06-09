import { v4 as uuidv4 } from "uuid";

export interface UserEntity {
    id: string;
    name: string;
    email: string;
}

class UserRepository {
    private users: UserEntity[] = [];

    getAll() { return this.users; }
    getById(id: string) { return this.users.find(u => u.id === id); }
    create(data: Omit<UserEntity, "id">) {
        const newUser = { id: uuidv4(), ...data };
        this.users.push(newUser);
        return newUser;
    }
    delete(id: string) {
        const initialLength = this.users.length;
        this.users = this.users.filter(u => u.id !== id);
        return this.users.length !== initialLength;
    }
}
export const userRepo = new UserRepository();