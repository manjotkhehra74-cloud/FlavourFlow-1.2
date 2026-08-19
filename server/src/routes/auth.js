const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { sign, auth } = require('../middleware/auth');

const router = express.Router();

function sanitize(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const row = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!row || !bcrypt.compareSync(password, row.password_hash))
    return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ token: sign(row), user: sanitize(row) });
});

router.get('/me', auth, (req, res) => res.json({ user: req.user }));

module.exports = router;
module.exports.sanitize = sanitize;
