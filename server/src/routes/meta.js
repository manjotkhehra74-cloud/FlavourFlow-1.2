const express = require('express');
const REASONS = require('../constants/reasons');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/permissions', (req, res) => {
  res.json({
    required: [
      { key: 'location_fine', label: 'Location (fine)', reason: 'Geo-tag your attendance punch' },
      { key: 'location_coarse', label: 'Location (coarse)', reason: 'Fallback when GPS is weak' },
      { key: 'camera', label: 'Camera', reason: 'Capture selfie while marking attendance' },
      { key: 'biometrics', label: 'Biometrics', reason: 'Fingerprint/Face unlock to punch' },
      { key: 'notifications', label: 'Notifications', reason: 'Reminders if attendance is not marked' },
    ],
    optional: [
      { key: 'vibrate', label: 'Haptics', reason: 'Vibration feedback on punch' },
    ],
    notRequested: [
      { key: 'contacts', label: 'Contacts' },
      { key: 'storage', label: 'Storage / Photos' },
      { key: 'microphone', label: 'Microphone' },
    ],
  });
});

router.get('/late-reasons', (req, res) => res.json({ reasons: REASONS }));

// Health helper used by app to check exact server time
router.get('/time', auth, (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
});

module.exports = router;
