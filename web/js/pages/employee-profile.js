import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  emptyState, esc, formatDate, formatTime, icon, initials, loadingRows, qs, statusPill,
  titleCase, toast,
} from '../ui.js';
import { employeeForm } from './employees.js';
import { manualEntry } from './attendance.js';
import { t } from '../i18n.js';

export const meta = { key: 'employees', title: 'Employee profile', subtitle: 'Overview, attendance and leave' };

const TYPE_ICON = { casual: 'umbrella', sick: 'heart', earned: 'attendance' };
const TYPE_TONE = { casual: 'blue', sick: 'green', earned: 'violet' };

export async function render(root, context, params) {
  const id = params.get('id');
  const canManage = can(context.user.role, 'employees.manage');
  const canMark = can(context.user.role, 'attendance.manage');
  let tab = 'overview';

  root.innerHTML = loadingRows(5);
  let data;
  try { data = await api.employee(id); }
  catch (error) { root.innerHTML = `<section class="card">${emptyState(t('Could not load this employee'), error.message)}</section>`; return; }

  const { employee, attendance, balance, leaves, account, counts } = data;

  root.innerHTML = `
    <div class="row" style="gap:8px">
      <a class="icon-btn" href="#/employees" title="${esc(t('Back to directory'))}">${icon('arrowLeft')}</a>
      <h3 style="font-size:17px">${esc(t('Employee profile'))}</h3>
      ${canManage ? `<button class="icon-btn spacer" data-edit title="${esc(t('Edit employee'))}">${icon('settings')}</button>` : ''}
    </div>

    <section class="hero">
      <div class="row" style="gap:16px;flex-wrap:nowrap">
        <span class="avatar avatar--lg" style="width:76px;height:76px;border:3px solid rgba(255,255,255,.7);background:#fff;color:var(--blue)">
          ${employee.photo_url ? `<img src="${esc(employee.photo_url)}" alt="${esc(employee.name)}" />` : esc(initials(employee.name).toUpperCase())}
        </span>
        <div style="min-width:0">
          <h2 style="font-size:26px;letter-spacing:-.03em">${esc(employee.name)}</h2>
          <div class="row" style="gap:8px;margin-top:8px">
            <span class="pill" style="background:rgba(255,255,255,.22);color:#fff">${icon('users', 13)} ${esc(employee.employee_code || t('No code'))}</span>
          </div>
          <div class="row" style="gap:6px;margin-top:8px;font-size:13.5px;opacity:.92">
            ${icon('employees', 14)} ${esc(employee.department || t('Unassigned'))} · ${esc(employee.shift_name || t('No shift'))}
          </div>
          <span class="pill" style="background:rgba(255,255,255,.95);color:#15803d;margin-top:10px">
            <i style="width:7px;height:7px;border-radius:50%;background:#16a34a;display:inline-block"></i> Active
          </span>
        </div>
      </div>
    </section>

    <section class="card" style="padding:0;overflow:hidden">
      <div class="segmented" style="border:0;border-radius:0;border-bottom:1px solid var(--line)">
        <button data-tab="overview" class="is-active">${icon('users', 16)} Overview</button>
        <button data-tab="attendance">${icon('attendance', 16)} Attendance</button>
        <button data-tab="leave">${icon('leave', 16)} Leave</button>
      </div>
      <div style="padding:18px" data-tabbody></div>
    </section>

    <div class="grid grid--2">
      <a class="btn btn--outline btn--lg" href="#/attendance">${icon('attendance', 18)} View attendance</a>
      ${canMark ? `<button class="btn btn--lg btn--gradient" data-manual>${icon('plus', 18)} Add manual entry</button>` : ''}
    </div>`;

  const tabBody = qs('[data-tabbody]', root);
  root.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    tab = button.dataset.tab;
    root.querySelectorAll('[data-tab]').forEach((other) => other.classList.toggle('is-active', other.dataset.tab === tab));
    paintTab();
  }));
  qs('[data-edit]', root)?.addEventListener('click', () => employeeForm(employee, () => context.reload()));
  qs('[data-manual]', root)?.addEventListener('click', () => manualEntry(() => context.reload(), employee.id));
  paintTab();

  function paintTab() {
    if (tab === 'overview') return paintOverview();
    if (tab === 'attendance') return paintAttendance();
    return paintLeave();
  }

  function paintOverview() {
    const rows = [
      { label: t('Phone'), value: employee.phone || t('Not recorded'), glyph: 'clock', tone: 'blue', href: employee.phone ? `tel:${employee.phone}` : null },
      { label: t('Joined'), value: formatDate(employee.join_date), glyph: 'attendance', tone: 'green' },
      { label: t('Department'), value: employee.department || t('Unassigned'), glyph: 'employees', tone: 'violet' },
      { label: t('Designation'), value: employee.role_title || t('Not set'), glyph: 'users', tone: 'amber' },
      { label: t('Login account'), value: account ? `${account.name} · ${t(titleCase(account.role))}` : t('Not linked — cannot punch in'), glyph: 'shield', tone: account ? 'green' : 'red' },
    ];
    tabBody.innerHTML = `<div class="stack">${rows.map((row) => `
      <${row.href ? `a href="${esc(row.href)}"` : 'div'} class="rowcard" style="color:inherit">
        <span class="rowcard__icon tone-${row.tone}">${icon(row.glyph)}</span>
        <div class="rowcard__body"><small>${esc(row.label)}</small><strong>${esc(row.value)}</strong></div>
        ${row.href ? icon('arrowRight', 16) : ''}
      </${row.href ? 'a' : 'div'}>`).join('')}
    </div>`;
  }

  function paintAttendance() {
    tabBody.innerHTML = `
      <div class="summary" style="margin-bottom:16px">
        <div><strong class="t-green">${counts.present}</strong><small>${esc(t('Present'))}</small></div>
        <div><strong class="t-amber">${counts.late}</strong><small>${esc(t('Late'))}</small></div>
        <div><strong class="t-blue">${counts.half_day}</strong><small>${esc(t('Half day'))}</small></div>
        <div><strong class="t-grey">${counts.absent}</strong><small>${esc(t('Absent'))}</small></div>
      </div>
      ${attendance.length ? `<div class="table-wrap"><table>
        <thead><tr><th>${esc(t('Date'))}</th><th>${esc(t('Status'))}</th><th>${esc(t('In'))}</th><th>${esc(t('Out'))}</th><th>${esc(t('Source'))}</th></tr></thead>
        <tbody>${attendance.map((record) => `<tr>
          <td>${esc(formatDate(record.attendance_date, { weekday: 'short', day: '2-digit', month: 'short' }))}</td>
          <td>${statusPill(record.status)}</td>
          <td>${esc(formatTime(record.punch_in_at))}</td>
          <td>${esc(formatTime(record.punch_out_at))}</td>
          <td><span class="pill">${esc(record.entry_source || 'mobile')}</span></td>
        </tr>`).join('')}</tbody></table></div>`
        : emptyState(t('No attendance yet'), t('Punches and manual entries will appear here.'))}`;
  }

  function paintLeave() {
    tabBody.innerHTML = `
      ${balance ? `<div class="tiles" style="margin-bottom:16px">
        ${[[t('Casual'), balance.casual, 'casual'], [t('Sick'), balance.sick, 'sick'], [t('Earned'), balance.earned, 'earned']].map(([label, value, type]) => `
          <div class="tile" style="cursor:default">
            <span class="tile__icon tone-${TYPE_TONE[type]}">${icon(TYPE_ICON[type])}</span>
            <small>${label}</small><strong>${esc(value)}<span style="font-size:13px;color:var(--muted);font-weight:600"> days</span></strong>
          </div>`).join('')}
      </div>` : ''}
      ${leaves.length ? `<div class="stack">${leaves.map((leave) => `
        <div class="rowcard">
          <span class="rowcard__icon tone-${TYPE_TONE[leave.leave_type]}">${icon(TYPE_ICON[leave.leave_type])}</span>
          <div class="rowcard__body">
            <strong>${esc(t('{type} leave', { type: t(titleCase(leave.leave_type)) }))}</strong>
            <small>${esc(formatDate(leave.start_date, { day: '2-digit', month: 'short' }))}${leave.start_date === leave.end_date ? '' : ` – ${esc(formatDate(leave.end_date, { day: '2-digit', month: 'short' }))}`} · ${esc(leave.days)} day${leave.days === 1 ? '' : 's'}${leave.reviewer_name ? ` · ${esc(leave.reviewer_name)}` : ''}</small>
          </div>
          ${statusPill(leave.status)}
        </div>`).join('')}</div>`
        : emptyState(t('No leave requests'), t('Approved and pending leave will be listed here.'))}`;
  }
}
