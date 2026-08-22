import { api } from './api.js';
import { ROLE_LABEL, can } from './rbac.js';
import { avatar, el, esc, icon, qs } from './ui.js';
import { t } from './i18n.js';

/**
 * The magnifier in the app bar. Searches the pages the user may open plus the employee
 * directory and login accounts, so one field reaches everything the console holds.
 * Lists are fetched once per open and cached for the lifetime of the overlay.
 */

const PAGES = [
  { key: 'dashboard', label: 'Dashboard', hint: 'Today at a glance', perm: 'dashboard.view', glyph: 'dashboard' },
  { key: 'attendance', label: 'Attendance', hint: 'Punches and register', perm: 'attendance.view', glyph: 'attendance' },
  { key: 'leave', label: 'Leave', hint: 'Balances and approvals', perm: 'leave.view', glyph: 'leave' },
  { key: 'employees', label: 'Employees', hint: 'Team directory', perm: 'employees.view', glyph: 'employees' },
  { key: 'reports', label: 'Reports', hint: 'Insights and exports', perm: 'reports.view', glyph: 'reports' },
  { key: 'users', label: 'User management', hint: 'Accounts and roles', perm: 'users.view', glyph: 'users' },
  { key: 'notifications', label: 'Notifications', hint: 'Announcements', perm: 'notifications.view', glyph: 'bell' },
  { key: 'settings', label: 'Settings', hint: 'Profile and preferences', perm: 'dashboard.view', glyph: 'settings' },
];

let open = false;

export function openSearch(user) {
  if (open) return;
  open = true;

  const cache = { employees: null, users: null };
  const overlay = el(`<div class="searchbox" role="dialog" aria-modal="true" aria-label="${esc(t('Search'))}">
    <div class="searchbox__panel">
      <div class="searchbox__field">
        ${icon('search', 19)}
        <input type="search" data-input placeholder="${esc(t('Search people, accounts or a page…'))}" autocomplete="off" />
        <button type="button" class="icon-btn" data-close title="${esc(t('Close'))}">${icon('close', 18)}</button>
      </div>
      <div class="searchbox__results" data-results></div>
    </div>
  </div>`);

  const input = qs('[data-input]', overlay);
  const results = qs('[data-results]', overlay);

  const close = () => {
    open = false;
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (event) => { if (event.key === 'Escape') close(); };

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('[data-close]')) close();
  });
  overlay.addEventListener('click', (event) => {
    const link = event.target.closest('[data-goto]');
    if (!link) return;
    window.location.hash = link.dataset.goto;
    close();
  });
  document.addEventListener('keydown', onKey);

  let timer = null;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(paint, 140); });

  document.body.append(overlay);
  input.focus();
  paint();

  async function fetchLists() {
    if (cache.employees === null && can(user.role, 'employees.view')) {
      try { cache.employees = (await api.employees()).employees; } catch { cache.employees = []; }
    }
    if (cache.users === null && can(user.role, 'users.view')) {
      try { cache.users = (await api.users()).users; } catch { cache.users = []; }
    }
  }

  async function paint() {
    const term = input.value.trim().toLowerCase();
    const pages = PAGES.filter((page) => can(user.role, page.perm))
      .filter((page) => !term || `${t(page.label)} ${page.label} ${t(page.hint)}`.toLowerCase().includes(term));

    if (!term) {
      results.innerHTML = section(t('Jump to'), pages.map(pageRow).join(''));
      return;
    }

    results.innerHTML = `<div class="searchbox__hint">${esc(t('Searching…'))}</div>`;
    await fetchLists();

    const people = (cache.employees || []).filter((person) => (
      `${person.name} ${person.employee_code || ''} ${person.department || ''} ${person.role_title || ''} ${person.phone || ''}`
        .toLowerCase().includes(term)
    )).slice(0, 8);

    const accounts = (cache.users || []).filter((account) => (
      `${account.name} ${account.phone || ''} ${account.email || ''} ${ROLE_LABEL[account.role] || account.role}`
        .toLowerCase().includes(term)
    )).slice(0, 6);

    const blocks = [
      people.length ? section(t('Employees'), people.map(personRow).join('')) : '',
      accounts.length ? section(t('Accounts'), accounts.map(accountRow).join('')) : '',
      pages.length ? section(t('Pages'), pages.map(pageRow).join('')) : '',
    ].filter(Boolean).join('');

    results.innerHTML = blocks || `<div class="searchbox__hint">${esc(t('No matches for “{term}”', { term: input.value.trim() }))}</div>`;
  }
}

const section = (title, rows) => `<div class="searchbox__group">
  <p class="searchbox__title">${esc(title)}</p>${rows}</div>`;

const pageRow = (page) => `<button type="button" class="searchbox__row" data-goto="#/${page.key}">
  <span class="rowcard__icon tone-blue">${icon(page.glyph, 17)}</span>
  <span class="searchbox__text"><strong>${esc(t(page.label))}</strong><small>${esc(t(page.hint))}</small></span>
  ${icon('arrowRight', 16)}
</button>`;

const personRow = (person) => `<button type="button" class="searchbox__row" data-goto="#/employees?id=${person.id}">
  ${avatar(person.name, person.photo_url)}
  <span class="searchbox__text"><strong>${esc(person.name)}</strong><small>${esc([person.employee_code, person.department].filter(Boolean).join(' · ') || t('Unassigned'))}</small></span>
  ${icon('arrowRight', 16)}
</button>`;

const accountRow = (account) => `<button type="button" class="searchbox__row" data-goto="#/users">
  ${avatar(account.name, null)}
  <span class="searchbox__text"><strong>${esc(account.name)}</strong><small>${esc([ROLE_LABEL[account.role] || account.role, account.phone].filter(Boolean).join(' · '))}</small></span>
  ${icon('arrowRight', 16)}
</button>`;
