// Admin-only user management
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(auth, requireRole('admin'));

// List all users
router.get('/users', (req, res) => {
  const users = db.users.all().map(u => {
    const { password_hash, ...rest } = u;
    return rest;
  });
  res.json({ users });
});

// Create user
router.post('/users', async (req, res) => {
  const { name, email, password, role = 'employee', department, designation, phone, manager_id } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email and password required' });
  if (!['employee', 'manager', 'admin'].includes(role))
    return res.status(400).json({ error: 'invalid role' });
  if (db.users.find(u => u.email === email.toLowerCase()))
    return res.status(409).json({ error: 'email already exists' });

  const password_hash = await bcrypt.hash(password, 10);
  const codes = db.users.all().map(u => u.emp_code || '').filter(Boolean);
  const nextNum = codes.reduce((m, c) => {
    const n = parseInt(c.replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 1000) + 1;

  const row = {
    emp_code: 'UTL' + nextNum,
    name, email: email.toLowerCase(),
    role, department: department || null, designation: designation || null,
    phone: phone || null, manager_id: manager_id ? Number(manager_id) : null,
    password_hash,
    bday: null, hire_date: new Date().toISOString().slice(0, 10),
    avatar_color: ['#7C3AED', '#2563EB', '#DB2777', '#0891B2', '#F59E0B'][Math.floor(Math.random()*5)],
  };
  const r = db.users.insert(row);
  const saved = db.users.find(u => u.id === r.lastInsertRowid);
  const { password_hash: _, ...out } = saved;
  res.status(201).json({ user: out });
});

// Update user
router.patch('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'user not found' });
  const fields = ['name', 'role', 'department', 'designation', 'phone', 'manager_id', 'avatar_color'];
  const patch = {};
  for (const f of fields) if (req.body[f] !== undefined) patch[f] = req.body[f];
  if (req.body.email && req.body.email.toLowerCase() !== user.email) {
    if (db.users.find(u => u.email === req.body.email.toLowerCase() && u.id !== id))
      return res.status(409).json({ error: 'email already exists' });
    patch.email = req.body.email.toLowerCase();
  }
  if (req.body.password) patch.password_hash = await bcrypt.hash(req.body.password, 10);
  if (patch.role && !['employee', 'manager', 'admin'].includes(patch.role))
    return res.status(400).json({ error: 'invalid role' });
  if (patch.manager_id) patch.manager_id = Number(patch.manager_id);

  db.users.update(u => u.id === id, patch);
  const { password_hash: _, ...rest } = db.users.find(u => u.id === id);
  res.json({ user: rest });
});

// Delete user (with safety: can't delete self)
router.delete('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ error: 'apne aap ko delete nahi kar sakte' });
  const user = db.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'user not found' });

  db.attendance.remove(a => a.user_id === id);
  db.attendance_requests.remove(r => r.user_id === id || r.reviewed_by === id);
  db.leave_requests.remove(l => l.user_id === id);
  db.posts.remove(p => p.user_id === id);
  db.comments.remove(c => c.user_id === id);
  db.wishes.remove(w => w.sender_id === id || w.recipient_id === id);
  db.tickets.remove(t => t.user_id === id);
  db.team_actions.remove(t => t.user_id === id);
  db.users.update(u => u.manager_id === id, { manager_id: null });
  db.users.remove(u => u.id === id);
  res.json({ ok: true });
});

module.exports = router;
