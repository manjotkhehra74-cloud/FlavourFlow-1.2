import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  avatar, emptyState, esc, formatDate, icon, loadingRows, modal, monthIso, qs,
  relativeTime, shiftMonth, statusPill, titleCase, toast, todayIso,
} from '../ui.js';
import { t } from '../i18n.js';

export const meta = { key: 'leave', title: 'Leave', subtitle: 'Balances, requests and approvals' };

const TYPE_ICON = { casual: 'umbrella', sick: 'heart', earned: 'attendance' };
const TYPE_TONE = { casual: 'blue', sick: 'green', earned: 'violet' };

export async function render(root, context) {
  const { user } = context;
  const canApprove = can(user.role, 'leave.manage');
  const state = { view: canApprove ? 'pending' : 'mine', month: monthIso() };

  root.innerHTML = `
    <div data-mine>${loadingRows(3)}</div>
    ${canApprove ? '<div data-approvals></div>' : ''}`;

  await Promise.all([loadMine(), canApprove ? loadApprovals() : null]);

  /* ---------------- my leave ---------------- */

  async function loadMine() {
    const host = qs('[data-mine]', root);
    try {
      const data = await api.leavesMe();
      const balance = data.balance || { casual: 0, sick: 0, earned: 0 };
      host.innerHTML = `
        <section class="hero">
          <div class="hero__label">${esc(t('Leave balance'))}</div>
          <h3 style="margin-top:2px">${esc(t('Track your available leave'))}</h3>
          <div class="hero__tiles">
            ${[[t('Casual leave'), balance.casual, 'casual'], [t('Sick leave'), balance.sick, 'sick'], [t('Earned leave'), balance.earned, 'earned']]
              .map(([label, value, type]) => `<article class="hero__tile">
                <span class="stat__icon tone-${TYPE_TONE[type]}">${icon(TYPE_ICON[type])}</span>
                <small>${label}</small>
                <strong>${esc(value ?? 0)}<span>${esc(t('days'))}</span></strong>
              </article>`).join('')}
          </div>
        </section>

        <button class="btn btn--lg btn--block btn--gradient" style="margin-top:16px" data-apply>
          ${icon('attendance', 18)} ${esc(t('Apply for leave'))} ${icon('arrowRight', 16)}
        </button>

        <section class="card" style="margin-top:16px">
          <div class="card__head"><h3>${esc(t('Recent requests'))}</h3><span class="muted small spacer">${data.requests.length} ${esc(t('total'))}</span></div>
          ${data.requests.length ? `<div class="stack">${data.requests.slice(0, 12).map((request) => `
            <div class="rowcard">
              <span class="rowcard__icon tone-${TYPE_TONE[request.leave_type]}">${icon(TYPE_ICON[request.leave_type])}</span>
              <div class="rowcard__body">
                <strong>${esc(t('{type} leave', { type: t(titleCase(request.leave_type)) }))}</strong>
                <small>${icon('attendance', 12)} ${esc(formatDate(request.start_date, { day: '2-digit', month: 'short' }))}${request.start_date === request.end_date ? '' : ` – ${esc(formatDate(request.end_date, { day: '2-digit', month: 'short' }))}`} · ${esc(request.days)} day${request.days === 1 ? '' : 's'}</small>
                ${request.reviewer_note ? `<small style="display:block">${esc(t('Note'))}: ${esc(request.reviewer_note)}</small>` : ''}
              </div>
              ${statusPill(request.status)}
            </div>`).join('')}</div>`
            : emptyState(t('No leave requests yet'), t('Apply for casual, sick or earned leave in one tap.'))}
        </section>`;
      qs('[data-apply]', host)?.addEventListener('click', () => applyLeave(balance, loadMine));
    } catch (error) { host.innerHTML = emptyState(t('Could not load leave'), error.message); }
  }

  /* ---------------- approvals ---------------- */

  async function loadApprovals() {
    const host = qs('[data-approvals]', root);
    host.innerHTML = loadingRows(3);
    try {
      if (state.view === 'calendar') { paintCalendar(host, await api.leaveCalendar(state.month)); return; }
      const data = await api.leaveRequests(state.view);
      host.innerHTML = `
        ${tiles(data.counts, state.view)}
        <section class="card" style="margin-top:16px">
          <div class="card__head">
            <h3>${esc(state.view === 'pending' ? t('Leave approvals') : t('{status} requests', { status: t(titleCase(state.view)) }))}</h3>
            <span class="muted small spacer">${data.requests.length} request${data.requests.length === 1 ? '' : 's'}${state.view === 'pending' ? ' awaiting action' : ''}</span>
          </div>
          ${data.requests.length ? `<div class="stack">${data.requests.map(requestCard).join('')}</div>`
            : emptyState(state.view === 'pending' ? 'Nothing to approve' : `No ${state.view} requests`, 'New leave requests will show up here.')}
        </section>`;
      wireTiles(host);
      host.querySelectorAll('[data-review]').forEach((button) => button.addEventListener('click', () => reviewLeave(button, host)));
    } catch (error) { host.innerHTML = emptyState(t('Could not load approvals'), error.message); }
  }

  function tiles(counts, active) {
    const items = [
      { key: 'pending', label: t('Pending'), value: counts.pending, tone: 'amber', glyph: 'clock' },
      { key: 'approved', label: t('Approved'), value: counts.approved, tone: 'green', glyph: 'circleCheck' },
      { key: 'rejected', label: t('Rejected'), value: counts.rejected, tone: 'red', glyph: 'circleClose' },
      { key: 'calendar', label: t('Calendar'), value: '', tone: 'blue', glyph: 'attendance' },
    ];
    return `<div class="tiles">${items.map((item) => `
      <button class="tile ${item.key === active ? 'is-active' : ''}" data-view="${item.key}">
        <span class="tile__icon tone-${item.tone}">${icon(item.glyph)}</span>
        <small>${item.label}</small>
        ${item.value === '' ? `<strong style="font-size:15px;font-weight:600;color:var(--muted)">${esc(t('View month'))}</strong>` : `<strong style="color:${item.tone === 'green' ? '#16a34a' : item.tone === 'red' ? 'var(--red)' : item.tone === 'amber' ? 'var(--amber)' : 'var(--blue)'}">${item.value}</strong>`}
      </button>`).join('')}</div>`;
  }

  function wireTiles(host) {
    host.querySelectorAll('[data-view]').forEach((tile) => tile.addEventListener('click', () => {
      state.view = tile.dataset.view;
      loadApprovals();
    }));
  }

  function requestCard(request) {
    const balance = request[request.leave_type];
    return `<article class="list-card">
      <div class="list-card__top">
        ${avatar(request.name, request.photo_url)}
        <div class="list-card__body">
          <strong>${esc(request.name)}</strong>
          <span class="type">${esc(t('{type} leave', { type: t(titleCase(request.leave_type)) }))}</span>
          <div class="meta">${icon('attendance', 13)} ${esc(formatDate(request.start_date, { day: '2-digit', month: 'short' }))}${request.start_date === request.end_date ? '' : ` – ${esc(formatDate(request.end_date, { day: '2-digit', month: 'short' }))}`} (${esc(request.days)} day${request.days === 1 ? '' : 's'})</div>
          ${request.reason ? `<div class="meta">${esc(request.reason)}</div>` : ''}
          ${request.status !== 'pending' ? `<div class="meta">${statusPill(request.status)} ${request.reviewer_name ? `by ${esc(request.reviewer_name)}` : ''} ${request.reviewed_at ? `· ${esc(relativeTime(request.reviewed_at))}` : ''}</div>` : ''}
        </div>
        ${balance === undefined ? '' : `<div class="list-card__badge">
          ${icon('scale', 16)}
          <small>${esc(t('Balance'))}</small>
          <strong>${esc(balance)} ${esc(t('days'))}</strong>
        </div>`}
      </div>
      ${request.status === 'pending' ? `<div class="list-card__actions">
        <button class="btn btn--outline" data-review="rejected" data-id="${request.id}">${icon('close', 16)} ${esc(t('Reject'))}</button>
        <button class="btn btn--solid-green" data-review="approved" data-id="${request.id}">${icon('check', 16)} ${esc(t('Approve'))}</button>
      </div>` : ''}
    </article>`;
  }

  async function reviewLeave(button) {
    const decision = button.dataset.review;
    const result = await modal({
      title: decision === 'approved' ? 'Approve leave request' : 'Reject leave request',
      submitLabel: decision === 'approved' ? 'Approve' : 'Reject',
      tone: decision === 'approved' ? 'btn--solid-green' : 'btn--red',
      body: `<div class="field"><label>${esc(t('Note for the employee (optional)'))}</label><textarea name="note" placeholder="${esc(t('Add context for this decision'))}"></textarea></div>`,
    });
    if (!result) return;
    try {
      await api.reviewLeave(button.dataset.id, { decision, note: result.note || null });
      toast(`Leave ${decision}`, 'ok');
      await Promise.all([loadApprovals(), loadMine()]);
      context.refreshBadges();
    } catch (error) { toast(error.message, 'err'); }
  }

  function paintCalendar(host, data) {
    const [year, month] = data.month.split('-').map(Number);
    const first = new Date(Date.UTC(year, month - 1, 1));
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const lead = first.getUTCDay();
    const onDay = (day) => {
      const iso = `${data.month}-${String(day).padStart(2, '0')}`;
      return data.requests.filter((request) => request.start_date <= iso && request.end_date >= iso);
    };

    host.innerHTML = `
      ${tiles({ pending: 0, approved: 0, rejected: 0 }, 'calendar')}
      <section class="card" style="margin-top:16px">
        <div class="card__head">
          <h3>${esc(t('Team leave calendar'))}</h3>
          <div class="row spacer" style="gap:6px">
            <button class="week__nav" data-cal="-1">${icon('arrowLeft', 16)}</button>
            <span class="small" style="font-weight:600;min-width:104px;text-align:center">${esc(formatDate(`${data.month}-01`, { month: 'long', year: 'numeric' }))}</span>
            <button class="week__nav" data-cal="1">${icon('arrowRight', 16)}</button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">
          ${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => `<div class="muted small" style="text-align:center;font-weight:700">${day}</div>`).join('')}
          ${Array.from({ length: lead }, () => '<div></div>').join('')}
          ${Array.from({ length: daysInMonth }, (unused, index) => {
            const day = index + 1;
            const entries = onDay(day);
            const approved = entries.filter((entry) => entry.status === 'approved').length;
            const pending = entries.length - approved;
            return `<div style="border:1px solid var(--line);border-radius:11px;padding:7px 6px;min-height:62px;background:${entries.length ? '#f8fbff' : 'var(--surface)'}"
              title="${esc(entries.map((entry) => `${entry.name} (${entry.leave_type})`).join(', ') || t('No leave'))}">
              <div class="small" style="font-weight:700">${day}</div>
              ${approved ? `<span class="pill pill--approved" style="padding:1px 7px;font-size:11px;margin-top:4px">${approved}</span>` : ''}
              ${pending ? `<span class="pill pill--pending" style="padding:1px 7px;font-size:11px;margin-top:4px">${pending}</span>` : ''}
            </div>`;
          }).join('')}
        </div>
        <p class="muted small" style="margin-top:12px">${esc(t('Green counts are approved leave, amber are still pending.'))}</p>
      </section>`;

    wireTiles(host);
    host.querySelectorAll('[data-cal]').forEach((node) => node.addEventListener('click', () => {
      state.month = shiftMonth(state.month, Number(node.dataset.cal));
      loadApprovals();
    }));
  }
}

export async function applyLeave(balance, onDone) {
  const result = await modal({
    title: t('Apply for leave'),
    submitLabel: t('Submit request'),
    tone: 'btn--gradient',
    body: `<div class="form-grid">
      <div class="field"><label>${esc(t('Leave type'))}</label><select name="leaveType">
        <option value="casual">Casual (${balance.casual ?? 0} left)</option>
        <option value="sick">Sick (${balance.sick ?? 0} left)</option>
        <option value="earned">Earned (${balance.earned ?? 0} left)</option>
      </select></div>
      <div class="field"><label>${esc(t('From'))}</label><input type="date" name="startDate" value="${todayIso()}" required /></div>
      <div class="field"><label>${esc(t('To'))}</label><input type="date" name="endDate" value="${todayIso()}" required /></div>
    </div>
    <div class="field"><label>${esc(t('Reason'))}</label><textarea name="reason" placeholder="${esc(t('Share a short reason for your manager'))}"></textarea></div>`,
  });
  if (!result) return;
  try {
    await api.applyLeave({ ...result, reason: result.reason || null });
    toast(t('Leave request submitted'), 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
