import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = Router();
export const MIN_PASSWORD_LENGTH = 8;

router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE phone = ? AND active = 1').get(phone);
  if (!user || !bcrypt.compareSync(password ?? '', user.password_hash)) return res.status(401).json({ error: 'Invalid phone or password' });
  res.json({ token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });
});

router.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT id, name, phone, email, role, active, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'Account no longer exists' });
  res.json({ user });
});

/** Change your own contact details. The phone number is also the login id. */
router.patch('/me', authRequired, (req, res) => {
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!current) return res.status(401).json({ error: 'Account no longer exists' });
  const name = (req.body.name ?? current.name)?.trim();
  const phone = (req.body.phone ?? current.phone)?.trim() || null;
  const email = (req.body.email ?? current.email)?.trim() || null;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!phone) return res.status(400).json({ error: 'A phone number is required to sign in' });
  if (db.prepare('SELECT id FROM users WHERE phone = ? AND id <> ?').get(phone, current.id)) return res.status(409).json({ error: 'That phone number already belongs to another account' });
  if (email && db.prepare('SELECT id FROM users WHERE email = ? AND id <> ?').get(email, current.id)) return res.status(409).json({ error: 'That email already belongs to another account' });

  db.prepare('UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?').run(name, phone, email, current.id);
  db.prepare('INSERT INTO audit_log (actor_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(current.id, 'account.profile_updated', 'user', String(current.id), JSON.stringify({ name, phone, email }));

  const user = db.prepare('SELECT id, name, phone, email, role, active, created_at FROM users WHERE id = ?').get(current.id);
  // The signed token carries the display name, so hand back a refreshed one.
  res.json({ user, token: signToken(user) });
});

/** Change your own password after proving you know the current one. */
router.post('/change-password', authRequired, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: 'Account no longer exists' });
  if (!bcrypt.compareSync(currentPassword ?? '', user.password_hash)) return res.status(403).json({ error: 'The current password is incorrect' });
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `The new password must contain at least ${MIN_PASSWORD_LENGTH} characters` });
  if (bcrypt.compareSync(newPassword, user.password_hash)) return res.status(400).json({ error: 'Choose a password you have not used here before' });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 12), user.id);
  db.prepare('INSERT INTO audit_log (actor_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)')
    .run(user.id, 'account.password_changed', 'user', String(user.id), '{}');
  db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)')
    .run(user.id, 'Password changed', 'Your HRMate password was changed just now.', 'security');

  // Old tokens stay valid until they expire; issue a fresh one for this session.
  res.json({ ok: true, token: signToken(user) });
});

export default router;
