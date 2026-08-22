import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  avatar, currentPosition, emptyState, esc, formatDate, formatTime, greeting, icon,
  loadingRows, qs, relativeTime, statusPill, titleCase, toast,
} from '../ui.js';

export const meta = { key: 'dashboard', title: 'Dashboard', subtitle: 'Today at a glance' };

export async function render(root, context) {
  root.innerHTML = loadingRows(5);
  let data;
  try { data = await api.dashboard(); } catch (error) { root.innerHTML = emptyState('Could not load the dashboard', error.message); return; }

  const { user } = context;
  const counts = data.todayCounts;
  const stats = [];
  if (counts) {
    stats.push(
      { label: 'Present today', value: counts.present, tone: 'green', iconName: 'employees', foot: `${counts.headcount} active employees` },
      { label: 'Late', value: counts.late, tone: 'amber', iconName: 'clock', foot: 'After 9:10 AM punch-in' },
      { label: 'Absent', value: counts.absent, tone: 'red', iconName: 'close', foot: `${counts.notMarked} not marked yet` },
    );
  }
  if (data.pendingLeaves !== undefined) {
    stats.push({ label: 'Leave approvals', value: data.pendingLeaves, tone: 'violet', iconName: 'leave', foot: 'Waiting on your review' });
  }
  if (!counts && data.myBalance) {
    const { casual, sick, earned } = data.myBalance;
    stats.push(
      { label: 'Casual leave', value: casual, tone: 'blue', iconName: 'leave', foot: 'Balance remaining' },
      { label: 'Sick leave', value: sick, tone: 'amber', iconName: 'leave', foot: 'Balance remaining' },
      { label: 'Earned leave', value: earned, tone: 'green', iconName: 'leave', foot: 'Balance remaining' },
    );
  }

  const quickLinks = [
    { route: 'attendance', label: 'Attendance', hint: 'View register', iconName: 'attendance', tone: 'blue', perm: 'attendance.view' },
    { route: 'leave', label: 'Leave', hint: 'Apply or approve', iconName: 'leave', tone: 'green', perm: 'leave.view' },
    { route: 'employees', label: 'Employees', hint: 'Team directory', iconName: 'employees', tone: 'violet', perm: 'employees.view' },
    { route: 'reports', label: 'Reports', hint: 'Insights & exports', iconName: 'reports', tone: 'amber', perm: 'reports.view' },
  ].filter((link) => can(user.role, link.perm));

  root.innerHTML = `
    ${punchCard(data)}
    ${stats.length ? `<div class="grid grid--stats">${stats.map(statCard).join('')}</div>` : ''}
    <div class="grid grid--2">
      ${data.trend ? trendCard(data.trend) : leaveBalanceCard(data.myBalance)}
      ${data.departments ? departmentCard(data.departments) : myRecentCard(data)}
    </div>
    <section class="card">
      <div class="card__head"><h3>Your workspace</h3></div>
      <div class="quick">${quickLinks.map((link) => `
        <a href="#/${link.route}">
          <span class="quick__icon tone-${link.tone}">${icon(link.iconName)}</span>
          <strong>${esc(link.label)}</strong>
          <small>${esc(link.hint)}</small>
        </a>`).join('')}
      </div>
    </section>
    ${data.recentActivity?.length ? `<section class="card">
      <div class="card__head"><h3>Recent activity</h3><span class="pill pill--info spacer">Audit log</span></div>
      <div class="timeline">${data.recentActivity.map((item) => `
        <div class="timeline__item">
          <span class="timeline__dot"></span>
          <div>
            <strong class="small">${esc(titleCase(item.action.replaceAll('.', ' ')))}</strong>
            <small> · ${esc(item.actor || 'System')} · ${esc(relativeTime(item.created_at))}</small>
          </div>
        </div>`).join('')}
      </div>
    </section>` : ''}
  `;

  wirePunch(root, data, context);

  function punchCard(payload) {
    const record = payload.myAttendance;
    const name = user.name.split(' ')[0];
    if (!payload.employee) {
      return `<section class="card punch">
        <div class="punch__info">
          <p class="muted small">${esc(formatDate(payload.today, { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
          <h2>${esc(greeting())}, ${esc(name)} 🙏</h2>
          <p class="muted">Your account is not linked to an employee profile yet, so punching is disabled. You can still manage the team below.</p>
        </div>
      </section>`;
    }
    const state = !record?.punch_in_at ? 'in' : (!record.punch_out_at ? 'out' : 'done');
    const headline = { in: 'Ready to punch in', out: 'You are punched in', done: 'Day complete' }[state];
    const sub = { in: "Let's make it a productive day!", out: 'Remember to punch out before you leave.', done: 'Thanks for the good work today.' }[state];
    return `<section class="card punch">
      <div class="punch__info">
        <p class="muted small">${icon('attendance', 14)} ${esc(formatDate(payload.today, { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
        <h2>${esc(headline)}</h2>
        <p class="muted">${esc(sub)}</p>
        <div class="punch__badges">
          <span class="pill pill--ok">${icon('pin', 13)} GPS verified</span>
          <span class="pill pill--info">${icon('employees', 13)} Selfie optional</span>
          ${record?.status ? statusPill(record.status) : ''}
        </div>
        <div class="punch__times">
          <div><small>Punch in</small><strong>${esc(formatTime(record?.punch_in_at))}</strong></div>
          <div><small>Punch out</small><strong>${esc(formatTime(record?.punch_out_at))}</strong></div>
        </div>
      </div>
      <div class="punch__action">
        <button class="punch__btn" data-punch="${state}" ${state === 'done' ? 'disabled' : ''}>
          ${icon('finger', 42)}
          <span>${state === 'in' ? 'PUNCH IN' : state === 'out' ? 'PUNCH OUT' : 'ALL DONE'}</span>
        </button>
        <small class="muted">${state === 'done' ? 'See you tomorrow' : 'Tap to record'}</small>
      </div>
    </section>`;
  }
}

const statCard = (stat) => `<article class="card stat">
  <div class="stat__top">
    <span class="stat__icon tone-${stat.tone}">${icon(stat.iconName)}</span>
    <span class="stat__label">${esc(stat.label)}</span>
  </div>
  <div class="stat__value">${esc(stat.value ?? 0)}</div>
  <div class="stat__foot">${esc(stat.foot)}</div>
</article>`;

function trendCard(trend) {
  if (!trend.length) return `<section class="card">${emptyState('No attendance recorded yet', 'Punches will appear here once the team starts marking attendance.')}</section>`;
  const peak = Math.max(...trend.map((day) => day.present + day.absent), 1);
  return `<section class="card">
    <div class="card__head">
      <h3>Last ${trend.length} days</h3>
      <div class="legend spacer"><span><i style="background:var(--blue)"></i>Present</span><span><i style="background:#fca5a5"></i>Absent</span></div>
    </div>
    <div class="bars">${trend.map((day) => `
      <div class="bars__col" title="${esc(day.date)}: ${day.present} present, ${day.absent} absent">
        <div class="bars__stack">
          <div class="bars__fill" style="height:${(day.present / peak) * 100}%"></div>
          <div class="bars__fill bars__fill--absent" style="height:${(day.absent / peak) * 100}%"></div>
        </div>
        <span class="bars__label">${esc(day.date.slice(8))}</span>
      </div>`).join('')}
    </div>
  </section>`;
}

function departmentCard(departments) {
  if (!departments.length) return `<section class="card">${emptyState('No departments yet', 'Add employees with a department to see this split.')}</section>`;
  return `<section class="card">
    <div class="card__head"><h3>Department attendance</h3><span class="muted small spacer">Today</span></div>
    <div class="stack">${departments.slice(0, 6).map((row) => `
      <div>
        <div class="row" style="justify-content:space-between">
          <strong class="small">${esc(row.department)}</strong>
          <span class="muted small">${row.present}/${row.headcount}</span>
        </div>
        <div class="progress" style="margin-top:6px"><span style="width:${row.headcount ? (row.present / row.headcount) * 100 : 0}%"></span></div>
      </div>`).join('')}
    </div>
  </section>`;
}

function leaveBalanceCard(balance) {
  if (!balance) return `<section class="card">${emptyState('No leave balance yet', 'HR will set your opening balance.')}</section>`;
  const rows = [['Casual', balance.casual, 7], ['Sick', balance.sick, 5], ['Earned', balance.earned, 12]];
  return `<section class="card">
    <div class="card__head"><h3>Leave balance</h3></div>
    <div class="stack">${rows.map(([label, value, total]) => `
      <div>
        <div class="row" style="justify-content:space-between">
          <strong class="small">${label}</strong><span class="muted small">${value} of ${total} days</span>
        </div>
        <div class="progress" style="margin-top:6px"><span style="width:${Math.min((value / total) * 100, 100)}%"></span></div>
      </div>`).join('')}
    </div>
  </section>`;
}

function myRecentCard(data) {
  return `<section class="card">
    <div class="card__head"><h3>Today</h3></div>
    <div class="row">
      ${avatar(data.employee?.name || 'HRMate', data.employee?.photo_url, 'avatar--lg')}
      <div>
        <strong>${esc(data.employee?.name || '—')}</strong>
        <div class="muted small">${esc(data.employee?.role_title || 'Employee')} · ${esc(data.employee?.department || 'Unassigned')}</div>
        <div style="margin-top:8px">${statusPill(data.myAttendance?.status || 'absent')}</div>
      </div>
    </div>
  </section>`;
}

function wirePunch(root, data, context) {
  const button = qs('[data-punch]', root);
  if (!button) return;
  button.addEventListener('click', async () => {
    const mode = button.dataset.punch;
    if (mode === 'done') return;
    button.disabled = true;
    try {
      const position = await currentPosition();
      if (mode === 'in') await api.punchIn(position || {});
      else await api.punchOut(position || {});
      toast(mode === 'in' ? 'Punched in. Have a great shift!' : 'Punched out. Well done!', 'ok');
      context.reload();
    } catch (error) {
      toast(error.message, 'err');
      button.disabled = false;
    }
  });
}
