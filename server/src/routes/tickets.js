const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  let rows;
  if (req.user.role !== 'employee') {
    rows = db.tickets.all().map(t => {
      const u = db.users.find(x => x.id === t.user_id);
      return { ...t, user_name: u?.name };
    });
  } else {
    rows = db.tickets.filter(t => t.user_id === req.user.id);
  }
  rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  res.json({ tickets: rows });
});

router.post('/', (req, res) => {
  const { subject, category, description, priority } = req.body || {};
  if (!subject || !category || !description)
    return res.status(400).json({ error: 'subject, category, description required' });
  const r = db.tickets.insert({
    user_id: req.user.id, subject, category, description,
    priority: priority || 'medium', status: 'open'
  });
  res.json({ id: r.lastInsertRowid, ok: true });
});

router.post('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['open', 'in_progress', 'resolved', 'closed'].includes(status))
    return res.status(400).json({ error: 'invalid status' });
  db.tickets.update(t => t.id === Number(req.params.id), { status });
  res.json({ ok: true });
});

module.exports = router;
