import { Router } from 'express';
import { db } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { hasPermission } from '../rbac.js';

const router = Router();
router.use(authRequired, requirePerm('notifications.view'));

router.get('/', (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 200').all(req.user.id);
  res.json({
    notifications,
    unread: notifications.filter((item) => !item.read_at).length,
    canBroadcast: hasPermission(req.user.role, 'settings.manage'),
  });
});

router.post('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE user_id=? AND read_at IS NULL').run(req.user.id);
  res.json({ ok: true });
});

router.post('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

/** Sends an announcement to every active account and records it in the audit trail. */
router.post('/broadcast', requirePerm('settings.manage'), (req, res) => {
  const title = String(req.body?.title || '').trim();
  const body = String(req.body?.body || '').trim();
  if (!title || !body) return res.status(400).json({ error: 'A title and a message are both required' });

  const recipients = db.prepare('SELECT id FROM users WHERE active = 1').all();
  const insert = db.prepare("INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, 'broadcast')");
  db.transaction(() => recipients.forEach(({ id }) => insert.run(id, title, body)))();
  db.prepare('INSERT INTO audit_log (actor_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, 'notifications.broadcast', 'notification', null, JSON.stringify({ title, recipients: recipients.length }));

  return res.status(201).json({ ok: true, recipients: recipients.length });
});

export default router;
