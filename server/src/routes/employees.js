const express = require('express');
const db = require('../db');
const { auth, sanitize } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  let rows = db.users.all();
  if (q) rows = rows.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.emp_code.toLowerCase().includes(q)
  );
  rows.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ users: rows.map(sanitize) });
});

router.get('/team', (req, res) => {
  const rows = db.users.filter(u => u.manager_id === req.user.id).sort((a, b) => a.name.localeCompare(b.name));
  res.json({ team: rows.map(sanitize) });
});

router.get('/events/today', (req, res) => {
  const now = new Date();
  const mmdd = now.toISOString().slice(5, 10);
  const month = now.toISOString().slice(5, 7);

  const all = db.users.all();
  const yearsOf = (hire) => now.getFullYear() - new Date(hire).getFullYear();

  const birthdays = all.filter(u => u.birthday && u.birthday.slice(0, 2) === month);
  const anniversaries = all.filter(u => u.hire_date && u.hire_date.slice(5, 7) === month);

  const today = [];
  [...birthdays, ...anniversaries].forEach((u) => {
    if (u.birthday === mmdd) today.push({ ...sanitize(u), event: 'birthday' });
    else if (u.hire_date && u.hire_date.slice(5, 10) === mmdd) today.push({ ...sanitize(u), event: 'work_anniversary', years: yearsOf(u.hire_date) });
  });

  res.json({
    today,
    birthdays: birthdays.map(sanitize),
    anniversaries: anniversaries.map(u => ({ ...sanitize(u), years: yearsOf(u.hire_date) }))
  });
});

router.get('/:id', (req, res) => {
  const u = db.users.find(u => u.id === Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ user: sanitize(u) });
});

module.exports = router;
