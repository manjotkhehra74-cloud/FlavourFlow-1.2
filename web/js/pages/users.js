import { api } from '../api.js';
import { ROLE_LABEL, can } from '../rbac.js';
import { avatar, emptyState, esc, formatDate, icon, loadingRows, modal, qs, toast } from '../ui.js';

export const meta = { key: 'users', title: 'Users', subtitle: 'Login accounts and roles' };

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
  qs('[data-add]', root)?.addEventListener('click', () => userForm(load));
  await load();

  async function load() {
    body.innerHTML = loadingRows();
    try {
      const { users } = await api.users();
      body.innerHTML = users.length ? `<div class="table-wrap"><table>
        <thead><tr><th>User</th><th>Role</th><th>Phone</th><th>Email</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>${users.map((user) => `<tr>
          <td><div class="cell-user">${avatar(user.name, null)}<div><strong>${esc(user.name)}</strong><small>ID ${user.id}</small></div></div></td>
          <td><span class="pill ${user.role === 'super_admin' ? 'pill--violet' : 'pill--info'}">${esc(ROLE_LABEL[user.role] || user.role)}</span></td>
          <td>${esc(user.phone || '—')}</td>
          <td>${esc(user.email || '—')}</td>
          <td><span class="pill ${user.active ? 'pill--present' : 'pill--absent'}">${user.active ? 'Active' : 'Disabled'}</span></td>
          <td class="muted small">${esc(formatDate(user.created_at))}</td>
        </tr>`).join('')}</tbody></table></div>` : emptyState('No users yet');
    } catch (error) { body.innerHTML = emptyState('Could not load users', error.message); }
  }
}

async function userForm(onDone) {
  const result = await modal({
    title: 'Add login account',
    submitLabel: 'Create user',
    body: `<div class="form-grid">
      <div class="field"><label>Full name</label><input name="name" required /></div>
      <div class="field"><label>Phone</label><input name="phone" placeholder="+91XXXXXXXXXX" required /></div>
      <div class="field"><label>Email</label><input type="email" name="email" placeholder="Optional" /></div>
      <div class="field"><label>Role</label><select name="role">
        <option value="employee">Employee</option>
        <option value="supervisor">Supervisor</option>
        <option value="hr_manager">HR manager</option>
        <option value="super_admin">Super admin</option>
      </select></div>
    </div>
    <div class="field"><label>Temporary password</label><input name="password" minlength="8" required placeholder="At least 8 characters" />
      <span class="field__hint">Share it privately and ask the user to change it later.</span></div>`,
  });
  if (!result) return;
  try {
    await api.createUser({ ...result, email: result.email || null });
    toast('User created', 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
