import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db } from '../src/db/index.js';

/**
 * Account recovery from the VPS shell, for when a phone number or password is lost.
 *
 * List every account:
 *   node tools/reset-credentials.js --list
 *
 * Reset one account (identify it by id or by its current phone):
 *   node tools/reset-credentials.js --id 1 --password 'a-new-long-password'
 *   node tools/reset-credentials.js --phone '+91XXXXXXXXXX' --new-phone '+91YYYYYYYYYY' --password '...'
 *
 * Nothing here is logged to the audit trail because it runs outside a session; the
 * password is never printed back.
 */
const args = process.argv.slice(2);
const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};
const has = (name) => args.includes(`--${name}`);

const accounts = db.prepare('SELECT id, name, phone, email, role, active FROM users ORDER BY id').all();

if (has('list') || args.length === 0) {
  if (!accounts.length) {
    console.log('No accounts exist yet. Create the first one with: npm run bootstrap:admin');
    process.exit(0);
  }
  console.log('HRMate accounts:\n');
  accounts.forEach((user) => {
    console.log(`  id ${String(user.id).padEnd(3)} ${user.role.padEnd(12)} ${(user.phone || '—').padEnd(16)} ${user.active ? '' : '[disabled] '}${user.name}`);
  });
  console.log('\nReset one with: node tools/reset-credentials.js --id <id> --password \'new-password\'');
  process.exit(0);
}

const id = flag('id');
const phone = flag('phone');
const target = id
  ? accounts.find((user) => String(user.id) === String(id))
  : accounts.find((user) => user.phone === phone);

if (!target) {
  console.error(id ? `No account with id ${id}.` : `No account with phone ${phone}.`);
  console.error('Run with --list to see every account.');
  process.exit(1);
}

const newPhone = flag('new-phone');
const password = flag('password') ?? process.env.NEW_PASSWORD;
const role = flag('role');

if (!newPhone && !password && !role && !has('activate')) {
  console.error('Nothing to change. Pass --password, --new-phone, --role or --activate.');
  process.exit(1);
}
if (password && password.length < 8) {
  console.error('The new password must contain at least 8 characters.');
  process.exit(1);
}
if (role && !['super_admin', 'hr_manager', 'supervisor', 'employee'].includes(role)) {
  console.error('Role must be super_admin, hr_manager, supervisor or employee.');
  process.exit(1);
}
if (newPhone && accounts.some((user) => user.phone === newPhone && user.id !== target.id)) {
  console.error(`Phone ${newPhone} already belongs to another account.`);
  process.exit(1);
}

db.prepare(`UPDATE users SET
  phone = COALESCE(?, phone),
  password_hash = COALESCE(?, password_hash),
  role = COALESCE(?, role),
  active = CASE WHEN ? = 1 THEN 1 ELSE active END
  WHERE id = ?`)
  .run(newPhone ?? null, password ? bcrypt.hashSync(password, 12) : null, role ?? null, has('activate') ? 1 : 0, target.id);

const updated = db.prepare('SELECT id, name, phone, role, active FROM users WHERE id = ?').get(target.id);
console.log(`Updated account ${updated.id} (${updated.name}).`);
console.log(`  phone: ${updated.phone}`);
console.log(`  role:  ${updated.role}${updated.active ? '' : ' [disabled]'}`);
if (password) console.log('  password: changed — sign in and change it again from Settings.');
