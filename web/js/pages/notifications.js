import { api } from '../api.js';
import { can } from '../rbac.js';
import { emptyState, esc, icon, loadingRows, modal, qs, relativeTime, toast } from '../ui.js';

export const meta = { key: 'notifications', title: 'Notifications', subtitle: 'Broadcasts and audit alerts' };

/* Notification type -> icon tile. Audit rows are the noisy ones, so they stay neutral. */
const LOOK = {
  broadcast: { glyph: 'bell', tone: 'tone-blue' },
  leave: { glyph: 'umbrella', tone: 'tone-amber' },
  attendance: { glyph: 'attendance', tone: 'tone-green' },
  audit: { glyph: 'shield', tone: 'tone-grey' },
  info: { glyph: 'bell', tone: 'tone-blue' },
};

const istDate = (value) => new Date(`${String(value).replace(' ', 'T')}Z`);
const dayKey = (value) => new Date(istDate(value).getTime() + 330 * 60000).toISOString().slice(0, 10);
const today = () => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);

export async function render(root, context) {
  const state = { filter: 'all', items: [] };

  root.innerHTML = `
    <section class="card">
      <div class="card__head">
        <h3>Notifications</h3>
        <span class="pill pill--info" data-unread style="margin-left:8px">0 unread</span>
        <button class="btn btn--sm btn--ghost spacer" data-read-all>${icon('check', 15)} Mark all read</button>
      </div>
      <div class="chips" style="margin-top:4px">
        <button class="chip is-active" data-filter="all">All</button>
        <button class="chip" data-filter="unread">Unread</button>
        <button class="chip" data-filter="broadcast">Announcements</button>
      </div>
      ${can(context.user.role, 'settings.manage') ? `<button class="btn btn--gradient btn--lg" data-broadcast style="width:100%;margin-top:14px">${icon('bell', 18)} Send announcement</button>` : ''}
    </section>
    <div data-body>${loadingRows()}</div>`;

  const body = qs('[data-body]', root);

  qs('[data-read-all]', root).addEventListener('click', async () => {
    try { await api.readAll(); toast('All notifications marked read', 'ok'); await load(); context.refreshBadges(); }
    catch (error) { toast(error.message, 'err'); }
  });

  qs('[data-broadcast]', root)?.addEventListener('click', async () => {
    const result = await modal({
      title: 'Send announcement',
      submitLabel: 'Send to everyone',
      tone: 'btn--gradient',
      body: `<p class="muted small" style="margin-top:-6px">Every active account receives this, and the send is written to the audit trail.</p>
        <div class="field"><label>Title</label><input name="title" required maxlength="80" placeholder="Holiday on 2 October" /></div>
        <div class="field"><label>Message</label><textarea name="body" required rows="4" placeholder="The plant will remain closed for Gandhi Jayanti."></textarea></div>`,
    });
    if (!result) return;
    try {
      const { recipients } = await api.broadcast(result);
      toast(`Announcement sent to ${recipients} ${recipients === 1 ? 'person' : 'people'}`, 'ok');
      await load();
      context.refreshBadges();
    } catch (error) { toast(error.message, 'err'); }
  });

  root.querySelectorAll('[data-filter]').forEach((chip) => chip.addEventListener('click', () => {
    state.filter = chip.dataset.filter;
    root.querySelectorAll('[data-filter]').forEach((other) => other.classList.toggle('is-active', other.dataset.filter === state.filter));
    paint();
  }));

  await load();

  async function load() {
    body.innerHTML = loadingRows();
    try {
      const data = await api.notifications();
      state.items = data.notifications;
      const unread = data.unread ?? state.items.filter((item) => !item.read_at).length;
      qs('[data-unread]', root).textContent = `${unread} unread`;
      qs('[data-unread]', root).style.display = unread ? '' : 'none';
      paint();
    } catch (error) { body.innerHTML = `<section class="card">${emptyState('Could not load notifications', error.message)}</section>`; }
  }

  function paint() {
    const items = state.items.filter((item) => (
      state.filter === 'all'
      || (state.filter === 'unread' ? !item.read_at : item.type === 'broadcast')
    ));

    if (!items.length) {
      body.innerHTML = `<section class="card">${emptyState(
        state.filter === 'unread' ? 'You are all caught up' : 'Nothing here yet',
        'Announcements, leave decisions and audit alerts land on this screen.',
      )}</section>`;
      return;
    }

    const stamp = today();
    const groups = new Map();
    items.forEach((item) => {
      const key = dayKey(item.created_at);
      const label = key === stamp ? 'Today' : 'Earlier';
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(item);
    });

    body.innerHTML = [...groups].map(([label, group]) => `
      <section class="card">
        <div class="card__head"><h3>${esc(label)}</h3><span class="muted small spacer">${group.length}</span></div>
        <div class="stack">${group.map((item) => {
    const look = LOOK[item.type] || LOOK.info;
    return `<article class="notice ${item.read_at ? '' : 'notice--unread'}" data-id="${item.id}">
            <span class="rowcard__icon ${look.tone}">${icon(look.glyph, 18)}</span>
            <div class="rowcard__body">
              <strong>${esc(item.title)}</strong>
              <small>${esc(item.body)}</small>
            </div>
            <div class="notice__meta">
              <small class="muted">${esc(relativeTime(item.created_at))}</small>
              ${item.read_at ? '' : '<i class="notice__dot"></i>'}
            </div>
          </article>`;
  }).join('')}</div>
      </section>`).join('');

    body.querySelectorAll('[data-id]').forEach((node) => node.addEventListener('click', async () => {
      const item = state.items.find((entry) => entry.id === Number(node.dataset.id));
      if (!item || item.read_at) return;
      try { await api.readOne(item.id); await load(); context.refreshBadges(); } catch { /* non-critical */ }
    }));
  }
}
