/*
 * Local display preferences. They live in localStorage rather than on the server because
 * they describe this device, not the account — the Flutter client will keep its own copy.
 */

const KEY = 'hrmate.prefs';

export const LANGUAGES = [
  { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
  { value: 'en', label: 'English' },
];

export const APPEARANCES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const TEXT_SIZES = [
  { value: 'small', label: 'Small', scale: 14 },
  { value: 'default', label: 'Default', scale: 15 },
  { value: 'large', label: 'Large', scale: 17 },
];

const DEFAULTS = { language: 'pa', appearance: 'system', textSize: 'default' };

export function getPrefs() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { ...DEFAULTS }; }
}

export function setPref(key, value) {
  const next = { ...getPrefs(), [key]: value };
  localStorage.setItem(KEY, JSON.stringify(next));
  applyPrefs();
  return next;
}

export const labelFor = (list, value) => list.find((entry) => entry.value === value)?.label ?? value;

/** Reflects the stored preferences onto <html>. Safe to call as often as you like. */
export function applyPrefs() {
  const prefs = getPrefs();
  const root = document.documentElement;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const dark = prefs.appearance === 'dark' || (prefs.appearance === 'system' && prefersDark);
  root.dataset.theme = dark ? 'dark' : 'light';
  root.lang = prefs.language;
  document.body.style.fontSize = `${TEXT_SIZES.find((size) => size.value === prefs.textSize)?.scale ?? 15}px`;
  return prefs;
}

/** Keeps "System" honest when the OS flips between light and dark. */
export function watchSystemTheme() {
  window.matchMedia?.('(prefers-color-scheme: dark)')
    .addEventListener?.('change', () => { if (getPrefs().appearance === 'system') applyPrefs(); });
}
