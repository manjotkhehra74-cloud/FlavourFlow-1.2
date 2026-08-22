import fs from 'node:fs';
import path from 'node:path';

// Production uses better-sqlite3 on Node 20; the node:sqlite adapter is a dev-only fallback.
async function openDatabase(file) {
  try {
    const { default: Database } = await import('better-sqlite3');
    return new Database(file);
  } catch (error) {
    console.warn(`better-sqlite3 unavailable (${error.code || error.message}) — using the node:sqlite development fallback`);
    const { default: FallbackDatabase } = await import('./sqlite-fallback.js');
    return new FallbackDatabase(file);
  }
}

const databasePath = process.env.DATABASE_PATH || './data/hrmate.sqlite';
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
export const db = await openDatabase(databasePath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT UNIQUE, email TEXT UNIQUE,
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'employee', active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE REFERENCES users(id), employee_code TEXT UNIQUE,
  name TEXT NOT NULL, phone TEXT, role_title TEXT, department TEXT, shift_name TEXT,
  join_date TEXT, photo_url TEXT, active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY, employee_id INTEGER NOT NULL REFERENCES employees(id), attendance_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK(status IN ('present','late','half_day','absent')),
  punch_in_at TEXT, punch_out_at TEXT, in_latitude REAL, in_longitude REAL,
  out_latitude REAL, out_longitude REAL, in_selfie_url TEXT, out_selfie_url TEXT,
  entry_source TEXT NOT NULL DEFAULT 'mobile' CHECK(entry_source IN ('mobile','manual')),
  manual_note TEXT, created_by INTEGER REFERENCES users(id), updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, attendance_date)
);
CREATE TABLE IF NOT EXISTS leave_balances (
  employee_id INTEGER PRIMARY KEY REFERENCES employees(id), casual REAL NOT NULL DEFAULT 7,
  sick REAL NOT NULL DEFAULT 5, earned REAL NOT NULL DEFAULT 12, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS leaves (
  id INTEGER PRIMARY KEY, employee_id INTEGER NOT NULL REFERENCES employees(id),
  leave_type TEXT NOT NULL CHECK(leave_type IN ('casual','sick','earned')),
  start_date TEXT NOT NULL, end_date TEXT NOT NULL, days REAL NOT NULL, reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  reviewer_id INTEGER REFERENCES users(id), reviewer_note TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), title TEXT NOT NULL,
  body TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'info', read_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY, actor_id INTEGER REFERENCES users(id), action TEXT NOT NULL,
  entity_type TEXT, entity_id TEXT, details TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status, start_date);
`);

export const employeeForUser = (userId) => db.prepare('SELECT * FROM employees WHERE user_id = ? AND active = 1').get(userId);
export const todayIst = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
