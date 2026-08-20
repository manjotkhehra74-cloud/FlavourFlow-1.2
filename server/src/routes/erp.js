const express = require('express');
const { auth } = require('../middleware/auth');
const router = express.Router();
router.use(auth);

// Mock data for all ERP modules - matches screenshots exactly
const mock = {
  shift: {
    todayShift: { name: 'General Shift - A', time: '09:00 AM - 06:00 PM', status: 'In Progress' },
    mySchedule: [{ date: '2025-05-14', shift: 'General Shift - A' }],
    teamRoster: [{ name: 'Team A', members: 12 }],
  },
  overtime: {
    thisMonth: '24h 30m',
    approved: '20h 00m',
    pending: '04h 30m',
    recent: [
      { date: '18 May 2025, Sun', hours: '3h 00m', status: 'Approved' },
      { date: '15 May 2025, Thu', hours: '2h 30m', status: 'Pending' },
    ],
  },
  recruitment: {
    totalJobs: 18,
    applicants: 245,
    hired: 16,
    pipeline: { applied: 245, screening: 142, interview: 62, offer: 24, hired: 16 },
    jobs: [
      { title: 'HR Executive', type: 'Human Resources • Full Time', applicants: 12 },
      { title: 'Payroll Specialist', type: 'Finance • Full Time', applicants: 18 },
    ],
  },
  payroll: {
    totalEmployees: 1248,
    gross: '₹5,84,32,100',
    net: '₹4,52,81,670',
    flow: ['Data Lock', 'Payroll Run', 'Review & Verify', 'Approvals', 'Payout'],
  },
  loans: {
    outstanding: '₹1,24,750',
    approved: '₹2,50,000',
    paid: '₹1,25,250',
    list: [
      { title: 'Personal Loan LN20250012', amt: '₹1,50,000', status: 'Active' },
      { title: 'Housing Loan LN20240008', amt: '₹8,00,000', status: 'Active' },
    ],
  },
  benefits: {
    total: 12,
    insurance: 6,
    coverage: '₹15.60 L',
    list: [
      { title: 'Health Insurance', val: '₹5.00 L' },
      { title: 'Term Life Insurance', val: '₹10.00 L' },
    ],
  },
  attendanceAdmin: {
    total: 842,
    present: 612,
    absent: 154,
    late: 52,
    earlyLeave: 24,
    devices: { total: 12, online: 10, offline: 2 },
  },
};

router.get('/shift', (req, res) => res.json(mock.shift));
router.get('/overtime', (req, res) => res.json(mock.overtime));
router.get('/recruitment', (req, res) => res.json(mock.recruitment));
router.get('/payroll', (req, res) => res.json(mock.payroll));
router.get('/loans', (req, res) => res.json(mock.loans));
router.get('/benefits', (req, res) => res.json(mock.benefits));
router.get('/attendance-admin', (req, res) => res.json(mock.attendanceAdmin));
router.get('/training', (req, res) => res.json({ assigned: 12, completed: 7, hours: 18, points: 720 }));
router.get('/performance', (req, res) => res.json({ rating: 4.6, score: 92, kras: 8 }));
router.get('/documents', (req, res) => res.json({ total: 126, verified: 98 }));
router.get('/assets', (req, res) => res.json({ total: 12, assigned: 10 }));
router.get('/expenses', (req, res) => res.json({ total: 86450, claims: 12 }));
router.get('/calendar', (req, res) => res.json({ events: 26, holidays: 4, birthdays: 6 }));
router.get('/reports', (req, res) => res.json({ employees: 842, attendance: 78.6 }));
router.get('/lifecycle', (req, res) => res.json({ transfers: 14, promotions: 8 }));
router.get('/onboarding', (req, res) => res.json({ newJoinees: 18, onboarding: 7 }));
router.get('/policies', (req, res) => res.json({ total: 128, mandatory: 96 }));
router.get('/directory', (req, res) => res.json({ employees: 412 }));
router.get('/notifications', (req, res) => res.json({ total: 126, unread: 12 }));

module.exports = router;
