import { db } from "./dt.js";

type SqlParam = string | number | null;

function logSql(sql: string, params: SqlParam[] = []): void {
  if (process.env.NODE_ENV !== "production") {
    console.log("[SQL]", sql.trim(), params.length ? params : "");
  }
}

export function all<T>(sql: string, params: SqlParam[] = []): Promise<T[]> {
  logSql(sql, params);

  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
}

export function get<T>(sql: string, params: SqlParam[] = []): Promise<T | undefined> {
  logSql(sql, params);

  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
}

export function run(
  sql: string,
  params: SqlParam[] = []
): Promise<{ lastID: number; changes: number }> {
  logSql(sql, params);

  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);

      resolve({
        lastID: this.lastID,
        changes: this.changes
      });
    });
  });
}