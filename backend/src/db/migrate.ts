import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { all, run } from "./dbClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type MigrationRow = {
  filename: string;
};

function splitSqlStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export async function migrate(): Promise<void> {
  await run("PRAGMA foreign_keys = ON;");

  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const migrationsDir = path.join(__dirname, "migrations");

  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found: ${migrationsDir}`);
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => /^\d+_.+\.sql$/.test(file))
    .sort();

  const appliedRows = await all<MigrationRow>(
    "SELECT filename FROM schema_migrations ORDER BY filename ASC;"
  );

  const applied = new Set(appliedRows.map((row) => row.filename));

  for (const file of files) {
    if (applied.has(file)) continue;

    const fullPath = path.join(migrationsDir, file);
    const rawSql = fs.readFileSync(fullPath, "utf8");
    const statements = splitSqlStatements(rawSql);

    await run("BEGIN TRANSACTION;");

    try {
      for (const statement of statements) {
        await run(statement);
      }

      await run(
        "INSERT INTO schema_migrations (filename, appliedAt) VALUES (?, ?);",
        [file, new Date().toISOString()]
      );

      await run("COMMIT;");
      console.log(`Migration applied: ${file}`);
    } catch (err) {
      await run("ROLLBACK;");
      throw err;
    }
  }

  console.log("DB schema initialized");
}