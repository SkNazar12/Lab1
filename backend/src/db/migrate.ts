import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { all, escapeSqlString, run } from "./dbClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type MigrationRow = {
  filename: string;
};

export async function migrate(): Promise<void> {
  await run("PRAGMA foreign_keys = ON;");

  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const compiledMigrationsDir = path.join(__dirname, "migrations");
  const sourceMigrationsDir = path.join(__dirname, "..", "..", "src", "db", "migrations");
  const migrationsDir = fs.existsSync(compiledMigrationsDir)
    ? compiledMigrationsDir
    : sourceMigrationsDir;

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
    const sql = fs.readFileSync(fullPath, "utf8").trim();

    if (!sql) continue;

    await run(sql);

    const now = new Date().toISOString();
    await run(`
      INSERT INTO schema_migrations (filename, appliedAt)
      VALUES ('${escapeSqlString(file)}', '${escapeSqlString(now)}');
    `);

    console.log(`Migration applied: ${file}`);
  }

  console.log("DB schema initialized");
}
