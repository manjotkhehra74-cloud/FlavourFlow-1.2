// Allowed reasons for late / regularization / on-duty attendance.
module.exports = [
  { id: 'traffic', label: 'Heavy traffic / commute delay' },
  { id: 'transport', label: 'Public transport issue' },
  { id: 'personal', label: 'Personal emergency' },
  { id: 'medical', label: 'Medical / doctor appointment' },
  { id: 'client', label: 'Client / field visit' },
  { id: 'biometric_failed', label: 'Biometric/device not working' },
  { id: 'network', label: 'Network / app issue' },
  { id: 'forgot', label: 'Forgot to punch in' },
  { id: 'approved_wfh', label: 'Manager-approved WFH' },
  { id: 'other', label: 'Other (explain in note)' },
];
