// Pulse HR — Premium "Pulse Wave" design system
export const colors = {
  // Brand purple gradient (logo #7C3AED -> #4338CA)
  primary: '#6D28D9',
  primaryDark: '#4C1D95',
  primaryLight: '#8B5CF6',
  primarySoft: '#EDE9FE',
  accent: '#A78BFA',
  // Aliases so older screens that still reference brand/purple keep compiling
  brand: '#6D28D9',
  brandDark: '#4C1D95',
  purple: '#8B5CF6',

  // Deep navy (screens/drawer)
  navy: '#0F172A',
  navyLight: '#1E293B',
  navyCard: '#1E1B4B',

  // Neutrals
  bg: '#F5F6FB',
  card: '#FFFFFF',
  text: '#0F172A',
  textLight: '#334155',
  subtext: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',

  // Status
  green: '#16A34A',
  greenSoft: '#DCFCE7',
  red: '#EF4444',
  redSoft: '#FEE2E2',
  orange: '#F59E0B',
  orangeSoft: '#FEF3C7',
  blue: '#3B82F6',
  blueSoft: '#DBEAFE',
  pink: '#EC4899',
  teal: '#14B8A6',
};

export const gradients = {
  brand: ['#7C3AED', '#4F46E5'],
  brandDark: ['#4C1D95', '#312E81'],
  navy: ['#1E1B4B', '#0F172A'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#EF4444', '#DC2626'],
  info: ['#3B82F6', '#2563EB'],
};

export const statusColors = {
  present: '#16A34A',
  late: '#F59E0B',
  absent: '#EF4444',
  wfh: '#3B82F6',
  on_leave: '#8B5CF6',
  pending: '#F59E0B',
  approved: '#16A34A',
  rejected: '#EF4444',
  open: '#F59E0B',
  in_progress: '#3B82F6',
  resolved: '#16A34A',
  closed: '#64748B',
  active: '#16A34A',
  inactive: '#94A3B8',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtTime = (s) => s ? new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
export const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const avatarColorFor = (name = '') => {
  const palette = ['#7C3AED', '#2563EB', '#DB2777', '#0891B2', '#F59E0B', '#16A34A', '#9333EA', '#0EA5E9'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  if (h < 20) return 'Good Evening';
  return 'Good Night';
};
