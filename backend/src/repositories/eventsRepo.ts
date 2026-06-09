import { all, get, run } from "../db/dbClient.js";

export type EventDto = {
  id: number;
  title: string;
  date: string;
  location: string;
  capacity: number;
  description: string | null;
  createdAt: string;
};

export type EventWithStatsDto = EventDto & {
  registrationsCount: number;
  freePlaces: number;
};

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

export async function getAll(filters: EventFilters = {}): Promise<EventWithStatsDto[]> {
  const where: string[] = [];
  const params: Array<string | number | null> = [];

  if (filters.q) {
    where.push("(e.title LIKE ? OR e.location LIKE ? OR e.description LIKE ?)");
    params.push(`%${filters.q}%`, `%${filters.q}%`, `%${filters.q}%`);
  }

  const allowedSortFields = new Set(["id", "title", "date", "location", "capacity", "createdAt"]);
  const sortField = allowedSortFields.has(filters.sort ?? "") ? filters.sort : "id";
  const sortOrder = filters.order?.toUpperCase() === "ASC" ? "ASC" : "DESC";

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
    LIMIT ?;
  `;

  params.push(normalizeLimit(filters.limit));

  return await all<EventWithStatsDto>(sql, params);
}

export async function getById(id: number): Promise<EventWithStatsDto | undefined> {
  return await get<EventWithStatsDto>(
    `
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
    WHERE e.id = ?
    GROUP BY e.id;
    `,
    [id]
  );
}

export async function create(
  title: string,
  date: string,
  location: string,
  capacity: number,
  description: string | null
): Promise<EventDto> {
  const now = new Date().toISOString();

  const result = await run(
    `
    INSERT INTO Events (title, date, location, capacity, description, createdAt)
    VALUES (?, ?, ?, ?, ?, ?);
    `,
    [title, date, location, capacity, description, now]
  );

  const created = await get<EventDto>(
    `
    SELECT id, title, date, location, capacity, description, createdAt
    FROM Events
    WHERE id = ?;
    `,
    [result.lastID]
  );

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
  const result = await run(
    `
    UPDATE Events
    SET title = ?, date = ?, location = ?, capacity = ?, description = ?
    WHERE id = ?;
    `,
    [title, date, location, capacity, description, id]
  );

  if (result.changes === 0) return undefined;

  return await get<EventDto>(
    `
    SELECT id, title, date, location, capacity, description, createdAt
    FROM Events
    WHERE id = ?;
    `,
    [id]
  );
}

export async function remove(id: number): Promise<boolean> {
  const result = await run("DELETE FROM Events WHERE id = ?;", [id]);
  return result.changes > 0;
}

export async function registerUser(eventId: number, userId: number): Promise<{
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
}> {
  const event = await getById(eventId);

  if (!event) {
    const err = new Error("Event not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  if (event.freePlaces <= 0) {
    const err = new Error("No free places for this event") as Error & { status?: number };
    err.status = 409;
    throw err;
  }

  const registeredAt = new Date().toISOString();

  const result = await run(
    `
    INSERT INTO Registrations (eventId, userId, registeredAt)
    VALUES (?, ?, ?);
    `,
    [eventId, userId, registeredAt]
  );

  return {
    id: result.lastID,
    eventId,
    userId,
    registeredAt
  };
}

export async function getRegistrations(eventId: number): Promise<
  Array<{
    id: number;
    eventId: number;
    userId: number;
    userName: string;
    userEmail: string;
    registeredAt: string;
  }>
> {
  return await all(
    `
    SELECT
      r.id,
      r.eventId,
      r.userId,
      u.name AS userName,
      u.email AS userEmail,
      r.registeredAt
    FROM Registrations r
    JOIN Users u ON u.id = r.userId
    WHERE r.eventId = ?
    ORDER BY r.id DESC;
    `,
    [eventId]
  );
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
  }>(
    `
    SELECT
      COUNT(DISTINCT e.id) AS totalEvents,
      COALESCE(SUM(DISTINCT e.capacity), 0) AS totalCapacity,
      COUNT(r.id) AS totalRegistrations,
      COALESCE(AVG(DISTINCT e.capacity), 0) AS averageCapacity
    FROM Events e
    LEFT JOIN Registrations r ON r.eventId = e.id;
    `
  );

  return {
    totalEvents: row?.totalEvents ?? 0,
    totalCapacity: row?.totalCapacity ?? 0,
    totalRegistrations: row?.totalRegistrations ?? 0,
    averageCapacity: row?.averageCapacity ?? 0
  };
}