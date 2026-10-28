// Tiny JSON-file store so the app runs with zero setup.
// For production, swap these functions for a real database (Postgres, MongoDB, etc).
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "db.json");

export function readDb() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return { users: [], reviews: [] };
  }
}

export function writeDb(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, FILE);
}
