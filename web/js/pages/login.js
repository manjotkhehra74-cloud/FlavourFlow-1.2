import { api, auth } from '../api.js';
import { el, qs, icon, toast } from '../ui.js';

export function renderLogin(root, onSuccess) {
  root.className = '';
  root.innerHTML = '';
  root.append(el(`<div class="login">
    <aside class="login__hero">
      <div class="login__brand">
        <img src="/assets/hrmate-logo.png" alt="" />
        <strong>HRMate</strong>
      </div>
      <div class="login__pitch">
        <h1>Shop-floor HR, without the paperwork.</h1>
        <p>Attendance, leave, and employee records for G.D. Foods Mfg (I) Pvt. Ltd. — Khadur Sahib, Tarn Taran.</p>
        <ul class="login__points">
          <li><span>${icon('pin', 14)}</span> GPS + selfie verified punches</li>
          <li><span>${icon('leave', 14)}</span> Casual, sick and earned leave workflows</li>
          <li><span>${icon('reports', 14)}</span> Monthly register with CSV export</li>
          <li><span>${icon('users', 14)}</span> Role-based access for every team</li>
        </ul>
      </div>
      <p class="login__foot">© ${new Date().getFullYear()} HRMate · Built for G.D. Foods</p>
    </aside>
    <main class="login__panel">
      <form class="login__card stack" novalidate>
        <div class="login__mobile-brand"><img src="/assets/hrmate-logo.png" alt="" /><strong>HRMate</strong></div>
        <div>
          <h2>Sign in</h2>
          <p>Use the phone number registered with HRMate.</p>
        </div>
        <div class="field">
          <label for="phone">Phone number</label>
          <input id="phone" name="phone" type="tel" autocomplete="username" placeholder="+91XXXXXXXXXX" required />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" autocomplete="current-password" placeholder="••••••••" required />
        </div>
        <p class="small" data-error style="color:var(--red);display:none"></p>
        <button class="btn btn--lg btn--block" type="submit">Sign in</button>
        <p class="small muted">Trouble signing in? Ask your HR manager to reset the account.</p>
      </form>
    </main>
  </div>`));

  const form = qs('.login__card', root);
  const error = qs('[data-error]', form);
  const button = qs('button[type=submit]', form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { phone, password } = Object.fromEntries(new FormData(form).entries());
    error.style.display = 'none';
    button.disabled = true;
    button.textContent = 'Signing in…';
    try {
      const result = await api.login(String(phone).trim(), password);
      auth.save(result.token, result.user);
      toast(`Welcome back, ${result.user.name.split(' ')[0]}`, 'ok');
      onSuccess(result.user);
    } catch (caught) {
      error.textContent = caught.message;
      error.style.display = 'block';
      button.disabled = false;
      button.textContent = 'Sign in';
    }
  });
}
