import { api, auth } from '../api.js';
import { el, esc, icon, qs, toast } from '../ui.js';
import { LANGUAGES, getPrefs, setPref } from '../prefs.js';
import { loadLanguage, t } from '../i18n.js';

const YEAR = new Date().getFullYear();

export function renderLogin(root, onSuccess) {
  root.className = '';
  root.innerHTML = '';
  const language = getPrefs().language;

  root.append(el(`<div class="login">
    <aside class="login__hero">
      <div class="login__brand">
        <img src="/assets/hrmate-logo.png" alt="" />
        <strong>${esc(t('HRMate'))}</strong>
      </div>
      <div class="login__pitch">
        <h1>${esc(t('Shop-floor HR, without the paperwork.'))}</h1>
        <p>${esc(t('Attendance, leave, and employee records for G.D. Foods Mfg (I) Pvt. Ltd. — Khadur Sahib, Tarn Taran.'))}</p>
        <ul class="login__points">
          <li><span>${icon('pin', 14)}</span> ${esc(t('GPS + selfie verified punches'))}</li>
          <li><span>${icon('leave', 14)}</span> ${esc(t('Casual, sick and earned leave workflows'))}</li>
          <li><span>${icon('reports', 14)}</span> ${esc(t('Monthly register with PDF and Excel export'))}</li>
          <li><span>${icon('users', 14)}</span> ${esc(t('Role-based access for every team'))}</li>
        </ul>
      </div>
      <p class="login__foot">© ${YEAR} ${esc(t('HRMate'))} · ${esc(t('Built for G.D. Foods'))}</p>
    </aside>

    <main class="login__panel">
      <form class="login__card stack" novalidate>
        <div class="login__mobile-brand">
          <img src="/assets/hrmate-logo.png" alt="" />
          <strong>${esc(t('HRMate'))}</strong>
        </div>

        <div class="login__lang chips">
          ${LANGUAGES.map((option) => `<button type="button" class="chip ${option.value === language ? 'is-active' : ''}" data-lang="${option.value}">${esc(option.label.split(' (')[0])}</button>`).join('')}
        </div>

        <div>
          <h2>${esc(t('Sign in'))}</h2>
          <p>${esc(t('Use the phone number registered with HRMate.'))}</p>
        </div>

        <div class="field">
          <label for="phone">${esc(t('Phone number'))}</label>
          <div class="field__wrap">
            <span class="field__lead">${icon('users', 17)}</span>
            <input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="username"
                   placeholder="+91XXXXXXXXXX" required />
          </div>
        </div>

        <div class="field">
          <label for="password">${esc(t('Password'))}</label>
          <div class="field__wrap">
            <span class="field__lead">${icon('shield', 17)}</span>
            <input id="password" name="password" type="password" autocomplete="current-password"
                   placeholder="••••••••" required />
            <button type="button" class="field__toggle" data-reveal
                    aria-label="${esc(t('Show password'))}" title="${esc(t('Show password'))}">${icon('sun', 17)}</button>
          </div>
        </div>

        <p class="login__error small" data-error hidden></p>

        <button class="btn btn--lg btn--block btn--gradient" type="submit">
          ${icon('signIn', 18)} <span data-label>${esc(t('Sign in'))}</span>
        </button>

        <p class="small muted" style="text-align:center">${esc(t('Trouble signing in? Ask your HR manager to reset the account.'))}</p>
      </form>
    </main>
  </div>`));

  const form = qs('.login__card', root);
  const error = qs('[data-error]', form);
  const button = qs('button[type=submit]', form);
  const label = qs('[data-label]', button);
  const password = qs('#password', form);

  // Switching language before signing in reloads with the new dictionary applied.
  form.querySelectorAll('[data-lang]').forEach((chip) => chip.addEventListener('click', () => {
    if (chip.dataset.lang === getPrefs().language) return;
    setPref('language', chip.dataset.lang);
    loadLanguage();
    renderLogin(root, onSuccess);
  }));

  qs('[data-reveal]', form).addEventListener('click', (event) => {
    const shown = password.type === 'text';
    password.type = shown ? 'password' : 'text';
    const next = shown ? t('Show password') : t('Hide password');
    event.currentTarget.setAttribute('aria-label', next);
    event.currentTarget.title = next;
    event.currentTarget.classList.toggle('is-on', !shown);
    password.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { phone, password: secret } = Object.fromEntries(new FormData(form).entries());
    error.hidden = true;
    button.disabled = true;
    label.textContent = t('Signing in…');
    try {
      const result = await api.login(String(phone).trim(), secret);
      auth.save(result.token, result.user);
      toast(t('Welcome back, {name}', { name: result.user.name.split(' ')[0] }), 'ok');
      onSuccess(result.user);
    } catch (caught) {
      error.textContent = caught.message;
      error.hidden = false;
      button.disabled = false;
      label.textContent = t('Sign in');
      password.select?.();
    }
  });
}
