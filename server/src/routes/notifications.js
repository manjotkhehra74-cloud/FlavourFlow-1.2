import { Router } from 'express';
import { db } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';

const router = Router();
router.use(authRequired, requirePerm('notifications.view'));
router.get('/', (req, res) => res.json({ notifications: db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100').all(req.user.id) }));
router.post('/read-all', (req, res) => {
  db.prepare('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE user_id=? AND read_at IS NULL').run(req.user.id);
  res.json({ ok: true });
});
router.post('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read_at=CURRENT_TIMESTAMP WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});
export default router;
