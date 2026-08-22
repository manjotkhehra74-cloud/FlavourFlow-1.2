/**
 * Development fallback driver.
 *
 * Production runs on Node 20 with `better-sqlite3`. When that native module is not
 * built (for example in a sandbox that cannot compile addons), HRMate falls back to
 * the built-in `node:sqlite` module through this thin adapter so the API and the web
 * console still run. It implements only the surface `src/db/index.js` relies on.
 */
import { DatabaseSync } from 'node:sqlite';

class Statement {
  constructor(statement) { this.statement = statement; }
  get(...params) { return this.statement.get(...params) ?? undefined; }
  all(...params) { return this.statement.all(...params); }
  run(...params) { return this.statement.run(...params); }
}

export default class FallbackDatabase {
  constructor(path) { this.handle = new DatabaseSync(path); }
  pragma(statement) { return this.handle.exec(`PRAGMA ${statement}`); }
  exec(sql) { return this.handle.exec(sql); }
  prepare(sql) { return new Statement(this.handle.prepare(sql)); }
  transaction(fn) {
    return (...args) => {
      this.handle.exec('BEGIN');
      try { const result = fn(...args); this.handle.exec('COMMIT'); return result; }
      catch (error) { this.handle.exec('ROLLBACK'); throw error; }
    };
  }
  close() { this.handle.close(); }
}
