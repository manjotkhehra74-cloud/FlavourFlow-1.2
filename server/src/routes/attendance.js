const express = require('express');
const db = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const REASONS = require('../constants/reasons');

const router = express.Router();
router.use(auth);

const today = () => new Date().toISOString().slice(0, 10);
const nowIso = () => new Date().toISOString();
const CUTOFF_HOUR = 10; // after 10 AM -> late

function isValidReason(id) {
  return REASONS.some(r => r.id === id);
}

// Clock in / out with geo coords, optional reason (late) and manual override time.
router.post('/clock', (req, res) => {
  const {
    action, latitude, longitude, source, note,
    reason_id, manual_clock_in,   // ISO timestamp override for late arrivals
    biometric_used, selfie_url,
  } = req.body || {};

  const date = today();
  const existing = db.attendance.find(a => a.user_id === req.user.id && a.date === date);
  const serverNow = nowIso();

  if (action === 'in') {
    if (existing && existing.clock_in)
      return res.status(400).json({ error: 'Already clocked in today' });

    // If user manually entered check-in time (late flow), use that; else server time.
    const clockIn = manual_clock_in ? new Date(manual_clock_in) : new Date(serverNow);
    if (isNaN(clockIn.getTime()))
      return res.status(400).json({ error: 'manual_clock_in is not a valid timestamp' });

    const status = clockIn.getHours() >= CUTOFF_HOUR ? 'late' : 'present';

    // Late arrivals MUST provide a reason.
    if (status === 'late' && !reason_id)
      return res.status(400).json({ error: 'Reason required for late check-in', code: 'REASON_REQUIRED' });
    if (reason_id && !isValidReason(reason_id))
      return res.status(400).json({ error: 'Invalid reason_id' });

    const row = {
      user_id: req.user.id, date,
      clock_in: clockIn.toISOString(),
      clock_out: null,
      status,
      source: source || 'selfie',
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      note: note || '',
      reason_id: reason_id || null,
      biometric_used: !!biometric_used,
      selfie_url: selfie_url || null,
      server_time: serverNow,
    };

    if (existing) db.attendance.update(a => a.id === existing.id, row);
    else db.attendance.insert(row);
    return res.json({ ok: true, status, clockedIn: row.clock_in, isLate: status === 'late' });
  }

  if (action === 'out') {
    if (!existing || !existing.clock_in)
      return res.status(400).json({ error: 'Not clocked in today' });
    db.attendance.update(a => a.id === existing.id, {
      clock_out: serverNow,
      server_time_out: serverNow,
    });
    return res.json({ ok: true, clockedOut: serverNow });
  }

  res.status(400).json({ error: 'action must be in|out' });
});

router.get('/today', (req, res) => {
  res.json({ today: db.attendance.find(a => a.user_id === req.user.id && a.date === today()) || null });
});

router.get('/history', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);
  const records = db.attendance
    .filter(a => a.user_id === req.user.id && a.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date));
  res.json({ month, records });
});

router.post('/requests', (req, res) => {
  const { date, type, reason, reason_id } = req.body || {};
  if (!date || !type || !reason)
    return res.status(400).json({ error: 'date, type, reason required' });
  if (reason_id && !isValidReason(reason_id))
    return res.status(400).json({ error: 'Invalid reason_id' });
  const r = db.attendance_requests.insert({
    user_id: req.user.id, date, type, reason,
    reason_id: reason_id || null,
    status: 'pending', reviewed_by: null, reviewed_at: null,
  });
  res.json({ id: r.lastInsertRowid, ok: true });
});

router.get('/requests/mine', (req, res) => {
  const requests = db.attendance_requests
    .filter(r => r.user_id === req.user.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(r => ({ ...r, user_name: req.user.name, emp_code: req.user.emp_code }));
  res.json({ requests });
});

router.get('/requests/pending', requireRole('manager', 'admin'), (req, res) => {
  const teamIds = new Set(db.users.filter(u => u.manager_id === req.user.id).map(u => u.id));
  // admin can see everyone
  const scope = req.user.role === 'admin' ? () => true : (r) => teamIds.has(r.user_id);
  const requests = db.attendance_requests
    .filter(r => r.status === 'pending' && scope(r))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(r => {
      const u = db.users.find(x => x.id === r.user_id);
      return { ...r, user_name: u?.name, emp_code: u?.emp_code, avatar_color: u?.avatar_color };
    });
  res.json({ requests });
});

router.post('/requests/bulk', requireRole('manager', 'admin'), (req, res) => {
  const { ids, action } = req.body || {};
  if (!Array.isArray(ids) || !ids.length || !['approve', 'reject'].includes(action))
    return res.status(400).json({ error: 'ids[] and action(approve|reject) required' });
  const status = action === 'approve' ? 'approved' : 'rejected';
  const idSet = new Set(ids.map(Number));
  db.attendance_requests.update(
    r => idSet.has(r.id),
    { status, reviewed_by: req.user.id, reviewed_at: nowIso() }
  );
  res.json({ ok: true, updated: ids.length, status });
});

module.exports = router;
