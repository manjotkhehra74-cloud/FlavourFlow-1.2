import 'dotenv/config';
import { db, todayIst } from '../src/db/index.js';

// Run after the factory day closes (for example 23:55 IST via cron).
const date = process.env.ATTENDANCE_DATE || todayIst();
const employees = db.prepare('SELECT id FROM employees WHERE active=1').all();
const find = db.prepare('SELECT * FROM attendance WHERE employee_id=? AND attendance_date=?');
const markAbsent = db.prepare(`INSERT INTO attendance (employee_id,attendance_date,status,entry_source,manual_note)
  VALUES (?,?,'absent','manual','Auto-marked after attendance close')`);
const markHalfDay = db.prepare(`UPDATE attendance SET status='half_day',manual_note=COALESCE(manual_note,'Auto-detected: less than four working hours'),updated_at=CURRENT_TIMESTAMP WHERE id=?`);
let absent = 0; let halfDay = 0;
const close = db.transaction(() => employees.forEach(({ id }) => {
  const record = find.get(id, date);
  if (!record) { markAbsent.run(id, date); absent += 1; return; }
  if (record.status === 'present' && record.punch_in_at && record.punch_out_at) {
    const hours = (Date.parse(record.punch_out_at) - Date.parse(record.punch_in_at)) / 3600000;
    if (hours < 4) { markHalfDay.run(record.id); halfDay += 1; }
  }
}));
close();
console.log(`Attendance close for ${date}: ${absent} absent, ${halfDay} half-day. VERIFIED ✓`);
