import { db } from './db/index.js';

const SENSITIVE = new Set(['password', 'passwordHash', 'password_hash', 'token']);
/** Keeps secrets such as new-user passwords out of the audit trail. */
const safeDetails = (body) => JSON.stringify(
  Object.fromEntries(Object.entries(body ?? {}).map(([key, value]) => [key, SENSITIVE.has(key) ? '[redacted]' : value])),
);

/** Audit every protected mutation and notify all active users. */
export function audit({ action, entityType, entityId, title, body }, handler) {
  return (req, res, next) => {
    try {
      const result = handler(req, res, next);
      // Record only successful mutations: the handler answers synchronously, so a 2xx
      // response means the write went through.
      if (res.statusCode < 400) {
        db.prepare('INSERT INTO audit_log (actor_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
          .run(req.user?.id ?? null, action, entityType ?? null, entityId?.(req) ?? null, safeDetails(req.body));
        const users = db.prepare('SELECT id FROM users WHERE active = 1').all();
        const addNotice = db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)');
        const insertMany = db.transaction(() => users.forEach(({ id }) => addNotice.run(id, title, body, 'audit')));
        insertMany();
      }
      return result;
    } catch (error) { return next(error); }
  };
}
