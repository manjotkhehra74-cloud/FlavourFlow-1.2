import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Boots the console the way a browser would, but inside Node: JSDOM supplies the DOM,
 * `app.js` is imported as a real ES module, and relative fetches are pointed at a running
 * dev server. JSDOM cannot execute `<script type="module">`, hence the manual import.
 *
 *   cd server && DATABASE_PATH=./data/demo.sqlite PORT=3101 node src/index.js
 *   node web/tests/shell.mjs +919000000001 pa
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(here, '../../server/package.json'));
// jsdom is a dev-only extra: `cd server && npm install --no-save --ignore-scripts jsdom`
const { JSDOM } = await import(`file://${require.resolve('jsdom')}`);

export const BASE = process.env.HRMATE_BASE || 'http://127.0.0.1:3101';
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function boot({ phone = '+919000000001', language = 'pa', appearance = 'system', password = 'demo-password-123' } = {}) {
  const html = await (await fetch(`${BASE}/`)).text();
  const dom = new JSDOM(html, { url: `${BASE}/`, pretendToBeVisual: true });
  const { window } = dom;

  global.window = window;
  global.document = window.document;
  global.localStorage = window.localStorage;
  global.CustomEvent = window.CustomEvent;
  global.HTMLElement = window.HTMLElement;
  // Node's own FormData rejects a JSDOM <form>; the page must use the window's copy.
  global.FormData = window.FormData;
  Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });

  const realFetch = globalThis.fetch;
  global.fetch = (url, options) => realFetch(String(url).startsWith('http') ? url : `${BASE}${url}`, options);
  window.fetch = global.fetch;

  window.localStorage.setItem('hrmate.prefs', JSON.stringify({ language, appearance, textSize: 'default' }));
  const login = await (await realFetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  })).json();
  if (!login.token) throw new Error(`login failed: ${JSON.stringify(login)}`);
  window.localStorage.setItem('hrmate.token', login.token);
  window.localStorage.setItem('hrmate.user', JSON.stringify(login.user));

  await import(path.join(here, '../js/app.js'));
  await wait(2200);

  return {
    window,
    user: login.user,
    q: (sel) => window.document.querySelector(sel),
    qa: (sel) => [...window.document.querySelectorAll(sel)],
    text: (sel) => window.document.querySelector(sel)?.textContent.trim().replace(/\s+/g, ' ') ?? '',
    click: (node) => node?.dispatchEvent(new window.MouseEvent('click', { bubbles: true })),
    go: async (hash, ms = 1600) => { window.location.hash = hash; await wait(ms); },
  };
}
