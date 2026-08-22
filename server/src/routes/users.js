import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { authRequired, requirePerm } from '../middleware/auth.js';
import { ROLES } from '../rbac.js';
import { audit } from '../helpers.js';
import { MIN_PASSWORD_LENGTH } from './auth.js';

const router = Router(); router.use(authRequired);
const activeSuperAdmins = () => db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='super_admin' AND active=1").get().count;

router.get('/', requirePerm('users.view'), (req,res) => res.json({ users: db.prepare('SELECT id,name,phone,email,role,active,created_at FROM users ORDER BY id DESC').all() }));
router.post('/', requirePerm('users.manage'), audit({action:'user.created',entityType:'user',entityId:()=>null,title:'New user added',body:'A user account was created.'}, (req,res) => {
 const {name,phone,email,password,role='employee'}=req.body; if(!name||!phone||!password||!ROLES.includes(role)) return res.status(400).json({error:'Name, phone, password, and valid role are required'});
 if(password.length < MIN_PASSWORD_LENGTH) return res.status(400).json({error:`The password must contain at least ${MIN_PASSWORD_LENGTH} characters`});
 if(db.prepare('SELECT id FROM users WHERE phone=?').get(phone)) return res.status(409).json({error:'That phone number already belongs to another account'});
 const result=db.prepare('INSERT INTO users (name,phone,email,password_hash,role) VALUES (?,?,?,?,?)').run(name,phone,email??null,bcrypt.hashSync(password,12),role); res.status(201).json({id:result.lastInsertRowid});
}));

/** Update another account's details, role, or active state. */
router.patch('/:id', requirePerm('users.manage'), audit({
  action: 'user.updated', entityType: 'user', entityId: (req) => req.params.id,
  title: 'User account updated', body: 'A user account was updated.',
}, (req, res) => {
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'User not found' });

  const name = (req.body.name ?? current.name)?.trim();
  const phone = (req.body.phone ?? current.phone)?.trim() || null;
  const email = (req.body.email ?? current.email)?.trim() || null;
  const role = req.body.role ?? current.role;
  const active = req.body.active === undefined ? current.active : (req.body.active ? 1 : 0);

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!phone) return res.status(400).json({ error: 'A phone number is required to sign in' });
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Unknown role' });
  if (db.prepare('SELECT id FROM users WHERE phone = ? AND id <> ?').get(phone, current.id)) return res.status(409).json({ error: 'That phone number already belongs to another account' });
  if (email && db.prepare('SELECT id FROM users WHERE email = ? AND id <> ?').get(email, current.id)) return res.status(409).json({ error: 'That email already belongs to another account' });
  if (current.id === req.user.id && (active === 0 || role !== current.role)) return res.status(400).json({ error: 'You cannot change your own role or disable your own account' });
  // Never let the last way into HRMate disappear.
  if (current.role === 'super_admin' && (role !== 'super_admin' || active === 0) && activeSuperAdmins() <= 1) {
    return res.status(400).json({ error: 'HRMate must keep at least one active super admin' });
  }

  db.prepare('UPDATE users SET name=?, phone=?, email=?, role=?, active=? WHERE id=?').run(name, phone, email, role, active, current.id);
  res.json({ user: db.prepare('SELECT id,name,phone,email,role,active,created_at FROM users WHERE id=?').get(current.id) });
}));

/** Set a new password for someone who is locked out. */
router.post('/:id/reset-password', requirePerm('users.manage'), audit({
  action: 'user.password_reset', entityType: 'user', entityId: (req) => req.params.id,
  title: 'Password reset', body: 'A user password was reset by an administrator.',
}, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `The new password must contain at least ${MIN_PASSWORD_LENGTH} characters` });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 12), user.id);
  db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)')
    .run(user.id, 'Password reset', 'An administrator set a new password for your account.', 'security');
  res.json({ ok: true });
}));

export default router;
