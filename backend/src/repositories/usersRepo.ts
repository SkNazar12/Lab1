import type { UserDto } from "../dtos/user.dto.js";
import { all, escapeSqlString, get, run } from "../db/dbClient.js";

export async function getAllUsers(): Promise<UserDto[]> {
  return await all<UserDto>(`
    SELECT id, email, name, createdAt
    FROM Users
    ORDER BY id DESC;
  `);
}

export async function getUserById(id: number): Promise<UserDto | undefined> {
  return await get<UserDto>(`
    SELECT id, email, name, createdAt
    FROM Users
    WHERE id = ${id};
  `);
}

export async function createUser(email: string, name: string): Promise<UserDto> {
  const now = new Date().toISOString();

  const result = await run(`
    INSERT INTO Users (email, name, createdAt)
    VALUES ('${escapeSqlString(email)}', '${escapeSqlString(name)}', '${escapeSqlString(now)}');
  `);

  const created = await getUserById(result.lastID);

  if (!created) {
    throw new Error("User was created but cannot be loaded");
  }

  return created;
}

export async function updateUser(id: number, email: string, name: string): Promise<UserDto | undefined> {
  const result = await run(`
    UPDATE Users
    SET email = '${escapeSqlString(email)}', name = '${escapeSqlString(name)}'
    WHERE id = ${id};
  `);

  if (result.changes === 0) return undefined;
  return await getUserById(id);
}

export async function removeUser(id: number): Promise<boolean> {
  const result = await run(`DELETE FROM Users WHERE id = ${id};`);
  return result.changes > 0;
}
