import { api, auth } from './api.js';
import { ROLE_LABEL, can } from './rbac.js';
import { avatar, el, esc, icon, initials, qs, toast } from './ui.js';
import { applyPrefs, watchSystemTheme } from './prefs.js';
import { loadLanguage, t } from './i18n.js';
import { renderLogin } from './pages/login.js';
import * as dashboard from './pages/dashboard.js';
import * as attendance from './pages/attendance.js';
import * as leave from './pages/leave.js';
import * as employees from './pages/employees.js';
import * as reports from './pages/reports.js';
import * as users from './pages/users.js';
import * as notifications from './pages/notifications.js';
import * as settings from './pages/settings.js';
import * as employeeProfile from './pages/employee-profile.js';
import { openSearch } from './search.js';
import { quickAction } from './quick.js';

const PAGES = { dashboard, attendance, leave, employees, reports, users, notifications, settings };
const NAV_ICON = { dashboard: 'dashboard', attendance: 'attendance', leave: 'leave', employees: 'employees', reports: 'reports', users: 'users' };
const PAGE_PERMISSION = {
  dashboard: 'dashboard.view', attendance: 'attendance.view', leave: 'leave.view',
  employees: 'employees.view', reports: 'reports.view', users: 'users.view',
  notifications: 'notifications.view', settings: 'dashboard.view',
};

const root = qs('#app');
const state = { user: null, nav: [], unread: 0, wired: false, badgeTimer: null };

applyPrefs();
loadLanguage();
watchSystemTheme();
start();

async function start() {
  if (!auth.token) return showLogin();
  try {
    const { user } = await api.me();
    state.user = user;
    await showShell();
  } catch {
    auth.clear();
    showLogin();
  }
}

window.addEventListener('hrmate:signed-out', () => { state.user = null; showLogin(); });

function showLogin() {
  window.location.hash = '';
  renderLogin(root, async (user) => { state.user = user; await showShell(); });
}

async function showShell() {
  try { state.nav = await api.navigation(); } catch { state.nav = []; }
  const visible = state.nav.filter((item) => can(state.user.role, item.permission));

  root.className = '';
  root.innerHTML = '';
  root.append(el(`<div class="shell">
    <aside class="sidebar">
      <div class="sidebar__brand">
        <img src="/assets/hrmate-mark.png" alt="" />
        <span><strong>${esc(t('HRMate'))}</strong><small>${esc(t('G.D. Foods Mfg (I)'))}</small></span>
      </div>
      <nav class="nav">
        ${visible.map((item) => `<a href="#/${item.key}" data-route="${item.key}">${icon(NAV_ICON[item.key] || "dashboard")} ${esc(t(item.label))}</a>`).join('')}
        <a href="#/notifications" data-route="notifications">${icon('bell')} ${esc(t('Notifications'))} <span class="nav__badge" data-nav-badge hidden>0</span></a>
        <a href="#/settings" data-route="settings">${icon('settings')} ${esc(t('Settings'))}</a>
      </nav>
      <div class="sidebar__foot">
        <a class="sidebar__user" href="#/settings" title="${esc(t('Account settings'))}">
          ${avatar(state.user.name, null)}
          <div><strong>${esc(state.user.name)}</strong><small>${esc(ROLE_LABEL[state.user.role] || state.user.role)}</small></div>
        </a>
        <button class="btn btn--ghost btn--block" data-logout>${icon('logout', 17)} ${esc(t('Sign out'))}</button>
      </div>
    </aside>
    <div class="backdrop" data-close-nav></div>
    <main class="main">
      <header class="appbar">
        <button class="icon-btn menu-btn" data-menu aria-label="${esc(t('Menu'))}">${icon('menu')}</button>
        <a class="appbar__brand" href="#/dashboard">
          <img src="/assets/hrmate-mark.png" alt="" />
          <span><b>HR</b>Mate</span>
        </a>
        <div class="topbar__actions">
          <button class="icon-btn" data-search title="${esc(t('Search'))}" aria-label="${esc(t('Search'))}">${icon('search')}</button>
          <a class="icon-btn" href="#/notifications" title="${esc(t('Notifications'))}">${icon('bell')}<span class="dot" data-bell-badge hidden>0</span></a>
          <button class="appbar__me" data-account aria-haspopup="menu" aria-expanded="false">
            ${avatar(state.user.name, null)}${icon('chevronDown', 16)}
          </button>
        </div>
      </header>
      <div class="content">
        <div class="page-head">
          <div class="page-head__text"><h1 data-title>${esc(t('Dashboard'))}</h1><small data-subtitle>${esc(t('Today at a glance'))}</small></div>
          <div class="page-head__actions" data-pageactions></div>
        </div>
        <div data-outlet></div>
      </div>
      <nav class="tabbar" data-tabbar></nav>
    </main>
  </div>`));

  const shell = qs('.shell', root);
  qs('[data-logout]', root).addEventListener('click', signOut);
  qs('[data-menu]', root).addEventListener('click', () => shell.classList.toggle('nav-open'));
  qs('[data-close-nav]', root).addEventListener('click', () => shell.classList.remove('nav-open'));
  qs('[data-search]', root).addEventListener('click', () => openSearch(state.user));
  wireAccountMenu(root);
  paintTabbar(visible);

  if (!state.wired) {
    window.addEventListener('hashchange', route);
    window.addEventListener('offline', paintConnection);
    window.addEventListener('online', () => { paintConnection(); refreshBadges(); route(); });
    state.wired = true;
  }
  paintConnection();
  clearInterval(state.badgeTimer);
  state.badgeTimer = setInterval(refreshBadges, 60000);
  await refreshBadges();
  await route();
}

/** A single sticky bar rather than a toast per failed request. */
function paintConnection() {
  const existing = qs('[data-offline]');
  if (navigator.onLine) {
    if (existing) { toast(t('Back online'), 'ok'); existing.remove(); }
    return;
  }
  if (existing) return;
  document.body.prepend(el(`<div class="offline-bar" data-offline role="status">
    ${icon('close', 15)} <strong>${esc(t('No internet connection'))}</strong>
    <span>${esc(t('You are offline. HRMate will reconnect on its own.'))}</span>
  </div>`));
}

function signOut() {
  auth.clear();
  clearInterval(state.badgeTimer);
  toast(t('Signed out'));
  showLogin();
}

/** Keeps the sidebar and topbar in step after the user edits their own profile. */
function updateIdentity(user) {
  state.user = { ...state.user, ...user };
  const name = state.user.name;
  const strong = qs('.sidebar__user strong');
  if (strong) strong.textContent = name;
  document.querySelectorAll('.sidebar__user .avatar, .topbar__actions .avatar').forEach((node) => {
    if (!node.querySelector('img')) node.textContent = initials(name);
  });
}

async function refreshBadges() {
  try {
    const data = await api.notifications();
    state.unread = data.unread ?? data.notifications.filter((item) => !item.read_at).length;
  } catch { return; }
  [qs('[data-nav-badge]'), qs('[data-bell-badge]')].forEach((node) => {
    if (!node) return;
    node.hidden = state.unread === 0;
    node.textContent = state.unread > 99 ? '99+' : state.unread;
  });
}

/** Avatar dropdown in the app bar: profile, notifications, sign out. */
function wireAccountMenu(scope) {
  const button = qs('[data-account]', scope);
  if (!button) return;
  const menu = el(`<div class="menu menu--account" hidden>
    <div class="menu__head">
      ${avatar(state.user.name, null)}
      <div><strong>${esc(state.user.name)}</strong><small>${esc(ROLE_LABEL[state.user.role] || state.user.role)}</small></div>
    </div>
    <a href="#/settings">${icon('users', 17)} ${esc(t('My profile'))}</a>
    <a href="#/notifications">${icon('bell', 17)} ${esc(t('Notifications'))}</a>
    <a href="#/settings">${icon('settings', 17)} ${esc(t('Settings'))}</a>
    <button type="button" class="menu__danger" data-menu-logout>${icon('signOut', 17)} ${esc(t('Sign out'))}</button>
  </div>`);
  button.parentElement.append(menu);

  const setOpen = (open) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', (event) => { event.stopPropagation(); setOpen(menu.hidden); });
  menu.addEventListener('click', (event) => {
    if (event.target.closest('[data-menu-logout]')) signOut();
    setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!menu.hidden && !menu.contains(event.target) && event.target !== button) setOpen(false);
  });
}

/**
 * Phone tab bar. Four permitted destinations around a centre action button; the last slot
 * opens the full navigation drawer so nothing becomes unreachable on a small screen.
 */
function paintTabbar(visible) {
  const bar = qs('[data-tabbar]', root);
  if (!bar) return;
  const order = ['dashboard', 'attendance', 'leave', 'employees', 'reports', 'users'];
  const byKey = new Map(visible.map((item) => [item.key, item]));
  const picked = order.filter((key) => byKey.has(key)).slice(0, 4);
  const label = (key) => t(byKey.get(key).label);
  const left = picked.slice(0, 2);
  const right = picked.slice(2, 4);

  const link = (key) => `<a href="#/${key}" data-route="${key}">${icon(NAV_ICON[key] || 'dashboard', 22)}<span>${esc(label(key))}</span></a>`;

  bar.innerHTML = `
    ${left.map(link).join('')}
    <button type="button" class="tabbar__fab" data-fab aria-label="${esc(t('Quick actions'))}">${icon('finger', 26)}</button>
    ${right.map(link).join('')}
    <button type="button" data-more>${icon('menu', 22)}<span>${esc(t('More'))}</span></button>`;

  qs('[data-fab]', bar).addEventListener('click', () => quickAction(state.user, route));
  qs('[data-more]', bar).addEventListener('click', () => qs('.shell')?.classList.add('nav-open'));
}

async function route() {
  const outlet = qs('[data-outlet]');
  if (!outlet) return;
  const raw = window.location.hash.replace(/^#\/?/, '');
  const key = raw.split('?')[0] || 'dashboard';
  const params = new URLSearchParams(raw.split('?')[1] || '');
  // Detail views live under their list route, e.g. #/employees?id=3
  const page = key === 'employees' && params.has('id') ? employeeProfile : PAGES[key];
  const allowed = page && can(state.user.role, PAGE_PERMISSION[key]);
  if (!allowed) { window.location.hash = '#/dashboard'; if (key !== 'dashboard') return; }

  const active = allowed ? page : PAGES.dashboard;
  qs('.shell')?.classList.remove('nav-open');
  document.querySelectorAll('[data-route]').forEach((link) => link.classList.toggle('active', link.dataset.route === active.meta.key));
  const actions = qs('[data-pageactions]');
  if (actions) actions.innerHTML = '';
  qs('[data-title]').textContent = t(active.meta.title);
  qs('[data-subtitle]').textContent = t(active.meta.subtitle);
  document.title = `${t(active.meta.title)} · HRMate`;
  window.scrollTo({ top: 0 });

  try {
    await active.render(outlet, {
      user: state.user, reload: route, refreshBadges, updateIdentity, signOut,
      /** Pages drop their primary buttons next to the big page title, as in the design. */
      pageActions: (html) => { if (actions) actions.innerHTML = html; return actions; },
    }, params);
  } catch (error) {
    outlet.innerHTML = `<section class="card"><p class="muted">${esc(error.message)}</p></section>`;
  }
}
