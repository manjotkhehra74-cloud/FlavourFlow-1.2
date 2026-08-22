import { boot, wait } from './harness.mjs';

/**
 * The first-run path on a brand-new install: a super admin with no employee records.
 * Verifies there is a visible route from "nothing here" to a working punch button.
 */
const [, , phone = '+919501606877', password = 'fresh-password-123', language = 'pa'] = process.argv;
const problems = [];
const check = (label, ok, extra = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${extra ? ` — ${extra}` : ''}`);
  if (!ok) problems.push(label);
};

const { window, user, q, qa, text, click, go } = await boot({ phone, password, language });
console.log(`${user.name} (${user.role}) · fresh install\n`);

check('punch is disabled but explained', text('.punch').length > 0, text('.punch').slice(0, 90));
check('offers to create my employee profile', Boolean(q('[data-self-profile]')), text('[data-self-profile]'));

click(q('[data-self-profile]'));
await wait(900);
const form = q('.modal');
check('employee form opens', Boolean(form), text('.modal__head h3'));
check('name prefilled from the account', form?.querySelector('[name="name"]')?.value, form?.querySelector('[name="name"]')?.value);
check('phone prefilled', Boolean(form?.querySelector('[name="phone"]')?.value), form?.querySelector('[name="phone"]')?.value);
const linked = form?.querySelector('[name="userId"]');
check('login account preselected', linked && Number(linked.value) === user.id, linked ? `userId=${linked.value}` : 'no select');

form.querySelector('[name="employeeCode"]').value = 'GDF-001';
form.querySelector('[name="department"]').value = 'Management';
form.querySelector('[name="shiftName"]').value = 'General 9-6';
form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
await wait(1800);
check('profile saved', !q('.modal'), qa('#toasts .toast').map((n) => n.textContent).join(' | '));

await go('#/dashboard', 1800);
check('punch button now available', Boolean(q('[data-punch]')), text('.punch h2'));

click(q('[data-punch]'));
await wait(2200);
check('punch in recorded', qa('#toasts .toast').some((n) => n.textContent.length > 3), qa('#toasts .toast').map((n) => n.textContent).join(' | '));

await go('#/attendance', 2000);
check('manual entry in the page head', Boolean(q('.page-head [data-manual-head]')), text('.page-head [data-manual-head]'));
click(q('.page-head [data-manual-head]'));
await wait(1500);
check('manual attendance form opens', Boolean(q('.modal')), text('.modal__head h3'));
check('employee is selectable', (q('.modal [name="employeeId"]')?.options.length || 0) > 0,
  [...(q('.modal [name="employeeId"]')?.options || [])].map((o) => o.textContent).join(' | '));
click(q('.modal [data-close]'));

console.log(`\nErrors: ${problems.length ? problems.join(' | ') : 'none'}`);
process.exit(problems.length ? 1 : 0);
