import jwt from 'jsonwebtoken';
import { hasPermission } from '../rbac.js';
const secret = () => process.env.JWT_SECRET || 'development-only-change-me';
export function authRequired(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try { req.user = jwt.verify(token, secret()); return next(); }
  catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
export const requirePerm = (permission) => (req, res, next) =>
  hasPermission(req.user.role, permission) ? next() : res.status(403).json({ error: `Missing permission: ${permission}` });
export const signToken = (user) => jwt.sign({ id: user.id, name: user.name, role: user.role }, secret(), { expiresIn: '12h' });
