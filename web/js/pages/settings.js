import { api, auth } from '../api.js';
import { ROLE_LABEL } from '../rbac.js';
import {
  emptyState, esc, formatDate, icon, initials, loadingRows, modal, toast,
} from '../ui.js';
import {
  APPEARANCES, LANGUAGES, TEXT_SIZES, getPrefs, labelFor, setPref,
} from '../prefs.js';

export const meta = { key: 'settings', title: 'Settings', subtitle: 'Your account, language and appearance' };

const COMPANY = 'G.D. Foods Mfg (I) Pvt. Ltd.';

const row = ({ key, glyph, tone, title, subtitle, value, tag, danger }) => `
  <button type="button" class="rowcard rowcard--action ${danger ? 'rowcard--danger' : ''}" data-row="${esc(key)}" ${tag ? 'disabled' : ''}>
    <span class="rowcard__icon ${tone}">${icon(glyph, 18)}</span>
    <div class="rowcard__body">
      <strong>${esc(title)}</strong>
      ${subtitle ? `<small>${esc(subtitle)}</small>` : ''}
    </div>
    ${tag ? `<span class="pill pill--soon">${esc(tag)}</span>` : `<span class="rowcard__value">${value ? esc(value) : ''}${icon('arrowRight', 16)}</span>`}
  </button>`;

/** A radio-style chooser used for language, appearance and text size. */
async function choose(title, hint, options, current) {
  const result = await modal({
    title,
    submitLabel: 'Close',
    body: `${hint ? `<p class="muted small" style="margin-top:-6px">${esc(hint)}</p>` : ''}
      <div class="stack">${options.map((option) => `
        <button type="button" class="rowcard rowcard--action ${option.value === current ? 'is-active' : ''}" data-pick="${esc(option.value)}">
          <div class="rowcard__body"><strong>${esc(option.label)}</strong></div>
          ${option.value === current ? `<span class="t-green">${icon('circleCheck', 18)}</span>` : ''}
        </button>`).join('')}</div>`,
    onMount: (form, close) => {
      form.querySelectorAll('[data-pick]').forEach((button) => button.addEventListener('click', () => close({ picked: button.dataset.pick })));
    },
  });
  return result?.picked ?? null;
}

export async function render(root, context) {
  root.innerHTML = loadingRows(4);
  let me;
  try { me = (await api.me()).user; }
  catch (error) { root.innerHTML = `<section class="card">${emptyState('Could not load your account', error.message)}</section>`; return; }

  paint();

  function paint() {
    const prefs = getPrefs();
    root.innerHTML = `
      <section class="hero">
        <div class="row" style="gap:16px;flex-wrap:nowrap">
          <span class="avatar avatar--lg" style="width:70px;height:70px;background:#fff;color:var(--blue);border:3px solid rgba(255,255,255,.7)">${esc(initials(me.name).toUpperCase())}</span>
          <div style="min-width:0">
            <h2 style="font-size:24px;letter-spacing:-.03em">${esc(me.name)}</h2>
            <div class="small" style="opacity:.92;margin-top:4px">${esc(ROLE_LABEL[me.role] || me.role)} · ${esc(COMPANY)}</div>
            <div class="small" style="opacity:.8;margin-top:2px">${esc(me.phone || 'No phone')} · joined ${esc(formatDate(me.created_at))}</div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h3>Account</h3></div>
        <div class="stack">
          ${row({ key: 'profile', glyph: 'users', tone: 'tone-blue', title: 'My profile', subtitle: 'Name, phone number and email' })}
          ${row({ key: 'password', glyph: 'shield', tone: 'tone-amber', title: 'Change password', subtitle: 'Update your sign-in password' })}
          ${row({ key: 'biometric', glyph: 'finger', tone: 'tone-green', title: 'Biometric login', subtitle: 'Unlock with fingerprint or face', tag: 'Coming soon' })}
          ${row({ key: 'twofactor', glyph: 'shield', tone: 'tone-violet', title: 'Two-factor authentication', subtitle: 'An extra code every time you sign in', tag: 'Coming soon' })}
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h3>Display</h3></div>
        <div class="stack">
          ${row({ key: 'language', glyph: 'scale', tone: 'tone-blue', title: 'Language', subtitle: 'Used across the app', value: labelFor(LANGUAGES, prefs.language) })}
          ${row({ key: 'appearance', glyph: 'sun', tone: 'tone-amber', title: 'Appearance', subtitle: 'Light, dark or follow the device', value: labelFor(APPEARANCES, prefs.appearance) })}
          ${row({ key: 'textSize', glyph: 'reports', tone: 'tone-green', title: 'Text size', subtitle: 'Make everything easier to read', value: labelFor(TEXT_SIZES, prefs.textSize) })}
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h3>Locked out of an account?</h3></div>
        <p class="muted small">A super admin or HR manager can reset any password from <a href="#/users">Users</a>.
        If every administrator is locked out, run this once on the VPS:</p>
        <pre class="small" style="background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:12px;overflow:auto;margin-top:10px">cli=/opt/hrmate/server/tools/hrmate-cli.sh
sudo $cli tools/reset-credentials.js --list
sudo $cli tools/reset-credentials.js --id 1 --password 'a-new-long-password'</pre>
      </section>

      <section class="card">
        <div class="stack">
          ${row({ key: 'signout', glyph: 'logout', tone: 'tone-red', title: 'Sign out', subtitle: 'End this session on this device', danger: true })}
        </div>
        <p class="muted small" style="text-align:center;margin-top:14px">HRMate · ${esc(COMPANY)}</p>
      </section>`;

    root.querySelectorAll('[data-row]').forEach((button) => button.addEventListener('click', () => handle(button.dataset.row)));
  }

  async function handle(key) {
    if (key === 'profile') return editProfile();
    if (key === 'password') return changePassword();
    if (key === 'signout') return context.signOut();

    const choices = { language: LANGUAGES, appearance: APPEARANCES, textSize: TEXT_SIZES };
    const hints = {
      language: 'Punjabi is the default for the plant floor. Screen labels follow this setting as translations land.',
      appearance: 'Dark mode is easier on the eyes during night shifts.',
      textSize: 'Larger text is helpful on smaller phones.',
    };
    const titles = { language: 'Language', appearance: 'Appearance', textSize: 'Text size' };
    if (!choices[key]) return undefined;

    const picked = await choose(titles[key], hints[key], choices[key], getPrefs()[key]);
    if (!picked) return undefined;
    setPref(key, picked);
    toast(`${titles[key]} set to ${labelFor(choices[key], picked)}`, 'ok');
    return paint();
  }

  async function editProfile() {
    const result = await modal({
      title: 'My profile',
      submitLabel: 'Save details',
      tone: 'btn--gradient',
      body: `<div class="field"><label>Full name</label><input name="name" value="${esc(me.name)}" required /></div>
        <div class="field"><label>Phone number</label><input name="phone" type="tel" value="${esc(me.phone || '')}" placeholder="+91XXXXXXXXXX" required />
          <span class="field__hint">This is your login id. Changing it changes how you sign in.</span></div>
        <div class="field"><label>Email</label><input name="email" type="email" value="${esc(me.email || '')}" placeholder="Optional" /></div>`,
    });
    if (!result) return;
    try {
      const saved = await api.updateMe({ name: result.name.trim(), phone: result.phone.trim(), email: result.email.trim() || null });
      auth.save(saved.token, { id: saved.user.id, name: saved.user.name, role: saved.user.role });
      context.updateIdentity(saved.user);
      me = saved.user;
      toast('Sign-in details updated', 'ok');
      paint();
    } catch (error) { toast(error.message, 'err'); }
  }

  async function changePassword() {
    const result = await modal({
      title: 'Change password',
      submitLabel: 'Change password',
      tone: 'btn--gradient',
      body: `<div class="field"><label>Current password</label><input name="currentPassword" type="password" autocomplete="current-password" required /></div>
        <div class="field"><label>New password</label><input name="newPassword" type="password" autocomplete="new-password" minlength="8" required />
          <span class="field__hint">At least 8 characters. Use something you have not used here before.</span></div>
        <div class="field"><label>Confirm new password</label><input name="confirmPassword" type="password" autocomplete="new-password" minlength="8" required /></div>`,
    });
    if (!result) return;
    if (result.newPassword !== result.confirmPassword) { toast('The new passwords do not match', 'err'); return; }
    try {
      const saved = await api.changePassword({ currentPassword: result.currentPassword, newPassword: result.newPassword });
      if (saved.token) auth.save(saved.token, auth.user);
      toast('Password changed', 'ok');
    } catch (error) { toast(error.message, 'err'); }
  }
}
