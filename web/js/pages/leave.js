import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  avatar, emptyState, esc, formatDate, icon, loadingRows, modal, qs, relativeTime,
  statusPill, titleCase, toast, todayIso,
} from '../ui.js';

export const meta = { key: 'leave', title: 'Leave', subtitle: 'Balances, requests and approvals' };

export async function render(root, context) {
  const { user } = context;
  const canApprove = can(user.role, 'leave.manage');

  root.innerHTML = `
    <div data-mine>${loadingRows(3)}</div>
    ${canApprove ? '<div data-approvals></div>' : ''}`;

  await Promise.all([loadMine(), canApprove ? loadApprovals() : null]);

  async function loadMine() {
    const host = qs('[data-mine]', root);
    try {
      const data = await api.leavesMe();
      const balance = data.balance || { casual: 0, sick: 0, earned: 0 };
      host.innerHTML = `
        <div class="grid grid--stats">
          ${[['Casual leave', balance.casual, 'blue'], ['Sick leave', balance.sick, 'amber'], ['Earned leave', balance.earned, 'green']]
            .map(([label, value, tone]) => `<article class="card stat">
              <div class="stat__top"><span class="stat__icon tone-${tone}">${icon('leave')}</span><span class="stat__label">${label}</span></div>
              <div class="stat__value">${esc(value ?? 0)}</div><div class="stat__foot">days available</div>
            </article>`).join('')}
        </div>
        <section class="card" style="margin-top:16px">
          <div class="card__head">
            <h3>My requests</h3>
            <button class="btn btn--sm spacer" data-apply>${icon('plus', 15)} Apply for leave</button>
          </div>
          ${data.requests.length ? `<div class="table-wrap"><table>
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Applied</th></tr></thead>
            <tbody>${data.requests.map((request) => `<tr>
              <td><strong>${esc(titleCase(request.leave_type))}</strong>${request.reason ? `<div class="muted small">${esc(request.reason)}</div>` : ''}</td>
              <td>${esc(formatDate(request.start_date))}</td>
              <td>${esc(formatDate(request.end_date))}</td>
              <td>${esc(request.days)}</td>
              <td>${statusPill(request.status)}</td>
              <td class="muted small">${esc(relativeTime(request.created_at))}</td>
            </tr>`).join('')}</tbody></table></div>`
            : emptyState('No leave requests yet', 'Apply for casual, sick or earned leave in one tap.')}
        </section>`;
      qs('[data-apply]', host)?.addEventListener('click', () => applyLeave(balance, loadMine));
    } catch (error) { host.innerHTML = emptyState('Could not load leave', error.message); }
  }

  async function loadApprovals() {
    const host = qs('[data-approvals]', root);
    host.innerHTML = loadingRows(3);
    try {
      const pending = await api.pendingLeaves();
      host.innerHTML = `<section class="card">
        <div class="card__head"><h3>Pending approvals</h3><span class="pill pill--pending spacer">${pending.length} waiting</span></div>
        ${pending.length ? `<div class="table-wrap"><table>
          <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th></th></tr></thead>
          <tbody>${pending.map((request) => `<tr>
            <td><div class="cell-user">${avatar(request.name, null)}<div><strong>${esc(request.name)}</strong><small>${esc(request.department || request.employee_code || '')}</small></div></div></td>
            <td>${esc(titleCase(request.leave_type))}</td>
            <td class="small">${esc(formatDate(request.start_date, { day: '2-digit', month: 'short' }))} → ${esc(formatDate(request.end_date, { day: '2-digit', month: 'short' }))}</td>
            <td>${esc(request.days)}</td>
            <td class="muted small">${esc(request.reason || '—')}</td>
            <td><div class="row" style="flex-wrap:nowrap;justify-content:flex-end">
              <button class="btn btn--sm btn--green" data-review="approved" data-id="${request.id}">Approve</button>
              <button class="btn btn--sm btn--ghost" data-review="rejected" data-id="${request.id}">Reject</button>
            </div></td>
          </tr>`).join('')}</tbody></table></div>`
          : emptyState('Nothing to approve', 'New leave requests will show up here.')}
      </section>`;
      host.querySelectorAll('[data-review]').forEach((button) => button.addEventListener('click', async () => {
        const decision = button.dataset.review;
        const result = await modal({
          title: decision === 'approved' ? 'Approve leave request' : 'Reject leave request',
          submitLabel: decision === 'approved' ? 'Approve' : 'Reject',
          tone: decision === 'approved' ? 'btn--green' : 'btn--red',
          body: '<div class="field"><label>Note for the employee (optional)</label><textarea name="note" placeholder="Add context for this decision"></textarea></div>',
        });
        if (!result) return;
        try {
          await api.reviewLeave(button.dataset.id, { decision, note: result.note || null });
          toast(`Leave ${decision}`, 'ok');
          await Promise.all([loadApprovals(), loadMine()]);
          context.refreshBadges();
        } catch (error) { toast(error.message, 'err'); }
      }));
    } catch (error) { host.innerHTML = emptyState('Could not load approvals', error.message); }
  }
}

async function applyLeave(balance, onDone) {
  const result = await modal({
    title: 'Apply for leave',
    submitLabel: 'Submit request',
    body: `<div class="form-grid">
      <div class="field"><label>Leave type</label><select name="leaveType">
        <option value="casual">Casual (${balance.casual ?? 0} left)</option>
        <option value="sick">Sick (${balance.sick ?? 0} left)</option>
        <option value="earned">Earned (${balance.earned ?? 0} left)</option>
      </select></div>
      <div class="field"><label>From</label><input type="date" name="startDate" value="${todayIso()}" required /></div>
      <div class="field"><label>To</label><input type="date" name="endDate" value="${todayIso()}" required /></div>
    </div>
    <div class="field"><label>Reason</label><textarea name="reason" placeholder="Share a short reason for your manager"></textarea></div>`,
  });
  if (!result) return;
  try {
    await api.applyLeave({ ...result, reason: result.reason || null });
    toast('Leave request submitted', 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
