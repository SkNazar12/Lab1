import { db } from "./dt.js";

function logSql(sql: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SQL]", sql.trim());
  }
}

export function escapeSqlString(value: unknown): string {
  return String(value).replace(/'/g, "''");
}

export function sqlString(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  return `'${escapeSqlString(value)}'`;
}

export function sqlNumber(value: unknown): number {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error("Invalid number value for SQL query");
  }

  return numberValue;
}

export async function all<T>(sql: string): Promise<T[]> {
  logSql(sql);
  return db.prepare(sql).all() as T[];
}

export async function get<T>(sql: string): Promise<T | undefined> {
  logSql(sql);
  return db.prepare(sql).get() as T | undefined;
}

export async function run(sql: string): Promise<{ lastID: number; changes: number }> {
  logSql(sql);
  const result = db.prepare(sql).run();

  return {
    lastID: Number(result.lastInsertRowid ?? 0),
    changes: result.changes
  };
}
