import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);

const { DatabaseSync } = require("node:sqlite") as {
  DatabaseSync: new (filename: string) => {
    exec(sql: string): void;
    prepare(sql: string): {
      all(): unknown[];
      get(): unknown | undefined;
      run(): { changes: number; lastInsertRowid?: number | bigint };
    };
  };
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

console.log("SQLite DB opened:", dbPath);
