import { api, auth } from '../api.js';
import { ROLE_LABEL } from '../rbac.js';
import { avatar, emptyState, esc, formatDate, icon, loadingRows, qs, toast } from '../ui.js';

export const meta = { key: 'settings', title: 'Settings', subtitle: 'Your account and sign-in details' };

export async function render(root, context) {
  root.innerHTML = loadingRows(4);
  let me;
  try { me = (await api.me()).user; } catch (error) { root.innerHTML = emptyState('Could not load your account', error.message); return; }

  root.innerHTML = `
    <section class="card">
      <div class="row" style="gap:14px">
        ${avatar(me.name, null, 'avatar--lg')}
        <div>
          <h3>${esc(me.name)}</h3>
          <div class="muted small">${esc(ROLE_LABEL[me.role] || me.role)} · joined ${esc(formatDate(me.created_at))}</div>
        </div>
      </div>
    </section>

    <div class="grid grid--2">
      <section class="card">
        <div class="card__head"><h3>Sign-in details</h3></div>
        <form class="stack" data-profile>
          <div class="field">
            <label for="set-name">Full name</label>
            <input id="set-name" name="name" value="${esc(me.name)}" required />
          </div>
          <div class="field">
            <label for="set-phone">Phone number</label>
            <input id="set-phone" name="phone" type="tel" value="${esc(me.phone || '')}" placeholder="+91XXXXXXXXXX" required />
            <span class="field__hint">This is your login id. Changing it changes how you sign in.</span>
          </div>
          <div class="field">
            <label for="set-email">Email</label>
            <input id="set-email" name="email" type="email" value="${esc(me.email || '')}" placeholder="Optional" />
          </div>
          <p class="small" data-profile-error style="color:var(--red);display:none"></p>
          <button class="btn" type="submit">Save details</button>
        </form>
      </section>

      <section class="card">
        <div class="card__head"><h3>Change password</h3></div>
        <form class="stack" data-password>
          <div class="field">
            <label for="set-current">Current password</label>
            <input id="set-current" name="currentPassword" type="password" autocomplete="current-password" required />
          </div>
          <div class="field">
            <label for="set-new">New password</label>
            <input id="set-new" name="newPassword" type="password" autocomplete="new-password" minlength="8" required />
            <span class="field__hint">At least 8 characters. Use something you have not used here before.</span>
          </div>
          <div class="field">
            <label for="set-confirm">Confirm new password</label>
            <input id="set-confirm" name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required />
          </div>
          <p class="small" data-password-error style="color:var(--red);display:none"></p>
          <button class="btn" type="submit">Change password</button>
        </form>
      </section>
    </div>

    <section class="card">
      <div class="card__head"><h3>Locked out of an account?</h3></div>
      <p class="muted small">A super admin or HR manager can reset any password from <a href="#/users">Users</a>.
      If every administrator is locked out, run this once on the VPS:</p>
      <pre class="small" style="background:#f8fafc;border:1px solid var(--line);border-radius:12px;padding:12px;overflow:auto;margin-top:10px">cd /opt/hrmate/server
node tools/reset-credentials.js --list
node tools/reset-credentials.js --id 1 --password 'a-new-long-password'</pre>
    </section>`;

  const profileForm = qs('[data-profile]', root);
  const profileError = qs('[data-profile-error]', root);
  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = qs('button', profileForm);
    const values = Object.fromEntries(new FormData(profileForm).entries());
    profileError.style.display = 'none';
    button.disabled = true;
    try {
      const result = await api.updateMe({ name: values.name.trim(), phone: values.phone.trim(), email: values.email.trim() || null });
      auth.save(result.token, { id: result.user.id, name: result.user.name, role: result.user.role });
      context.updateIdentity(result.user);
      toast('Sign-in details updated', 'ok');
      context.reload();
    } catch (error) {
      profileError.textContent = error.message;
      profileError.style.display = 'block';
    } finally { button.disabled = false; }
  });

  const passwordForm = qs('[data-password]', root);
  const passwordError = qs('[data-password-error]', root);
  passwordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = qs('button', passwordForm);
    const values = Object.fromEntries(new FormData(passwordForm).entries());
    passwordError.style.display = 'none';
    if (values.newPassword !== values.confirmPassword) {
      passwordError.textContent = 'The new passwords do not match.';
      passwordError.style.display = 'block';
      return;
    }
    button.disabled = true;
    try {
      const result = await api.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      if (result.token) auth.save(result.token, auth.user);
      passwordForm.reset();
      toast('Password changed', 'ok');
      context.refreshBadges();
    } catch (error) {
      passwordError.textContent = error.message;
      passwordError.style.display = 'block';
    } finally { button.disabled = false; }
  });
}
