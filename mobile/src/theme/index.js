// Pulse HR — final "Pulse Wave" brand palette
export const colors = {
  // primary purple gradient (logo #7C3AED -> #4338CA)
  brand: '#6D28D9',        // deep violet (buttons, headers)
  brandDark: '#4C1D95',    // darker
  brandLight: '#8B5CF6',   // lighter
  brandSoft: '#EDE9FE',    // tinted background
  accent: '#A78BFA',       // highlight
  teal: '#0EA5E9',
  bg: '#F7F7FB',
  card: '#FFFFFF',
  text: '#0F172A',
  subtext: '#64748B',
  border: '#E2E8F0',
  green: '#16A34A',
  red: '#DC2626',
  orange: '#F59E0B',
  purple: '#7C3AED',
  blue: '#2563EB',
  pink: '#DB2777',
};

export const statusColors = {
  present: '#16A34A',
  late: '#F59E0B',
  absent: '#DC2626',
  wfh: '#2563EB',
  on_leave: '#7C3AED',
  pending: '#F59E0B',
  approved: '#16A34A',
  rejected: '#DC2626',
  open: '#F59E0B',
  in_progress: '#2563EB',
  resolved: '#16A34A',
  closed: '#64748B',
};

export const fmtINR = (n) => Number(n).toLocaleString('en-IN');
export const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtTime = (s) => s ? new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
export const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const avatarColorFor = (name = '') => {
  const palette = ['#7C3AED', '#2563EB', '#DB2777', '#0891B2', '#F59E0B', '#16A34A', '#9333EA', '#0EA5E9'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};
