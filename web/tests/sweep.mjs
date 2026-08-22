import { boot, wait } from './harness.mjs';

/** Visits every route and reports rendered size plus any thrown error. */
const [, , phone = '+919000000001', language = 'pa', appearance = 'system'] = process.argv;
const errors = [];
process.on('uncaughtException', (error) => errors.push(String(error)));
process.on('unhandledRejection', (error) => errors.push(String(error)));

const app = await boot({ phone, language, appearance });
console.log(`${app.user.name} (${app.user.role}) · ${language} · ${appearance}\n`);

for (const route of ['dashboard', 'attendance', 'leave', 'employees', 'reports', 'users', 'notifications', 'settings']) {
  await app.go(`#/${route}`, 1800);
  const outlet = app.q('[data-outlet]');
  const chars = outlet?.textContent.replace(/\s+/g, ' ').trim().length || 0;
  const empty = outlet?.querySelector('.empty')?.textContent?.slice(0, 42) || '';
  console.log(`${route.padEnd(14)} title=${app.text('.page-head h1').padEnd(20)} chars=${String(chars).padStart(5)} ${chars < 40 ? '<<< THIN' : ''} ${empty ? `empty:"${empty}"` : ''}`);
}

await wait(200);
console.log(`\ntheme=${app.q('html')?.getAttribute('data-theme') ?? 'light'}`);
console.log('errors:', errors.length ? errors.join(' | ') : 'none');
process.exit(errors.length ? 1 : 0);
