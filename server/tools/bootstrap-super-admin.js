import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/index.js';

/**
 * Creates exactly the first owner account. It is intentionally idempotent:
 * after any account exists, it refuses to create another account.
 *
 * Usage (on the server; never commit these values):
 * ADMIN_NAME='Manjot Khehra' ADMIN_PHONE='+91...' ADMIN_PASSWORD='...' npm run bootstrap:admin
 */
const existing = db.prepare('SELECT id, name, role FROM users ORDER BY id LIMIT 1').get();
if (existing) {
  console.log(`Bootstrap skipped: first account already exists (id ${existing.id}, role ${existing.role}).`);
  process.exit(0);
}

const { ADMIN_NAME, ADMIN_PHONE, ADMIN_PASSWORD, ADMIN_EMAIL } = process.env;
if (!ADMIN_NAME || !ADMIN_PHONE || !ADMIN_PASSWORD) {
  console.error('ADMIN_NAME, ADMIN_PHONE, and ADMIN_PASSWORD must be set to create the first super admin.');
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD must contain at least 12 characters.');
  process.exit(1);
}

const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
const result = db.prepare(`
  INSERT INTO users (name, phone, email, password_hash, role, active)
  VALUES (?, ?, ?, ?, 'super_admin', 1)
`).run(ADMIN_NAME.trim(), ADMIN_PHONE.trim(), ADMIN_EMAIL?.trim() || null, passwordHash);

console.log(`Super admin created (user id ${result.lastInsertRowid}). All HRMate permissions are enabled.`);
