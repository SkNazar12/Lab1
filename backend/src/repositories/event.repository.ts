import { v4 as uuidv4 } from "uuid";

export interface EventEntity {
    id: string; title: string; date: string; location: string; capacity: number; desc: string;
}

class EventRepository {
    private events: EventEntity[] = [];

    getAll() { return this.events; }
    getById(id: string) { return this.events.find(e => e.id === id); }
    create(data: Omit<EventEntity, "id">) {
        const newEvent = { id: uuidv4(), ...data };
        this.events.push(newEvent);
        return newEvent;
    }
    update(id: string, data: Partial<EventEntity>) {
        const index = this.events.findIndex(e => e.id === id);
        if (index === -1) return null;
        this.events[index] = { ...this.events[index], ...data };
        return this.events[index];
    }
    delete(id: string) {
        const initialLength = this.events.length;
        this.events = this.events.filter(e => e.id !== id);
        return this.events.length !== initialLength;
    }
}
export const eventRepo = new EventRepository();