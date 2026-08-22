import { localeTag, t } from './i18n.js';

/** Small DOM + formatting helpers shared by every HRMate page. */

export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export const qs = (selector, scope = document) => scope.querySelector(selector);
export const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export function el(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

export const ICONS = {
  dashboard: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  attendance: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M9 15l2 2 4-4"/>',
  leave: '<path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6M12 12v6M9 15h6"/>',
  employees: '<circle cx="9" cy="8" r="3.4"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.4 3.4 0 0 1 0 6.6M17.5 20a6.4 6.4 0 0 0-2.2-4.8"/>',
  reports: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  users: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7"/><path d="M13.7 20a2 2 0 0 1-3.4 0"/>',
  finger: '<path d="M12 3a7 7 0 0 0-7 7v3M12 3a7 7 0 0 1 7 7v6M8.5 10a3.5 3.5 0 0 1 7 0v7M12 10v8M5 17c0 1.5.4 3 .9 4M19 19c-.4 1-.6 1.6-.6 2"/>',
  logout: '<path d="M15 17l5-5-5-5M20 12H9M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>',
  check: '<path d="M4 12.5 9.5 18 20 6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
  pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  inbox: '<path d="M3 13h5l2 3h4l2-3h5"/><path d="M5.5 5h13l2.5 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/>',
  arrowLeft: '<path d="M15 5l-7 7 7 7"/>',
  arrowRight: '<path d="M9 5l7 7-7 7"/>',
  trendUp: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
  trendDown: '<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
  signIn: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
  signOut: '<path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
  circleCheck: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/>',
  circleClose: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 6h6zM19 7l3 6h-6z"/>',
  sun: '<path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5 19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5 19 5"/><circle cx="12" cy="12" r="3.6"/>',
  umbrella: '<path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z"/><path d="M12 12v7a2.5 2.5 0 0 0 5 0"/>',
  heart: '<path d="M20.4 6.6a4.6 4.6 0 0 0-6.5 0L12 8.5l-1.9-1.9a4.6 4.6 0 1 0-6.5 6.5L12 21l8.4-7.9a4.6 4.6 0 0 0 0-6.5z"/>',
  save: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h7V3M8 21v-6h8v6"/>',
  shield: '<path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
  settings: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 14a2 2 0 1 1 0-4 1.6 1.6 0 0 0 1.6-2.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.6 1.5l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
};

export const icon = (name, size = 20) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;

export const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('');

export const avatar = (name, url, className = '') => (url
  ? `<span class="avatar ${className}"><img src="${esc(url)}" alt="${esc(name)}" /></span>`
  : `<span class="avatar ${className}">${esc(initials(name))}</span>`);

const STATUS_KEY = { present: 'Present', late: 'Late', half_day: 'Half day', absent: 'Absent', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
export const statusLabel = (status) => (STATUS_KEY[status] ? t(STATUS_KEY[status]) : (status || '—'));
export const statusPill = (status) => `<span class="pill pill--${esc(status)}">${esc(statusLabel(status))}</span>`;

export const todayIso = () => new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000).toISOString().slice(0, 10);
export const monthIso = (date = todayIso()) => date.slice(0, 7);

export function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '—';
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(localeTag(), options);
}

export function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString(localeTag(), { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

export function relativeTime(value) {
  if (!value) return '';
  const stamp = new Date(value.endsWith('Z') || value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  const seconds = Math.round((Date.now() - stamp.getTime()) / 1000);
  if (Number.isNaN(seconds)) return '';
  if (seconds < 60) return t('just now');
  if (seconds < 3600) return t('{n}m ago', { n: Math.floor(seconds / 60) });
  if (seconds < 86400) return t('{n}h ago', { n: Math.floor(seconds / 3600) });
  if (seconds < 604800) return t('{n}d ago', { n: Math.floor(seconds / 86400) });
  return formatDate(value);
}

/** Sunday-first week containing `date`, as ISO day strings. */
export function weekOf(date) {
  const anchor = new Date(`${date}T00:00:00Z`);
  const start = new Date(anchor.getTime() - anchor.getUTCDay() * 86400000);
  return Array.from({ length: 7 }, (unused, index) => new Date(start.getTime() + index * 86400000).toISOString().slice(0, 10));
}

export const shiftDays = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);

export const shiftMonth = (month, months) => {
  const [year, index] = month.split('-').map(Number);
  const moved = new Date(Date.UTC(year, index - 1 + months, 1));
  return moved.toISOString().slice(0, 7);
};

export function greeting() {
  const hour = Number(new Date().toLocaleString('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }));
  if (hour < 12) return t('Sat Sri Akal');
  if (hour < 17) return t('Good afternoon');
  return t('Good evening');
}

export const titleCase = (value) => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** titleCase, then translated — used for leave types and roles coming off the API. */
export const titleCaseT = (value) => t(titleCase(value));

export function toast(message, kind = '') {
  const node = el(`<div class="toast ${kind ? `toast--${kind}` : ''}">${esc(message)}</div>`);
  qs('#toasts').append(node);
  setTimeout(() => { node.style.opacity = '0'; node.style.transition = 'opacity .25s'; setTimeout(() => node.remove(), 250); }, 3200);
}

/**
 * Renders a modal and resolves with the submitted FormData (or null when dismissed).
 * `onMount(form, close)` receives the form element and a `close(value)` callback so that
 * action sheets can resolve with something other than form data.
 */
export function modal({ title, body, submitLabel = t('Save'), tone = '', onMount }) {
  return new Promise((resolve) => {
    const backdrop = el(`<div class="modal-backdrop"><form class="modal">
      <div class="modal__head"><h3>${esc(title)}</h3><button type="button" class="icon-btn spacer" data-close style="margin-left:auto">${icon('close', 18)}</button></div>
      <div class="modal__body stack">${body}</div>
      <div class="modal__foot">
        <button type="button" class="btn btn--ghost" data-close>${esc(t('Cancel'))}</button>
        <button type="submit" class="btn ${tone}">${esc(submitLabel)}</button>
      </div>
    </form></div>`);
    const finish = (value) => { backdrop.remove(); document.removeEventListener('keydown', onKey); resolve(value); };
    const onKey = (event) => { if (event.key === 'Escape') finish(null); };
    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop || event.target.closest('[data-close]')) finish(null);
    });
    backdrop.querySelector('form').addEventListener('submit', (event) => {
      event.preventDefault();
      finish(Object.fromEntries(new FormData(event.currentTarget).entries()));
    });
    document.addEventListener('keydown', onKey);
    qs('#modal-root').append(backdrop);
    onMount?.(backdrop.querySelector('form'), finish);
    backdrop.querySelector('input, select, textarea')?.focus();
  });
}

export const emptyState = (message, hint = '') =>
  `<div class="empty">${icon('inbox', 34)}<strong>${esc(message)}</strong>${hint ? `<span class="small">${esc(hint)}</span>` : ''}</div>`;

export const loadingRows = (count = 4) =>
  `<div class="stack">${Array.from({ length: count }, () => '<div class="skeleton"></div>').join('')}</div>`;

/** Best-effort browser geolocation; resolves to null instead of rejecting. */
export const currentPosition = () => new Promise((resolve) => {
  if (!navigator.geolocation) return resolve(null);
  const timer = setTimeout(() => resolve(null), 8000);
  navigator.geolocation.getCurrentPosition(
    (position) => { clearTimeout(timer); resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }); },
    () => { clearTimeout(timer); resolve(null); },
    { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 },
  );
});
