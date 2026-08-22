import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, todayIst } from '../src/db/index.js';

/**
 * Fills a LOCAL database with believable demo data so the web console can be
 * reviewed without touching production. It refuses to run in production.
 *
 * Usage: DATABASE_PATH=./data/demo.sqlite node tools/seed-demo.js
 */
if (process.env.NODE_ENV === 'production' || process.env.ALLOW_DEMO_SEED === 'false') {
  console.error('Refusing to seed demo data in production.');
  process.exit(1);
}

const password = process.env.DEMO_PASSWORD || 'demo-password-123';
const accounts = [
  ['Manjot Khehra', '+919000000001', 'super_admin'],
  ['Simran Kaur', '+919000000002', 'hr_manager'],
  ['Gurpreet Singh', '+919000000003', 'supervisor'],
  ['Harjeet Singh', '+919000000004', 'employee'],
];
const insertUser = db.prepare('INSERT OR IGNORE INTO users (name, phone, password_hash, role) VALUES (?,?,?,?)');
accounts.forEach(([name, phone, role]) => insertUser.run(name, phone, bcrypt.hashSync(password, 8), role));
const userId = (phone) => db.prepare('SELECT id FROM users WHERE phone=?').get(phone)?.id ?? null;

const people = [
  ['GDF-001', 'Manjot Khehra', 'Plant Head', 'Management', 'General 9-6', '+919000000001'],
  ['GDF-002', 'Simran Kaur', 'HR Manager', 'HR', 'General 9-6', '+919000000002'],
  ['GDF-003', 'Gurpreet Singh', 'Line Supervisor', 'Production', 'Shift A 6-2', '+919000000003'],
  ['GDF-004', 'Harjeet Singh', 'Machine Operator', 'Production', 'Shift A 6-2', '+919000000004'],
  ['GDF-005', 'Rajwinder Kaur', 'Packing Operator', 'Packaging', 'Shift B 2-10', null],
  ['GDF-006', 'Baljinder Singh', 'Quality Analyst', 'Quality', 'General 9-6', null],
  ['GDF-007', 'Navjot Kaur', 'Store Keeper', 'Stores', 'General 9-6', null],
  ['GDF-008', 'Sukhwinder Singh', 'Boiler Operator', 'Maintenance', 'Shift C 10-6', null],
];
const insertEmployee = db.prepare(`INSERT OR IGNORE INTO employees
  (user_id, employee_code, name, role_title, department, shift_name, join_date, phone) VALUES (?,?,?,?,?,?,?,?)`);
people.forEach(([code, name, title, department, shift, phone], index) => {
  insertEmployee.run(phone ? userId(phone) : null, code, name, title, department, shift, `2024-0${(index % 9) + 1}-12`, phone);
});
db.prepare('INSERT OR IGNORE INTO leave_balances (employee_id) SELECT id FROM employees').run();

const employees = db.prepare('SELECT id FROM employees ORDER BY id').all();
const insertAttendance = db.prepare(`INSERT OR IGNORE INTO attendance
  (employee_id, attendance_date, status, punch_in_at, punch_out_at, entry_source) VALUES (?,?,?,?,?,?)`);
const base = new Date(`${todayIst()}T00:00:00Z`);
for (let back = 13; back >= 0; back -= 1) {
  const date = new Date(base.getTime() - back * 86400000).toISOString().slice(0, 10);
  if (new Date(`${date}T00:00:00Z`).getUTCDay() === 0) continue;
  employees.forEach((employee, index) => {
    const roll = (index * 7 + back * 3) % 10;
    const status = roll === 0 ? 'absent' : roll === 1 ? 'late' : roll === 2 ? 'half_day' : 'present';
    const punchIn = status === 'absent' ? null : `${date}T0${status === 'late' ? 4 : 3}:${roll < 5 ? '35' : '52'}:00.000Z`;
    const punchOut = status === 'absent' ? null : `${date}T12:${roll < 5 ? '10' : '40'}:00.000Z`;
    insertAttendance.run(employee.id, date, status, punchIn, punchOut, back % 5 === 0 ? 'manual' : 'mobile');
  });
}

const insertLeave = db.prepare('INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason, status) VALUES (?,?,?,?,?,?,?)');
if (!db.prepare('SELECT COUNT(*) AS count FROM leaves').get().count) {
  const day = (offset) => new Date(base.getTime() + offset * 86400000).toISOString().slice(0, 10);
  insertLeave.run(employees[3].id, 'casual', day(2), day(3), 2, 'Family function at home', 'pending');
  insertLeave.run(employees[4].id, 'sick', day(1), day(1), 1, 'Fever, will visit the doctor', 'pending');
  insertLeave.run(employees[5].id, 'earned', day(-9), day(-7), 3, 'Village trip', 'approved');
}

console.log(`Demo data ready. Login with ${accounts[0][1]} / ${password}`);
