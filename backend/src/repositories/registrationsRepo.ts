import { all, get, run } from "../db/dbClient.js";
import { getById as getEventById } from "./eventsRepo.js";

export type RegistrationDto = {
  id: number;
  eventId: number;
  userId: number;
  registeredAt: string;
  eventTitle?: string;
  eventDate?: string;
  eventLocation?: string;
};

export async function getMyRegistrations(currentUserId: number): Promise<RegistrationDto[]> {
  return await all<RegistrationDto>(
    `
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
    WHERE r.userId = ?
    ORDER BY r.id DESC;
    `,
    [currentUserId]
  );
}

export async function getByIdForUser(
  registrationId: number,
  currentUserId: number
): Promise<RegistrationDto | undefined> {
  return await get<RegistrationDto>(
    `
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
    WHERE r.id = ? AND r.userId = ?;
    `,
    [registrationId, currentUserId]
  );
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
      const err = new Error("Target event not found") as Error & {
        status?: number;
        code?: string;
      };
      err.status = 404;
      err.code = "EVENT_NOT_FOUND";
      throw err;
    }

    if (targetEvent.freePlaces <= 0) {
      const err = new Error("No free places for target event") as Error & {
        status?: number;
        code?: string;
      };
      err.status = 409;
      err.code = "NO_FREE_PLACES";
      throw err;
    }
  }

  const result = await run(
    `
    UPDATE Registrations
    SET eventId = ?
    WHERE id = ? AND userId = ?;
    `,
    [newEventId, registrationId, currentUserId]
  );

  if (result.changes === 0) {
    return undefined;
  }

  return await getByIdForUser(registrationId, currentUserId);
}

export async function removeForUser(
  registrationId: number,
  currentUserId: number
): Promise<boolean> {
  const result = await run(
    `
    DELETE FROM Registrations
    WHERE id = ? AND userId = ?;
    `,
    [registrationId, currentUserId]
  );

  return result.changes > 0;
}