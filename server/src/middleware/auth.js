const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    SECRET,
    { expiresIn: '30d' }
  );
}

function sanitize(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, SECRET);
    const user = db.users.find(u => u.id === payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = sanitize(user);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { auth, requireRole, sign, SECRET, sanitize };
