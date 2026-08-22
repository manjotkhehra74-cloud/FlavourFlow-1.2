import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

/**
 * Account recovery from the VPS shell, for when a phone number or password is lost.
 *
 * On the VPS always go through the wrapper, which loads /etc/hrmate.env, pins Node 20
 * and runs as the service account:
 *
 *   sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --list
 *   sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --id 1 --password '...'
 *   sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --id 1 --new-phone '+91...'
 *   sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --id 1 --activate
 *
 * Nothing here is written to the audit trail because it runs outside a session, and the
 * password is never printed back.
 */

// Point at the live database explicitly: silently creating an empty one in the current
// directory would look like "all the accounts disappeared".
const databasePath = process.env.DATABASE_PATH;
if (!databasePath) {
  console.error('DATABASE_PATH is not set, so there is no database to read.');
  console.error('On the VPS run this through the wrapper, which loads /etc/hrmate.env:');
  console.error('  sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --list');
  process.exit(1);
}
if (!fs.existsSync(databasePath)) {
  console.error(`No database at ${path.resolve(databasePath)}.`);
  console.error('Check DATABASE_PATH in /etc/hrmate.env, or create the first account with: npm run bootstrap:admin');
  process.exit(1);
}

const { db } = await import('../src/db/index.js');

const args = process.argv.slice(2);

const flag = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};
const has = (name) => args.includes(`--${name}`);

const accounts = db.prepare('SELECT id, name, phone, email, role, active FROM users ORDER BY id').all();

if (has('list') || args.length === 0) {
  if (!accounts.length) {
    console.log(`No accounts exist in ${path.resolve(databasePath)}.`);
    console.log('Create the first one with: npm run bootstrap:admin');
    process.exit(0);
  }
  console.log('HRMate accounts:\n');
  accounts.forEach((user) => {
    console.log(`  id ${String(user.id).padEnd(3)} ${user.role.padEnd(12)} ${(user.phone || '—').padEnd(16)} ${user.active ? '' : '[disabled] '}${user.name}`);
  });
  console.log('\nReset one with:');
  console.log('  sudo /opt/hrmate/server/tools/hrmate-cli.sh tools/reset-credentials.js --id <id> --password \'new-password\'');
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
