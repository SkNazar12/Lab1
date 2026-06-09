import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const sqlite = sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, "..", "..", "data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to open SQLite DB:", err.message);
    process.exit(1);
  }

  console.log("SQLite DB opened:", dbPath);
});