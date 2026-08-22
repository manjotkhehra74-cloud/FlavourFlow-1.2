import { api } from '../api.js';
import { ROLE_LABEL, can } from '../rbac.js';
import { avatar, emptyState, esc, formatDate, icon, loadingRows, modal, qs, toast } from '../ui.js';
import { t } from '../i18n.js';

export const meta = { key: 'users', title: 'User management', subtitle: 'Login accounts, roles and passwords' };

const ROLE_TILES = [
  { role: 'super_admin', label: 'Super admins', tone: 'blue', glyph: 'shield' },
  { role: 'hr_manager', label: 'HR managers', tone: 'green', glyph: 'users' },
  { role: 'supervisor', label: 'Supervisors', tone: 'green', glyph: 'employees' },
  { role: 'employee', label: 'Employees', tone: 'blue', glyph: 'users' },
];

export async function render(root, context) {
  const canManage = can(context.user.role, 'users.manage');
  const state = { search: '', role: 'All', users: [] };

  root.innerHTML = `
    <section class="card">
      <div class="card__head">
        <h3>${esc(t('User management'))}</h3>
        ${canManage ? `<button class="btn btn--sm btn--gradient spacer" data-add>${icon('plus', 15)} Add user</button>` : ''}
      </div>
      <div data-tiles class="tiles">${loadingRows(1)}</div>
      <div class="field" style="margin-top:16px"><input type="search" data-search placeholder="${esc(t('Search users by name, role or phone…'))}" /></div>
      <div class="chips" data-chips style="margin-top:12px"></div>
    </section>
    <div data-body>${loadingRows(4)}</div>`;

  const body = qs('[data-body]', root);
  qs('[data-search]', root).addEventListener('input', (event) => { state.search = event.target.value.toLowerCase(); paint(); });
  qs('[data-add]', root)?.addEventListener('click', () => userForm(null, load));
  await load();

  async function load() {
    body.innerHTML = loadingRows(4);
    try {
      state.users = (await api.users()).users;
      qs('[data-tiles]', root).innerHTML = ROLE_TILES.map((tile) => {
        const count = state.users.filter((user) => user.role === tile.role && user.active).length;
        return `<button class="tile ${state.role === tile.role ? 'is-active' : ''}" data-role="${tile.role}">
          <span class="tile__icon tone-${tile.tone}">${icon(tile.glyph)}</span>
          <small>${esc(t(tile.label))}</small>
          <strong style="color:${tile.tone === 'green' ? '#16a34a' : 'var(--blue)'}">${count}</strong>
        </button>`;
      }).join('');
      qs('[data-tiles]', root).querySelectorAll('[data-role]').forEach((tile) => tile.addEventListener('click', () => {
        state.role = state.role === tile.dataset.role ? 'All' : tile.dataset.role;
        load();
      }));

      const chips = qs('[data-chips]', root);
      chips.innerHTML = ['All', 'Active', 'Disabled'].map((name) => `<button class="chip ${state.status === name || (!state.status && name === 'All') ? 'is-active' : ''}" data-chip="${name}">${esc(t(name))}</button>`).join('');
      chips.querySelectorAll('[data-chip]').forEach((chip) => chip.addEventListener('click', () => {
        state.status = chip.dataset.chip;
        chips.querySelectorAll('[data-chip]').forEach((other) => other.classList.toggle('is-active', other.dataset.chip === state.status));
        paint();
      }));
      paint();
    } catch (error) { body.innerHTML = emptyState(t('Could not load users'), error.message); }
  }

  function paint() {
    const filtered = state.users.filter((user) => {
      const haystack = `${user.name} ${user.phone || ''} ${user.email || ''} ${ROLE_LABEL[user.role] || user.role}`.toLowerCase();
      const matchesRole = state.role === 'All' || user.role === state.role;
      const matchesStatus = !state.status || state.status === 'All'
        || (state.status === 'Active' ? user.active : !user.active);
      return haystack.includes(state.search) && matchesRole && matchesStatus;
    });

    if (!filtered.length) { body.innerHTML = `<section class="card">${emptyState(t('No users match'), t('Clear the filters or add a new account.'))}</section>`; return; }

    body.innerHTML = `<div class="stack">${filtered.map((user) => `
      <article class="list-card">
        <div class="list-card__top" style="align-items:center">
          ${avatar(user.name, null)}
          <div class="list-card__body">
            <strong>${esc(user.name)}${user.id === context.user.id ? ` <span class="muted small">· ${esc(t('you'))}</span>` : ''}</strong>
            <div class="row" style="gap:8px;margin-top:5px">
              <span class="pill ${user.role === 'super_admin' ? 'pill--violet' : 'pill--info'}">${icon(user.role === 'super_admin' ? 'shield' : user.role === 'supervisor' ? 'employees' : 'users', 12)} ${esc(ROLE_LABEL[user.role] || user.role)}</span>
              <span class="muted small">${esc(user.phone || t('No phone'))}</span>
            </div>
          </div>
          <div class="row" style="flex-wrap:nowrap;gap:8px">
            <span class="small" style="color:${user.active ? '#16a34a' : 'var(--red)'};font-weight:600;white-space:nowrap">
              <i style="width:8px;height:8px;border-radius:50%;background:${user.active ? '#16a34a' : 'var(--red)'};display:inline-block"></i>
              ${user.active ? t('Active') : t('Disabled')}
            </span>
            ${canManage ? `<button class="icon-btn" data-usermenu="${user.id}" title="${esc(t('Actions'))}" style="width:34px;height:34px">${icon('menu', 16)}</button>` : ''}
          </div>
        </div>
      </article>`).join('')}</div>`;

    body.querySelectorAll("[data-usermenu]").forEach((button) => button.addEventListener('click', () => {
      openActions(state.users.find((user) => user.id === Number(button.dataset.usermenu)));
    }));
  }

  async function openActions(user) {
    const isSelf = user.id === context.user.id;
    const result = await modal({
      title: user.name,
      submitLabel: t('Close'),
      body: `<p class="muted small" style="margin-top:-6px">${esc(ROLE_LABEL[user.role] || user.role)} · ${esc(user.phone || t('No phone'))}</p>
        <div class="stack" style="margin-top:6px">
          <button type="button" class="rowcard" data-action="edit" style="cursor:pointer;text-align:left;width:100%">
            <span class="rowcard__icon tone-blue">${icon('settings')}</span>
            <div class="rowcard__body"><strong>${esc(t('Edit account'))}</strong><small>${esc(t('Name, phone, email, role and status'))}</small></div>
          </button>
          <button type="button" class="rowcard" data-action="password" style="cursor:pointer;text-align:left;width:100%">
            <span class="rowcard__icon tone-amber">${icon('shield')}</span>
            <div class="rowcard__body"><strong>${esc(t('Reset password'))}</strong><small>${esc(t('Set a new password for a locked-out user'))}</small></div>
          </button>
          <button type="button" class="rowcard" data-action="toggle" style="cursor:pointer;text-align:left;width:100%" ${isSelf ? 'disabled' : ''}>
            <span class="rowcard__icon ${user.active ? 'tone-red' : 'tone-green'}">${icon(user.active ? 'circleClose' : 'circleCheck')}</span>
            <div class="rowcard__body"><strong>${user.active ? t('Disable account') : t('Enable account')}</strong><small>${isSelf ? t('You cannot disable your own account') : user.active ? t('They will no longer be able to sign in') : t('They will be able to sign in again')}</small></div>
          </button>
        </div>`,
      onMount: (form, close) => {
        form.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async () => {
          close();
          if (button.dataset.action === 'edit') return userForm(user, load, context);
          if (button.dataset.action === 'password') return resetPassword(user, load);
          try {
            await api.updateUser(user.id, { active: !user.active });
            toast(user.active ? t('Account disabled') : t('Account enabled'), 'ok');
            load();
          } catch (error) { toast(error.message, 'err'); }
        }));
      },
    });
    if (result) return;
  }
}

async function userForm(user, onDone, context) {
  const editing = Boolean(user);
  const isSelf = editing && context && user.id === context.user.id;
  const roles = [['employee', t('Employee')], ['supervisor', t('Supervisor')], ['hr_manager', t('HR manager')], ['super_admin', t('Super admin')]];
  const result = await modal({
    title: editing ? `Edit ${user.name}` : t('Add login account'),
    submitLabel: editing ? t('Save changes') : t('Create user'),
    tone: 'btn--gradient',
    body: `<div class="form-grid">
      <div class="field"><label>${esc(t('Full name'))}</label><input name="name" value="${esc(user?.name ?? '')}" required /></div>
      <div class="field"><label>${esc(t('Phone'))}</label><input name="phone" value="${esc(user?.phone ?? '')}" placeholder="+91XXXXXXXXXX" required />
        <span class="field__hint">${esc(t('Used to sign in'))}</span></div>
      <div class="field"><label>${esc(t('Email'))}</label><input type="email" name="email" value="${esc(user?.email ?? '')}" placeholder="${esc(t('Optional'))}" /></div>
      <div class="field"><label>${esc(t('Role'))}</label><select name="role" ${isSelf ? 'disabled' : ''}>
        ${roles.map(([value, label]) => `<option value="${value}" ${user?.role === value ? 'selected' : ''}>${label}</option>`).join('')}
      </select>${isSelf ? `<span class="field__hint">${esc(t('You cannot change your own role'))}</span>` : ''}</div>
      ${editing ? `<div class="field"><label>${esc(t('Status'))}</label><select name="active" ${isSelf ? 'disabled' : ''}>
        <option value="1" ${user.active ? 'selected' : ''}>${esc(t('Active'))}</option>
        <option value="0" ${user.active ? '' : 'selected'}>${esc(t('Disabled'))}</option>
      </select>${isSelf ? `<span class="field__hint">${esc(t('You cannot disable your own account'))}</span>` : ''}</div>` : ''}
    </div>
    ${editing ? '' : `<div class="field"><label>${esc(t('Temporary password'))}</label><input name="password" type="password" minlength="8" required placeholder="${esc(t('At least 8 characters'))}" />
      <span class="field__hint">${esc(t('Share it privately and ask the user to change it from Settings.'))}</span></div>`}`,
  });
  if (!result) return;
  try {
    if (editing) {
      const payload = { name: result.name, phone: result.phone, email: result.email || null };
      if (!isSelf) { payload.role = result.role; payload.active = result.active === '1'; }
      await api.updateUser(user.id, payload);
      toast(t('User updated'), 'ok');
    } else {
      await api.createUser({ ...result, email: result.email || null });
      toast(t('User created'), 'ok');
    }
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}

async function resetPassword(user, onDone) {
  const result = await modal({
    title: `Reset password for ${user.name}`,
    submitLabel: t('Set new password'),
    tone: 'btn--gradient',
    body: `<p class="muted small">The user can sign in with this password straight away and change it later from Settings.</p>
      <div class="field"><label>${esc(t('New password'))}</label><input name="newPassword" type="password" minlength="8" required placeholder="${esc(t('At least 8 characters'))}" /></div>
      <div class="field"><label>${esc(t('Confirm password'))}</label><input name="confirmPassword" type="password" minlength="8" required /></div>`,
  });
  if (!result) return;
  if (result.newPassword !== result.confirmPassword) { toast(t('The passwords do not match'), 'err'); return; }
  try {
    await api.resetUserPassword(user.id, result.newPassword);
    toast(`Password reset for ${user.name}`, 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
