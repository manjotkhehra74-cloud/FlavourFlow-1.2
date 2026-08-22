import { boot, wait } from './harness.mjs';

/** Exercises the app chrome: app bar, account menu, search, tab bar FAB and filters. */
const [, , phone = '+919000000001', language = 'pa', appearance = 'system'] = process.argv;
const problems = [];
const check = (label, ok, extra = '') => {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${extra ? ` — ${extra}` : ''}`);
  if (!ok) problems.push(label);
};

const { window, user, q, qa, text, click, go } = await boot({ phone, language, appearance });
console.log(`${user.name} (${user.role}) · ${language} · ${appearance}\n`);

check('app bar', Boolean(q('.appbar')) && Boolean(q('.appbar__brand img')));
check('app bar actions', Boolean(q('[data-search]')) && Boolean(q('[data-account]')) && Boolean(q('.appbar a[href="#/notifications"]')));
check('page head', Boolean(q('.page-head h1')), text('.page-head h1'));
check('tab bar', qa('.tabbar a').length >= 1 && Boolean(q('[data-fab]')) && Boolean(q('[data-more]')),
  qa('.tabbar a').map((a) => a.textContent.trim()).join(' | '));

click(q('[data-account]'));
await wait(120);
check('account menu opens', q('.menu--account') && !q('.menu--account').hidden, text('.menu--account'));
click(window.document.body);
await wait(120);
check('account menu closes', q('.menu--account')?.hidden === true);

click(q('[data-search]'));
await wait(200);
check('search opens with jump-to list', Boolean(q('.searchbox')) && qa('.searchbox__row').length > 0, `${qa('.searchbox__row').length} rows`);
const input = q('.searchbox [data-input]');
input.value = 'a';
input.dispatchEvent(new window.Event('input', { bubbles: true }));
await wait(1200);
check('search finds records', qa('.searchbox__row').length > 0, qa('.searchbox__title').map((n) => n.textContent).join(', '));
const person = qa('.searchbox__row').find((row) => row.dataset.goto.startsWith('#/employees?id='));
if (person) {
  q('.searchbox').remove();
  await go(person.dataset.goto, 1600);
  check('opens employee profile', Boolean(q('.hero h2')), text('.hero h2'));
  click(q('[data-goto-tab]'));
  await wait(250);
  check('View attendance switches tab', q('[data-tab="attendance"]')?.classList.contains('is-active'));
} else {
  click(q('.searchbox [data-close]'));
}

await go('#/dashboard', 1400);
click(q('[data-fab]'));
await wait(2500);
if (q('.sheet')) {
  check('quick action sheet', qa('.sheet [data-run]').length > 0, qa('.sheet [data-run] strong').map((n) => n.textContent).join(' | '));
  click(q('.sheet [data-close]'));
} else {
  check('fab punched in one tap', qa('#toasts .toast').length > 0, qa('#toasts .toast').map((n) => n.textContent).join(' | '));
}
await wait(300);

await go('#/employees', 1800);
if (q('.page-head [data-filter]')) {
  const before = qa('[data-open]').length;
  check('employee directory', before > 0, `${before} cards`);
  click(q('.page-head [data-filter]'));
  await wait(300);
  check('employee filter sheet', Boolean(q('.sheet [data-group="status"]')), qa('.sheet .chip').map((c) => c.textContent.trim()).join(', '));
  click(qa('.sheet [data-group="status"] .chip').find((c) => c.dataset.value === 'leave'));
  click(q('.sheet [data-apply]'));
  await wait(400);
  check('filter applies', qa('[data-open]').length <= before, `${before} → ${qa('[data-open]').length}`);
} else { console.log('…  employees not permitted for this role'); }

await go('#/reports', 2000);
if (q('.page-head .monthpick')) {
  const label = text('.page-head [data-label]');
  click(q('.page-head [data-month="-1"]'));
  await wait(1300);
  check('month picker', text('.page-head [data-label]') !== label, `${label} → ${text('.page-head [data-label]')}`);
} else { console.log('…  reports not permitted for this role'); }

await go('#/notifications', 1600);
check('mark all read in the page head', Boolean(q('.page-head [data-read-all]')), text('.page-head [data-read-all]'));

await go('#/users', 1600);
if (q('.page-head [data-filter]')) {
  click(q('.page-head [data-filter]'));
  await wait(300);
  check('user filter sheet', Boolean(q('.sheet [data-group="role"]')), qa('.sheet .chip').map((c) => c.textContent.trim()).join(', '));
  click(q('.sheet [data-apply]'));
} else { console.log('…  users not permitted for this role'); }

if (language !== 'en') {
  const body = window.document.body.textContent;
  const leaks = ['Quick actions', 'Filters', 'Mark all read', 'Jump to', 'Sign out', 'Nothing here yet', 'More']
    .filter((word) => body.includes(word));
  check(`no untranslated chrome (${language})`, leaks.length === 0, leaks.join(', ') || 'none');
}

console.log(`\nErrors: ${problems.length ? problems.join(' | ') : 'none'}`);
process.exit(problems.length ? 1 : 0);
