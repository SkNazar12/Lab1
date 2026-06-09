import { get } from "../db/dbClient.js";

export type UserDto = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export async function getUserById(id: number): Promise<UserDto | undefined> {
  return await get<UserDto>(
    `
    SELECT id, email, name, createdAt
    FROM Users
    WHERE id = ?;
    `,
    [id]
  );
}