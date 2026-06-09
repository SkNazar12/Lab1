import type { RegistrationDto } from "../dtos/registration.dto.js";
import { all, get, run } from "../db/dbClient.js";
import { getById as getEventById } from "./eventsRepo.js";

export async function getAllRegistrations(): Promise<RegistrationDto[]> {
  return await all<RegistrationDto>(`
    SELECT
      r.id,
      r.eventId,
      r.userId,
      r.registeredAt,
      e.title AS eventTitle,
      e.date AS eventDate,
      e.location AS eventLocation,
      u.email AS userEmail,
      u.name AS userName
    FROM Registrations r
    JOIN Events e ON e.id = r.eventId
    JOIN Users u ON u.id = r.userId
    ORDER BY r.id DESC;
  `);
}

export async function getMyRegistrations(currentUserId: number): Promise<RegistrationDto[]> {
  return await all<RegistrationDto>(`
    SELECT
      r.id,
      r.eventId,
      r.userId,
      r.registeredAt,
      e.title AS eventTitle,
      e.date AS eventDate,
      e.location AS eventLocation
    FROM Registrations r
    JOIN Events e ON e.id = r.eventId
    WHERE r.userId = ${currentUserId}
    ORDER BY r.id DESC;
  `);
}

export async function getById(registrationId: number): Promise<RegistrationDto | undefined> {
  return await get<RegistrationDto>(`
    SELECT
      r.id,
      r.eventId,
      r.userId,
      r.registeredAt,
      e.title AS eventTitle,
      e.date AS eventDate,
      e.location AS eventLocation,
      u.email AS userEmail,
      u.name AS userName
    FROM Registrations r
    JOIN Events e ON e.id = r.eventId
    JOIN Users u ON u.id = r.userId
    WHERE r.id = ${registrationId};
  `);
}

export async function getByIdForUser(
  registrationId: number,
  currentUserId: number
): Promise<RegistrationDto | undefined> {
  return await get<RegistrationDto>(`
    SELECT
      r.id,
      r.eventId,
      r.userId,
      r.registeredAt,
      e.title AS eventTitle,
      e.date AS eventDate,
      e.location AS eventLocation
    FROM Registrations r
    JOIN Events e ON e.id = r.eventId
    WHERE r.id = ${registrationId} AND r.userId = ${currentUserId};
  `);
}

export async function createRegistration(eventId: number, userId: number): Promise<RegistrationDto> {
  const event = await getEventById(eventId);

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
    VALUES (${eventId}, ${userId}, '${registeredAt}');
  `);

  const created = await getById(result.lastID);

  if (!created) {
    throw new Error("Registration was created but cannot be loaded");
  }

  return created;
}

export async function updateForUser(
  registrationId: number,
  currentUserId: number,
  newEventId: number
): Promise<RegistrationDto | undefined> {
  const currentRegistration = await getByIdForUser(registrationId, currentUserId);

  if (!currentRegistration) {
    return undefined;
  }

  if (currentRegistration.eventId !== newEventId) {
    const targetEvent = await getEventById(newEventId);

    if (!targetEvent) {
      const err = new Error("Target event not found") as Error & { status?: number; code?: string };
      err.status = 404;
      err.code = "EVENT_NOT_FOUND";
      throw err;
    }

    if (targetEvent.freePlaces <= 0) {
      const err = new Error("No free places for target event") as Error & { status?: number; code?: string };
      err.status = 409;
      err.code = "NO_FREE_PLACES";
      throw err;
    }
  }

  const result = await run(`
    UPDATE Registrations
    SET eventId = ${newEventId}
    WHERE id = ${registrationId} AND userId = ${currentUserId};
  `);

  if (result.changes === 0) return undefined;
  return await getByIdForUser(registrationId, currentUserId);
}

export async function updateRegistration(
  registrationId: number,
  eventId: number,
  userId: number
): Promise<RegistrationDto | undefined> {
  const result = await run(`
    UPDATE Registrations
    SET eventId = ${eventId}, userId = ${userId}
    WHERE id = ${registrationId};
  `);

  if (result.changes === 0) return undefined;
  return await getById(registrationId);
}

export async function removeForUser(registrationId: number, currentUserId: number): Promise<boolean> {
  const result = await run(`
    DELETE FROM Registrations
    WHERE id = ${registrationId} AND userId = ${currentUserId};
  `);

  return result.changes > 0;
}

export async function removeRegistration(registrationId: number): Promise<boolean> {
  const result = await run(`DELETE FROM Registrations WHERE id = ${registrationId};`);
  return result.changes > 0;
}
