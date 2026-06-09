import { pathToFileURL } from "url";
import { get, run } from "./dbClient.js";
import { migrate } from "./migrate.js";

type CountRow = {
  count: number;
};

export async function seedIfEmpty(): Promise<void> {
  const usersCount = await get<CountRow>("SELECT COUNT(*) AS count FROM Users;");

  if ((usersCount?.count ?? 0) > 0) {
    console.log("Seed skipped: database already contains users");
    return;
  }

  const now = new Date().toISOString();

  await run(`
    INSERT INTO Users (id, email, name, createdAt)
    VALUES (1, 'student1@knu.ua', 'Nazar', '${now}');
  `);

  await run(`
    INSERT INTO Users (id, email, name, createdAt)
    VALUES (2, 'student2@knu.ua', 'Olena', '${now}');
  `);

  await run(`
    INSERT INTO Users (id, email, name, createdAt)
    VALUES (3, 'student3@knu.ua', 'Ivan', '${now}');
  `);

  await run(`
    INSERT INTO Events (id, title, date, location, capacity, description, createdAt)
    VALUES (1, 'Основи веброзробки', '2026-06-15', 'Аудиторія 305', 25, 'Факультатив для студентів, які хочуть краще розібратися з HTML, CSS та JavaScript.', '${now}');
  `);

  await run(`
    INSERT INTO Events (id, title, date, location, capacity, description, createdAt)
    VALUES (2, 'Підготовка до хакатону', '2026-06-20', 'Коворкінг факультету', 15, 'Практична подія для командної роботи над IT-проєктами.', '${now}');
  `);

  await run(`
    INSERT INTO Events (id, title, date, location, capacity, description, createdAt)
    VALUES (3, 'SQLite workshop', '2026-06-25', 'Лабораторія 204', 20, 'Практикум з реляційної моделі, CRUD-запитів та JOIN.', '${now}');
  `);

  await run(`
    INSERT INTO Registrations (id, eventId, userId, registeredAt)
    VALUES (1, 1, 1, '${now}');
  `);

  await run(`
    INSERT INTO Registrations (id, eventId, userId, registeredAt)
    VALUES (2, 1, 2, '${now}');
  `);

  await run(`
    INSERT INTO Registrations (id, eventId, userId, registeredAt)
    VALUES (3, 2, 3, '${now}');
  `);

  console.log("Seed completed");
}

async function main(): Promise<void> {
  await migrate();
  await seedIfEmpty();
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectRun) {
  main().catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
}
