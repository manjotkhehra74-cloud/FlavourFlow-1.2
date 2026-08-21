import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { signToken, authRequired } from '../middleware/auth.js';
const router = Router();
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE phone = ? AND active = 1').get(phone);
  if (!user || !bcrypt.compareSync(password ?? '', user.password_hash)) return res.status(401).json({ error: 'Invalid phone or password' });
  res.json({ token: signToken(user), user: { id: user.id, name: user.name, role: user.role } });
});
router.get('/me', authRequired, (req, res) => res.json({ user: req.user }));
export default router;
