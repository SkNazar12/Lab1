import { get, run } from "./dbClient.js";
import { migrate } from "./migrate.js";

type CountRow = {
  count: number;
};

export async function seedIfEmpty(): Promise<void> {
  const now = new Date().toISOString();

  const usersCount = await get<CountRow>("SELECT COUNT(*) AS count FROM Users;");

  if ((usersCount?.count ?? 0) > 0) {
    return;
  }

  await run(
    "INSERT INTO Users (id, email, name, createdAt) VALUES (?, ?, ?, ?);",
    [1, "student1@knu.ua", "Nazar", now]
  );

  await run(
    "INSERT INTO Users (id, email, name, createdAt) VALUES (?, ?, ?, ?);",
    [2, "student2@knu.ua", "Olena", now]
  );

  await run(
    "INSERT INTO Users (id, email, name, createdAt) VALUES (?, ?, ?, ?);",
    [3, "student3@knu.ua", "Ivan", now]
  );

  await run(
    `
    INSERT INTO Events (id, title, date, location, capacity, description, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      1,
      "Основи веброзробки",
      "2026-06-15",
      "Аудиторія 305",
      25,
      "Факультатив для студентів, які хочуть краще розібратися з HTML, CSS та JavaScript.",
      now
    ]
  );

  await run(
    `
    INSERT INTO Events (id, title, date, location, capacity, description, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      2,
      "Підготовка до хакатону",
      "2026-06-20",
      "Коворкінг факультету",
      15,
      "Практична подія для командної роботи над IT-проєктами.",
      now
    ]
  );

  await run(
    `
    INSERT INTO Registrations (id, eventId, userId, registeredAt)
    VALUES (?, ?, ?, ?);
    `,
    [1, 1, 1, now]
  );

  await run(
    `
    INSERT INTO Registrations (id, eventId, userId, registeredAt)
    VALUES (?, ?, ?, ?);
    `,
    [2, 2, 2, now]
  );

  console.log("Seed data inserted");
}

async function main() {
  await migrate();
  await seedIfEmpty();
}

if (process.argv[1]?.endsWith("seed.ts")) {
  main().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}