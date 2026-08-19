export const colors = {
  brand: '#065f46',
  brandDark: '#064e3b',
  brandLight: '#10b981',
  teal: '#0d9488',
  bg: '#f5f7f7',
  card: '#ffffff',
  text: '#0f172a',
  subtext: '#64748b',
  border: '#e2e8f0',
  green: '#16a34a',
  red: '#dc2626',
  orange: '#f59e0b',
  purple: '#7c3aed',
  blue: '#2563eb',
  pink: '#db2777',
};

export const statusColors = {
  present: '#16a34a',
  late: '#f59e0b',
  absent: '#dc2626',
  wfh: '#2563eb',
  on_leave: '#7c3aed',
  pending: '#f59e0b',
  approved: '#16a34a',
  rejected: '#dc2626',
  open: '#f59e0b',
  in_progress: '#2563eb',
  resolved: '#16a34a',
  closed: '#64748b',
};

export const fmtINR = (n) => Number(n).toLocaleString('en-IN');
export const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtTime = (s) => s ? new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
export const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const avatarColorFor = (name = '') => {
  const palette = ['#0d9488', '#7c3aed', '#dc2626', '#2563eb', '#f59e0b', '#db2777', '#0891b2', '#059669'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};
