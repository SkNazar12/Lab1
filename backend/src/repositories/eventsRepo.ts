import type { EventDto, EventWithStatsDto } from "../dtos/event.dto.js";
import { all, escapeSqlString, get, run, sqlString } from "../db/dbClient.js";

export type EventFilters = {
  q?: string;
  sort?: string;
  order?: string;
  limit?: number;
};

function normalizeLimit(limit?: number): number {
  if (!limit || Number.isNaN(limit) || limit < 1) return 50;
  if (limit > 100) return 100;
  return Math.floor(limit);
}

function normalizeSort(sort?: string): string {
  const allowedSortFields = new Set(["id", "title", "date", "location", "capacity", "createdAt"]);
  return allowedSortFields.has(sort ?? "") ? String(sort) : "id";
}

function normalizeOrder(order?: string): "ASC" | "DESC" {
  return order?.toUpperCase() === "ASC" ? "ASC" : "DESC";
}

export async function getAll(filters: EventFilters = {}): Promise<EventWithStatsDto[]> {
  const where: string[] = [];

  if (filters.q) {
    const q = escapeSqlString(filters.q);
    where.push(`(e.title LIKE '%${q}%' OR e.location LIKE '%${q}%' OR e.description LIKE '%${q}%')`);
  }

  const sortField = normalizeSort(filters.sort);
  const sortOrder = normalizeOrder(filters.order);

  let sql = `
    SELECT
      e.id,
      e.title,
      e.date,
      e.location,
      e.capacity,
      e.description,
      e.createdAt,
      COUNT(r.id) AS registrationsCount,
      e.capacity - COUNT(r.id) AS freePlaces
    FROM Events e
    LEFT JOIN Registrations r ON r.eventId = e.id
  `;

  if (where.length > 0) {
    sql += ` WHERE ${where.join(" AND ")}`;
  }

  sql += `
    GROUP BY e.id
    ORDER BY e.${sortField} ${sortOrder}
    LIMIT ${normalizeLimit(filters.limit)};
  `;

  return await all<EventWithStatsDto>(sql);
}

export async function getById(id: number): Promise<EventWithStatsDto | undefined> {
  return await get<EventWithStatsDto>(`
    SELECT
      e.id,
      e.title,
      e.date,
      e.location,
      e.capacity,
      e.description,
      e.createdAt,
      COUNT(r.id) AS registrationsCount,
      e.capacity - COUNT(r.id) AS freePlaces
    FROM Events e
    LEFT JOIN Registrations r ON r.eventId = e.id
    WHERE e.id = ${id}
    GROUP BY e.id;
  `);
}

export async function create(
  title: string,
  date: string,
  location: string,
  capacity: number,
  description: string | null
): Promise<EventDto> {
  const now = new Date().toISOString();

  const result = await run(`
    INSERT INTO Events (title, date, location, capacity, description, createdAt)
    VALUES (
      '${escapeSqlString(title)}',
      '${escapeSqlString(date)}',
      '${escapeSqlString(location)}',
      ${capacity},
      ${sqlString(description)},
      '${escapeSqlString(now)}'
    );
  `);

  const created = await get<EventDto>(`
    SELECT id, title, date, location, capacity, description, createdAt
    FROM Events
    WHERE id = ${result.lastID};
  `);

  if (!created) {
    throw new Error("Event was created but cannot be loaded");
  }

  return created;
}

export async function update(
  id: number,
  title: string,
  date: string,
  location: string,
  capacity: number,
  description: string | null
): Promise<EventDto | undefined> {
  const result = await run(`
    UPDATE Events
    SET
      title = '${escapeSqlString(title)}',
      date = '${escapeSqlString(date)}',
      location = '${escapeSqlString(location)}',
      capacity = ${capacity},
      description = ${sqlString(description)}
    WHERE id = ${id};
  `);

  if (result.changes === 0) return undefined;

  return await get<EventDto>(`
    SELECT id, title, date, location, capacity, description, createdAt
    FROM Events
    WHERE id = ${id};
  `);
}

export async function remove(id: number): Promise<boolean> {
  const result = await run(`DELETE FROM Events WHERE id = ${id};`);
  return result.changes > 0;
}

export async function registerCurrentUser(eventId: number, currentUserId: number): Promise<{
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
}> {
  const event = await getById(eventId);

  if (!event) {
    const err = new Error("Event not found") as Error & { status?: number; code?: string };
    err.status = 404;
    err.code = "EVENT_NOT_FOUND";
    throw err;
  }

  if (event.freePlaces <= 0) {
    const err = new Error("No free places for this event") as Error & { status?: number; code?: string };
    err.status = 409;
    err.code = "NO_FREE_PLACES";
    throw err;
  }

  const registeredAt = new Date().toISOString();

  const result = await run(`
    INSERT INTO Registrations (eventId, userId, registeredAt)
    VALUES (${eventId}, ${currentUserId}, '${escapeSqlString(registeredAt)}');
  `);

  return {
    id: result.lastID,
    eventId,
    userId: currentUserId,
    registeredAt
  };
}

export async function getStats(): Promise<{
  totalEvents: number;
  totalCapacity: number;
  totalRegistrations: number;
  averageCapacity: number;
}> {
  const row = await get<{
    totalEvents: number;
    totalCapacity: number;
    totalRegistrations: number;
    averageCapacity: number;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM Events) AS totalEvents,
      (SELECT COALESCE(SUM(capacity), 0) FROM Events) AS totalCapacity,
      (SELECT COUNT(*) FROM Registrations) AS totalRegistrations,
      (SELECT COALESCE(AVG(capacity), 0) FROM Events) AS averageCapacity;
  `);

  return {
    totalEvents: row?.totalEvents ?? 0,
    totalCapacity: row?.totalCapacity ?? 0,
    totalRegistrations: row?.totalRegistrations ?? 0,
    averageCapacity: row?.averageCapacity ?? 0
  };
}

export async function unsafeSearch(q: string): Promise<EventDto[]> {
  // Навчальна демонстрація для ЛР3: користувацький ввід навмисно вставляється
  // у SQL через конкатенацію. У фінальній роботі це треба замінити параметрами.
  const sql = `
    SELECT id, title, date, location, capacity, description, createdAt
    FROM Events
    WHERE title LIKE '%${q}%'
       OR location LIKE '%${q}%'
       OR description LIKE '%${q}%'
    ORDER BY date DESC
    LIMIT 20;
  `;

  return await all<EventDto>(sql);
}
