import { api } from '../api.js';
import { emptyState, esc, icon, loadingRows, qs, relativeTime, toast } from '../ui.js';

export const meta = { key: 'notifications', title: 'Notifications', subtitle: 'Broadcasts and audit alerts' };

export async function render(root, context) {
  root.innerHTML = `<section class="card">
    <div class="card__head">
      <h3>Notifications</h3>
      <button class="btn btn--sm btn--ghost spacer" data-read-all>${icon('check', 15)} Mark all read</button>
    </div>
    <div data-body>${loadingRows()}</div>
  </section>`;

  const body = qs('[data-body]', root);
  qs('[data-read-all]', root).addEventListener('click', async () => {
    try { await api.readAll(); toast('All notifications marked read', 'ok'); await load(); context.refreshBadges(); }
    catch (error) { toast(error.message, 'err'); }
  });
  await load();

  async function load() {
    body.innerHTML = loadingRows();
    try {
      const { notifications } = await api.notifications();
      body.innerHTML = notifications.length ? `<div class="stack">${notifications.map((item) => `
        <div class="row" data-id="${item.id}" style="align-items:flex-start;gap:12px;padding:12px;border-radius:14px;background:${item.read_at ? 'transparent' : 'var(--blue-soft)'};border:1px solid var(--line);cursor:${item.read_at ? 'default' : 'pointer'}">
          <span class="stat__icon ${item.read_at ? 'tone-blue' : 'tone-green'}" style="width:34px;height:34px">${icon('bell', 17)}</span>
          <div style="flex:1;min-width:0">
            <strong class="small">${esc(item.title)}</strong>
            <div class="muted small">${esc(item.body)}</div>
          </div>
          <small class="muted">${esc(relativeTime(item.created_at))}</small>
        </div>`).join('')}</div>` : emptyState('You are all caught up', 'Audit alerts and broadcasts will appear here.');

      body.querySelectorAll('[data-id]').forEach((node) => node.addEventListener('click', async () => {
        try { await api.readOne(node.dataset.id); await load(); context.refreshBadges(); } catch { /* ignore */ }
      }));
    } catch (error) { body.innerHTML = emptyState('Could not load notifications', error.message); }
  }
}
