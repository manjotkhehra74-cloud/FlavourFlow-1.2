import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  avatar, currentPosition, emptyState, esc, formatDate, formatTime, greeting, icon,
  loadingRows, qs, relativeTime, statusPill, titleCase, toast,
} from '../ui.js';
import { t } from '../i18n.js';

/* Audit actions arrive as `entity.verb`; translate both halves so the feed reads natively. */
const AUDIT_ENTITY = {
  employees: 'Employees', employee: 'Employees', attendance: 'Attendance', leaves: 'Leave',
  leave: 'Leave', users: 'Users', user: 'Users', notifications: 'Notifications', auth: 'Account',
};
const AUDIT_VERB = {
  create: 'Created', created: 'Created', update: 'Updated', updated: 'Updated',
  delete: 'Deleted', manual: 'Manual entry', review: 'Reviewed', broadcast: 'Announcement',
  'punch-in': 'Punch in', 'punch-out': 'Punch out', 'reset-password': 'Reset password',
};
const auditLabel = (action) => {
  const [entity, verb] = String(action || '').split('.');
  const left = AUDIT_ENTITY[entity] ? t(AUDIT_ENTITY[entity]) : titleCase(entity);
  const right = AUDIT_VERB[verb] ? t(AUDIT_VERB[verb]) : titleCase(verb || '');
  return [left, right].filter(Boolean).join(' · ');
};

export const meta = { key: 'dashboard', title: 'Dashboard', subtitle: 'Today at a glance' };

export async function render(root, context) {
  root.innerHTML = loadingRows(5);
  let data;
  try { data = await api.dashboard(); } catch (error) { root.innerHTML = emptyState(t('Could not load the dashboard'), error.message); return; }

  const { user } = context;
  const counts = data.todayCounts;

  const quickLinks = [
    { route: 'attendance', label: t('Attendance'), hint: t('View history'), iconName: 'attendance', tone: 'blue', perm: 'attendance.view' },
    { route: 'leave', label: t('Apply leave'), hint: t('Request time off'), iconName: 'leave', tone: 'green', perm: 'leave.view' },
    { route: 'employees', label: t('My team'), hint: t('Team overview'), iconName: 'employees', tone: 'violet', perm: 'employees.view' },
    { route: 'reports', label: t('Reports'), hint: t('Insights & stats'), iconName: 'reports', tone: 'amber', perm: 'reports.view' },
  ].filter((link) => can(user.role, link.perm));

  root.innerHTML = `
    ${punchCard(data, user)}
    ${counts ? teamCounters(counts, data.trend, data.pendingLeaves) : myCounters(data)}
    <section class="card">
      <div class="card__head"><h3>${esc(t('Your workspace'))}</h3></div>
      <div class="quick">${quickLinks.map((link) => `
        <a href="#/${link.route}">
          <span class="quick__icon tone-${link.tone}">${icon(link.iconName)}</span>
          <strong>${esc(link.label)}</strong>
          <small>${esc(link.hint)}</small>
        </a>`).join('')}
      </div>
    </section>
    <div class="grid grid--2">
      ${data.trend ? trendCard(data.trend) : leaveBalanceCard(data.myBalance)}
      ${data.departments ? departmentCard(data.departments) : myTodayCard(data)}
    </div>
    ${data.recentActivity?.length ? activityCard(data.recentActivity) : ''}`;

  wirePunch(root, context);
}

function punchCard(data, user) {
  const name = user.name.split(' ')[0];
  const dateLine = formatDate(data.today, { weekday: 'long', day: 'numeric', month: 'long' });

  if (!data.employee) {
    return `<section class="card punch">
      <div class="punch__info">
        <p class="muted small">${icon('attendance', 14)} ${esc(dateLine)}</p>
        <h2>${esc(greeting())}, ${esc(name)} 🙏</h2>
        <p class="muted">Your account is not linked to an employee profile yet, so punching is disabled. You can still manage the team below.</p>
      </div>
    </section>`;
  }

  const record = data.myAttendance;
  const state = !record?.punch_in_at ? 'in' : (!record.punch_out_at ? 'out' : 'done');
  const headline = { in: t('Ready to punch in'), out: t('You are punched in'), done: t('Day complete') }[state];
  const sub = { in: "Let's make it a productive day!", out: 'Remember to punch out before you leave.', done: 'Thanks for the good work today.' }[state];

  return `<section class="card punch">
    <div class="punch__info">
      <p class="muted small">${icon('attendance', 14)} ${esc(dateLine)}</p>
      <h2>${esc(headline)}</h2>
      <p class="muted">${esc(sub)}</p>
      <div class="punch__badges">
        <span class="pill pill--ok">${icon('pin', 13)} GPS verified</span>
        <span class="pill pill--info">${icon('employees', 13)} Selfie optional</span>
        ${record?.status ? statusPill(record.status) : ''}
      </div>
      <div class="punch__times">
        <div><small>${esc(t('Punch in'))}</small><strong>${esc(formatTime(record?.punch_in_at))}</strong></div>
        <div><small>${esc(t('Punch out'))}</small><strong>${esc(formatTime(record?.punch_out_at))}</strong></div>
      </div>
    </div>
    <div class="punch__action">
      <button class="punch__btn" data-punch="${state}" ${state === 'done' ? 'disabled' : ''}>
        ${icon('finger', 42)}
        <span>${esc(state === 'in' ? t('Punch in') : state === 'out' ? t('Punch out') : t('All done'))}</span>
      </button>
      <small class="muted">${state === 'done' ? 'See you tomorrow' : 'Tap to record'}</small>
    </div>
  </section>`;
}

/** Present / Leave / Late counters with a week-on-week delta, as in the approved design. */
function teamCounters(counts, trend = [], pendingLeaves) {
  const week = trend.slice(-7);
  const previous = trend.slice(-14, -7);
  const sum = (rows, key) => rows.reduce((total, row) => total + (row[key] ?? 0), 0);
  const presentDelta = sum(week, 'present') - sum(previous, 'present');
  const absentDelta = sum(week, 'absent') - sum(previous, 'absent');

  const tiles = [
    { label: t('Present'), value: counts.present + counts.half_day, tone: 'green', iconName: 'employees', delta: presentDelta, deltaLabel: 'this week' },
    { label: t('Leave'), value: pendingLeaves ?? counts.notMarked, tone: 'amber', iconName: 'leave', delta: null, deltaLabel: pendingLeaves === undefined ? 'not marked yet' : 'awaiting approval' },
    { label: t('Late'), value: counts.late, tone: 'red', iconName: 'clock', delta: absentDelta, deltaLabel: 'absences this week' },
  ];

  return `<section class="card card--flat" style="background:#eff4fb;border-color:#e2ebf7">
    <div class="hero__tiles" style="margin:0">
      ${tiles.map((tile) => `<article class="hero__tile">
        <div class="row" style="gap:9px;flex-wrap:nowrap">
          <span class="stat__icon tone-${tile.tone}">${icon(tile.iconName)}</span>
          <small style="margin:0">${esc(tile.label)}</small>
        </div>
        <strong style="color:${tile.tone === 'green' ? '#16a34a' : tile.tone === 'amber' ? 'var(--amber)' : 'var(--red)'}">${String(tile.value ?? 0).padStart(2, '0')}</strong>
        <span class="hero__delta muted">
          ${tile.delta === null ? '' : icon(tile.delta >= 0 ? 'trendUp' : 'trendDown', 14)}
          ${tile.delta === null ? '' : `<b style="color:${tile.delta >= 0 ? '#16a34a' : 'var(--red)'}">${tile.delta >= 0 ? '+' : ''}${tile.delta}</b>`}
          ${esc(tile.deltaLabel)}
        </span>
      </article>`).join('')}
    </div>
  </section>`;
}

function myCounters(data) {
  const balance = data.myBalance;
  if (!balance) return '';
  const tiles = [
    [t('Casual leave'), balance.casual, 'blue', 'umbrella'],
    [t('Sick leave'), balance.sick, 'green', 'heart'],
    [t('Earned leave'), balance.earned, 'violet', 'attendance'],
  ];
  return `<section class="hero">
    <div class="hero__label">${esc(t('Leave balance'))}</div>
    <h3 style="margin-top:2px">${esc(t('Track your available leave'))}</h3>
    <div class="hero__tiles">
      ${tiles.map(([label, value, tone, glyph]) => `<article class="hero__tile">
        <span class="stat__icon tone-${tone}">${icon(glyph)}</span>
        <small>${label}</small>
        <strong>${esc(value ?? 0)}<span>${esc(t('days'))}</span></strong>
      </article>`).join('')}
    </div>
  </section>`;
}

function trendCard(trend) {
  if (!trend.length) return `<section class="card">${emptyState(t('No attendance recorded yet'), t('Punches will appear here once the team starts marking attendance.'))}</section>`;
  const peak = Math.max(...trend.map((day) => day.present + day.absent), 1);
  return `<section class="card">
    <div class="card__head">
      <h3>${esc(t('Last {n} days', { n: trend.length }))}</h3>
      <div class="legend spacer"><span><i style="background:var(--blue)"></i>${esc(t('Present'))}</span><span><i style="background:#fca5a5"></i>${esc(t('Absent'))}</span></div>
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
  if (!departments.length) return `<section class="card">${emptyState(t('No departments yet'), t('Add employees with a department to see this split.'))}</section>`;
  return `<section class="card">
    <div class="card__head"><h3>${esc(t('Department attendance'))}</h3><span class="muted small spacer">${esc(t('Today'))}</span></div>
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
  if (!balance) return `<section class="card">${emptyState(t('No leave balance yet'), 'HR will set your opening balance.')}</section>`;
  const rows = [[t('Casual'), balance.casual, 7], [t('Sick'), balance.sick, 5], [t('Earned'), balance.earned, 12]];
  return `<section class="card">
    <div class="card__head"><h3>${esc(t('Leave balance'))}</h3><a class="small spacer" href="#/leave">${esc(t('Apply'))}</a></div>
    <div class="stack">${rows.map(([label, value, total]) => `
      <div>
        <div class="row" style="justify-content:space-between">
          <strong class="small">${label}</strong><span class="muted small">${esc(t('{value} of {total} days', { value, total }))}</span>
        </div>
        <div class="progress" style="margin-top:6px"><span style="width:${Math.min((value / total) * 100, 100)}%"></span></div>
      </div>`).join('')}
    </div>
  </section>`;
}

function myTodayCard(data) {
  return `<section class="card">
    <div class="card__head"><h3>${esc(t('Today'))}</h3><a class="small spacer" href="#/attendance">${esc(t('History'))}</a></div>
    <div class="row">
      ${avatar(data.employee?.name || t('HRMate'), data.employee?.photo_url, 'avatar--lg')}
      <div>
        <strong>${esc(data.employee?.name || '—')}</strong>
        <div class="muted small">${esc(data.employee?.role_title || t('Employee'))} · ${esc(data.employee?.department || t('Unassigned'))}</div>
        <div style="margin-top:8px">${statusPill(data.myAttendance?.status || 'absent')}</div>
      </div>
    </div>
  </section>`;
}

const activityCard = (items) => `<section class="card">
  <div class="card__head"><h3>${esc(t('Recent activity'))}</h3><span class="pill pill--info spacer">${esc(t('Audit log'))}</span></div>
  <div class="timeline">${items.map((item) => `
    <div class="timeline__item">
      <span class="timeline__dot"></span>
      <div>
        <strong class="small">${esc(auditLabel(item.action))}</strong>
        <small> · ${esc(item.actor || t('System'))} · ${esc(relativeTime(item.created_at))}</small>
      </div>
    </div>`).join('')}
  </div>
</section>`;

function wirePunch(root, context) {
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
