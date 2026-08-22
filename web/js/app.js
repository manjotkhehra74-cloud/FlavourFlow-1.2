import { api, auth } from './api.js';
import { ROLE_LABEL, can } from './rbac.js';
import { avatar, el, esc, icon, qs, toast } from './ui.js';
import { renderLogin } from './pages/login.js';
import * as dashboard from './pages/dashboard.js';
import * as attendance from './pages/attendance.js';
import * as leave from './pages/leave.js';
import * as employees from './pages/employees.js';
import * as reports from './pages/reports.js';
import * as users from './pages/users.js';
import * as notifications from './pages/notifications.js';

const PAGES = { dashboard, attendance, leave, employees, reports, users, notifications };
const NAV_ICON = { dashboard: 'dashboard', attendance: 'attendance', leave: 'leave', employees: 'employees', reports: 'reports', users: 'users' };
const PAGE_PERMISSION = {
  dashboard: 'dashboard.view', attendance: 'attendance.view', leave: 'leave.view',
  employees: 'employees.view', reports: 'reports.view', users: 'users.view', notifications: 'notifications.view',
};

const root = qs('#app');
const state = { user: null, nav: [], unread: 0, wired: false, badgeTimer: null };

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
        <img src="/assets/hrmate-logo.png" alt="" />
        <span><strong>HRMate</strong><small>G.D. Foods Mfg (I)</small></span>
      </div>
      <nav class="nav">
        ${visible.map((item) => `<a href="#/${item.key}" data-route="${item.key}">${icon(NAV_ICON[item.key] || 'dashboard')} ${esc(item.label)}</a>`).join('')}
        <a href="#/notifications" data-route="notifications">${icon('bell')} Notifications <span class="nav__badge" data-nav-badge hidden>0</span></a>
      </nav>
      <div class="sidebar__foot">
        <div class="sidebar__user">
          ${avatar(state.user.name, null)}
          <div><strong>${esc(state.user.name)}</strong><small>${esc(ROLE_LABEL[state.user.role] || state.user.role)}</small></div>
        </div>
        <button class="btn btn--ghost btn--block" data-logout>${icon('logout', 17)} Sign out</button>
      </div>
    </aside>
    <div class="backdrop" data-close-nav></div>
    <main class="main">
      <header class="topbar">
        <button class="icon-btn menu-btn" data-menu>${icon('menu')}</button>
        <div><h1 data-title>Dashboard</h1><small data-subtitle>Today at a glance</small></div>
        <div class="topbar__actions">
          <a class="icon-btn" href="#/notifications" title="Notifications">${icon('bell')}<span class="dot" data-bell-badge hidden>0</span></a>
          ${avatar(state.user.name, null)}
        </div>
      </header>
      <div class="content" data-outlet></div>
    </main>
  </div>`));

  const shell = qs('.shell', root);
  qs('[data-logout]', root).addEventListener('click', () => { auth.clear(); clearInterval(state.badgeTimer); toast('Signed out'); showLogin(); });
  qs('[data-menu]', root).addEventListener('click', () => shell.classList.toggle('nav-open'));
  qs('[data-close-nav]', root).addEventListener('click', () => shell.classList.remove('nav-open'));

  if (!state.wired) { window.addEventListener('hashchange', route); state.wired = true; }
  clearInterval(state.badgeTimer);
  state.badgeTimer = setInterval(refreshBadges, 60000);
  await refreshBadges();
  await route();
}

async function refreshBadges() {
  try {
    const { notifications: items } = await api.notifications();
    state.unread = items.filter((item) => !item.read_at).length;
  } catch { return; }
  [qs('[data-nav-badge]'), qs('[data-bell-badge]')].forEach((node) => {
    if (!node) return;
    node.hidden = state.unread === 0;
    node.textContent = state.unread > 99 ? '99+' : state.unread;
  });
}

async function route() {
  const outlet = qs('[data-outlet]');
  if (!outlet) return;
  const key = (window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const page = PAGES[key];
  const allowed = page && can(state.user.role, PAGE_PERMISSION[key]);
  if (!allowed) { window.location.hash = '#/dashboard'; if (key !== 'dashboard') return; }

  const active = PAGES[allowed ? key : 'dashboard'];
  qs('.shell')?.classList.remove('nav-open');
  document.querySelectorAll('[data-route]').forEach((link) => link.classList.toggle('active', link.dataset.route === active.meta.key));
  qs('[data-title]').textContent = active.meta.title;
  qs('[data-subtitle]').textContent = active.meta.subtitle;
  document.title = `${active.meta.title} · HRMate`;
  window.scrollTo({ top: 0 });

  try {
    await active.render(outlet, { user: state.user, reload: route, refreshBadges });
  } catch (error) {
    outlet.innerHTML = `<section class="card"><p class="muted">${esc(error.message)}</p></section>`;
  }
}
