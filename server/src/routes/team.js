const express = require('express');
const db = require('../db');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const ACTIONS = ['resignation', 'transfer', 'on_duty', 'assign_shift', 'restriction'];

router.post('/actions', (req, res) => {
  const { user_id, action_type, payload } = req.body || {};
  if (!user_id || !ACTIONS.includes(action_type))
    return res.status(400).json({ error: 'user_id and valid action_type required' });
  const r = db.team_actions.insert({
    user_id: Number(user_id), action_type,
    payload: JSON.stringify(payload || {}),
    status: 'pending', requested_by: req.user.id
  });
  res.json({ id: r.lastInsertRowid, ok: true });
});

router.get('/actions/pending', (req, res) => {
  let rows;
  if (req.user.role === 'employee') {
    rows = db.team_actions.filter(a => a.requested_by === req.user.id);
  } else {
    const teamIds = new Set(db.users.filter(u => u.manager_id === req.user.id).map(u => u.id));
    rows = db.team_actions.filter(a => teamIds.has(a.user_id) || a.requested_by === req.user.id);
  }
  rows = rows.sort((a, b) => b.created_at.localeCompare(a.created_at)).map(a => {
    const u = db.users.find(x => x.id === a.user_id);
    return { ...a, user_name: u?.name, avatar_color: u?.avatar_color };
  });
  res.json({ actions: rows });
});

router.post('/actions/:id/review', (req, res) => {
  const { action } = req.body;
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'invalid action' });
  db.team_actions.update(a => a.id === Number(req.params.id), {
    status: action === 'approve' ? 'approved' : 'rejected'
  });
  res.json({ ok: true });
});

module.exports = router;
