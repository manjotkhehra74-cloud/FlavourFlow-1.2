import { api } from '../api.js';
import { ROLE_LABEL, can } from '../rbac.js';
import { avatar, emptyState, esc, formatDate, icon, loadingRows, modal, qs, toast } from '../ui.js';

export const meta = { key: 'users', title: 'Users', subtitle: 'Login accounts, roles and passwords' };

export async function render(root, context) {
  const canManage = can(context.user.role, 'users.manage');
  root.innerHTML = `<section class="card">
    <div class="card__head">
      <h3>Login accounts</h3>
      ${canManage ? `<button class="btn btn--sm spacer" data-add>${icon('plus', 15)} Add user</button>` : ''}
    </div>
    <div data-body>${loadingRows()}</div>
  </section>`;

  const body = qs('[data-body]', root);
  qs('[data-add]', root)?.addEventListener('click', () => userForm(null, load));
  await load();

  async function load() {
    body.innerHTML = loadingRows();
    try {
      const { users } = await api.users();
      body.innerHTML = users.length ? `<div class="table-wrap"><table>
        <thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Email</th><th>Status</th><th>Created</th>${canManage ? '<th></th>' : ''}</tr></thead>
        <tbody>${users.map((user) => `<tr>
          <td><div class="cell-user">${avatar(user.name, null)}<div><strong>${esc(user.name)}</strong><small>ID ${user.id}${user.id === context.user.id ? ' · you' : ''}</small></div></div></td>
          <td><span class="pill ${user.role === 'super_admin' ? 'pill--violet' : 'pill--info'}">${esc(ROLE_LABEL[user.role] || user.role)}</span></td>
          <td>${esc(user.phone || '—')}</td>
          <td>${esc(user.email || '—')}</td>
          <td><span class="pill ${user.active ? 'pill--present' : 'pill--absent'}">${user.active ? 'Active' : 'Disabled'}</span></td>
          <td class="muted small">${esc(formatDate(user.created_at))}</td>
          ${canManage ? `<td><div class="row" style="flex-wrap:nowrap;justify-content:flex-end">
            <button class="btn btn--sm btn--ghost" data-edit="${user.id}">Edit</button>
            <button class="btn btn--sm btn--ghost" data-reset="${user.id}">Reset password</button>
          </div></td>` : ''}
        </tr>`).join('')}</tbody></table></div>` : emptyState('No users yet');

      body.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', () => {
        userForm(users.find((user) => user.id === Number(button.dataset.edit)), load, context);
      }));
      body.querySelectorAll('[data-reset]').forEach((button) => button.addEventListener('click', () => {
        resetPassword(users.find((user) => user.id === Number(button.dataset.reset)), load);
      }));
    } catch (error) { body.innerHTML = emptyState('Could not load users', error.message); }
  }
}

async function userForm(user, onDone, context) {
  const editing = Boolean(user);
  const isSelf = editing && context && user.id === context.user.id;
  const roles = [['employee', 'Employee'], ['supervisor', 'Supervisor'], ['hr_manager', 'HR manager'], ['super_admin', 'Super admin']];
  const result = await modal({
    title: editing ? `Edit ${user.name}` : 'Add login account',
    submitLabel: editing ? 'Save changes' : 'Create user',
    body: `<div class="form-grid">
      <div class="field"><label>Full name</label><input name="name" value="${esc(user?.name ?? '')}" required /></div>
      <div class="field"><label>Phone</label><input name="phone" value="${esc(user?.phone ?? '')}" placeholder="+91XXXXXXXXXX" required />
        <span class="field__hint">Used to sign in</span></div>
      <div class="field"><label>Email</label><input type="email" name="email" value="${esc(user?.email ?? '')}" placeholder="Optional" /></div>
      <div class="field"><label>Role</label><select name="role" ${isSelf ? 'disabled' : ''}>
        ${roles.map(([value, label]) => `<option value="${value}" ${user?.role === value ? 'selected' : ''}>${label}</option>`).join('')}
      </select>${isSelf ? '<span class="field__hint">You cannot change your own role</span>' : ''}</div>
      ${editing ? `<div class="field"><label>Status</label><select name="active" ${isSelf ? 'disabled' : ''}>
        <option value="1" ${user.active ? 'selected' : ''}>Active</option>
        <option value="0" ${user.active ? '' : 'selected'}>Disabled</option>
      </select>${isSelf ? '<span class="field__hint">You cannot disable your own account</span>' : ''}</div>` : ''}
    </div>
    ${editing ? '' : `<div class="field"><label>Temporary password</label><input name="password" type="password" minlength="8" required placeholder="At least 8 characters" />
      <span class="field__hint">Share it privately and ask the user to change it from Settings.</span></div>`}`,
  });
  if (!result) return;
  try {
    if (editing) {
      const payload = { name: result.name, phone: result.phone, email: result.email || null };
      if (!isSelf) { payload.role = result.role; payload.active = result.active === '1'; }
      await api.updateUser(user.id, payload);
      toast('User updated', 'ok');
    } else {
      await api.createUser({ ...result, email: result.email || null });
      toast('User created', 'ok');
    }
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}

async function resetPassword(user, onDone) {
  const result = await modal({
    title: `Reset password for ${user.name}`,
    submitLabel: 'Set new password',
    body: `<p class="muted small">The user can sign in with this password straight away and change it later from Settings.</p>
      <div class="field"><label>New password</label><input name="newPassword" type="password" minlength="8" required placeholder="At least 8 characters" /></div>
      <div class="field"><label>Confirm password</label><input name="confirmPassword" type="password" minlength="8" required /></div>`,
  });
  if (!result) return;
  if (result.newPassword !== result.confirmPassword) { toast('The passwords do not match', 'err'); return; }
  try {
    await api.resetUserPassword(user.id, result.newPassword);
    toast(`Password reset for ${user.name}`, 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
