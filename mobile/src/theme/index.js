// Pulse HR — ERP Dark Premium Design System (from screenshots)
// Dark navy background, purple accent, teal/green/orange status
export const colors = {
  // Brand purple gradient (logo #7C3AED -> #4338CA)
  primary: '#7C3AED',
  primaryDark: '#4C1D95',
  primaryLight: '#8B5CF6',
  primarySoft: '#2D1B69', // dark soft for dark cards
  accent: '#A78BFA',
  brand: '#7C3AED',
  brandDark: '#4C1D95',
  purple: '#8B5CF6',

  // Dark navy (ERP dark theme - screenshots)
  navy: '#020617',
  navyLight: '#0F172A',
  navyCard: '#1E1B4B',
  darkBg: '#020617',
  darkCard: '#1E293B',
  darkCard2: '#0F172A',
  darkBorder: '#334155',

  // Neutrals - now default to dark (all screens dark as per new design)
  bg: '#020617',
  card: '#1E293B',
  card2: '#0F172A',
  text: '#F1F5F9',
  textLight: '#E2E8F0',
  subtext: '#94A3B8',
  subtext2: '#64748B',
  border: '#334155',
  borderLight: '#475569',
  white: '#FFFFFF',

  // Status - vibrant for dark
  green: '#10B981',
  greenSoft: '#064E3B',
  greenLight: '#34D399',
  red: '#EF4444',
  redSoft: '#7F1D1D',
  orange: '#F59E0B',
  orangeSoft: '#78350F',
  blue: '#3B82F6',
  blueSoft: '#1E3A8A',
  pink: '#EC4899',
  teal: '#14B8A6',
  tealSoft: '#134E4A',
  yellow: '#EAB308',
};

export const gradients = {
  brand: ['#7C3AED', '#4F46E5'],
  brandDark: ['#4C1D95', '#312E81'],
  brandLight: ['#8B5CF6', '#6366F1'],
  navy: ['#1E1B4B', '#020617'],
  darkHeader: ['#1E1B4B', '#0F172A'],
  purpleCard: ['#4C1D95', '#1E1B4B'],
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  danger: ['#EF4444', '#DC2626'],
  info: ['#3B82F6', '#2563EB'],
  teal: ['#14B8A6', '#0D9488'],
  pink: ['#EC4899', '#BE185D'],
};

export const statusColors = {
  present: '#10B981',
  late: '#F59E0B',
  absent: '#EF4444',
  wfh: '#3B82F6',
  on_leave: '#8B5CF6',
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
  open: '#F59E0B',
  in_progress: '#3B82F6',
  resolved: '#10B981',
  closed: '#64748B',
  active: '#10B981',
  inactive: '#94A3B8',
};

// ERP specific colors for screenshots
export const erp = {
  bg: '#020617',
  card: '#1E293B',
  cardHover: '#334155',
  header: '#1E1B4B',
  statGreen: '#10B981',
  statOrange: '#F59E0B',
  statBlue: '#3B82F6',
  statPurple: '#8B5CF6',
  statTeal: '#14B8A6',
  statPink: '#EC4899',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 999 };

export const fmtINR = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const fmtDate = (s) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtTime = (s) => s ? new Date(s).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
export const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const avatarColorFor = (name = '') => {
  const palette = ['#7C3AED', '#2563EB', '#DB2777', '#0891B2', '#F59E0B', '#10B981', '#9333EA', '#0EA5E9'];
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
