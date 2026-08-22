import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  avatar, currentPosition, emptyState, esc, formatDate, formatTime, icon, loadingRows,
  modal, monthIso, qs, shiftDays, shiftMonth, statusPill, toast, todayIso, weekOf,
} from '../ui.js';

export const meta = { key: 'attendance', title: 'Attendance', subtitle: 'Punches, register and manual entries' };

export async function render(root, context) {
  const { user } = context;
  const canManage = can(user.role, 'attendance.manage');
  const state = {
    tab: 'mine',
    selected: todayIso(),
    month: monthIso(),
    registerMonth: monthIso(),
    search: '',
    mine: null,
    register: [],
  };

  root.innerHTML = `
    <section class="card" style="padding-bottom:14px">
      <div class="segmented" style="max-width:420px">
        <button data-tab="mine" class="is-active">${icon('finger', 16)} My attendance</button>
        <button data-tab="register">${icon('employees', 16)} Team register</button>
      </div>
    </section>
    <div data-panel>${loadingRows(4)}</div>`;

  const panel = qs('[data-panel]', root);
  root.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    state.tab = button.dataset.tab;
    root.querySelectorAll('[data-tab]').forEach((other) => other.classList.toggle('is-active', other.dataset.tab === state.tab));
    load();
  }));

  await load();

  async function load() {
    panel.innerHTML = loadingRows(4);
    try {
      if (state.tab === 'mine') { state.mine = await api.attendanceMe(state.month); paintMine(); }
      else { state.register = (await api.attendanceRegister(state.registerMonth)).records; paintRegister(); }
    } catch (error) { panel.innerHTML = emptyState('Could not load attendance', error.message); }
  }

  /* ---------------- my attendance ---------------- */

  function paintMine() {
    const data = state.mine;
    if (!data.employee) {
      panel.innerHTML = `<section class="card">${emptyState('No employee profile linked', 'Ask HR to link your login to an employee record, then punching will appear here.')}</section>`;
      return;
    }

    const byDate = new Map(data.records.map((record) => [record.attendance_date, record]));
    const days = weekOf(state.selected);
    const record = byDate.get(state.selected) ?? null;
    const isToday = state.selected === todayIso();
    const state_ = !record?.punch_in_at ? 'in' : (!record.punch_out_at ? 'out' : 'done');
    const summary = data.summary ?? { present: 0, late: 0, half_day: 0, absent: 0 };

    panel.innerHTML = `
      <section class="card">
        <div class="week">
          <button class="week__nav" data-week="-7" title="Previous week">${icon('arrowLeft', 16)}</button>
          ${days.map((day) => {
            const dayRecord = byDate.get(day);
            const future = day > todayIso();
            return `<button class="week__day ${day === state.selected ? 'is-selected' : ''} ${future ? 'is-future' : ''}"
              data-day="${day}" ${dayRecord ? `data-status="${dayRecord.status}"` : ''} ${future ? 'disabled' : ''}>
              <small>${esc(new Date(`${day}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }).slice(0, 3).toUpperCase())}</small>
              <strong>${esc(day.slice(8))}</strong>
              <i></i>
            </button>`;
          }).join('')}
          <button class="week__nav" data-week="7" title="Next week">${icon('arrowRight', 16)}</button>
        </div>
        <p class="week__title muted small" style="margin-top:10px">${esc(formatDate(days[0], { day: 'numeric', month: 'short' }))} – ${esc(formatDate(days[6], { day: 'numeric', month: 'short', year: 'numeric' }))}</p>
      </section>

      <section class="card">
        <div class="punchline">
          <div class="punchline__row ${record?.punch_in_at ? 'is-done' : ''}">
            <span class="punchline__icon ${record?.punch_in_at ? 'tone-green' : 'tone-blue'}">${icon('signIn', 21)}</span>
            <div><small>${record?.punch_in_at ? 'Punched in' : 'Punch in'}</small><strong>${esc(formatTime(record?.punch_in_at))}</strong></div>
          </div>
          <div class="punchline__link"><span><i></i></span></div>
          <div class="punchline__row ${record?.punch_out_at ? 'is-done' : ''}">
            <span class="punchline__icon ${record?.punch_out_at ? 'tone-green' : 'tone-blue'}" style="${record?.punch_out_at ? '' : 'background:#f1f5f9;color:var(--muted)'}">${icon('signOut', 21)}</span>
            <div><small>${record?.punch_out_at ? 'Punched out' : 'Punch out'}</small><strong>${esc(formatTime(record?.punch_out_at))}</strong></div>
          </div>
        </div>

        <div class="punchline__meta">
          <span class="stat__icon tone-blue">${icon('pin')}</span>
          <div style="flex:1">
            <strong class="small" style="color:${record?.in_latitude ? '#16a34a' : 'var(--muted)'}">${record?.in_latitude ? 'GPS verified' : 'No GPS recorded'}</strong>
            <div class="muted small">${record?.in_latitude ? `${record.in_latitude.toFixed(4)}, ${record.in_longitude?.toFixed(4)}` : 'Location is captured at punch-in'}</div>
          </div>
          ${record?.in_selfie_url
            ? `<span class="punchline__selfie"><img src="${esc(record.in_selfie_url)}" alt="Punch-in selfie" /><b>${icon('check', 11)}</b></span>`
            : `<span class="punchline__selfie" title="No selfie">${avatar(data.employee.name, data.employee.photo_url)}</span>`}
        </div>

        ${isToday ? `<button class="btn btn--lg btn--block btn--gradient" style="margin-top:16px" data-punch="${state_}" ${state_ === 'done' ? 'disabled' : ''}>
            ${icon('finger', 20)} ${state_ === 'in' ? 'Punch In' : state_ === 'out' ? 'Punch Out' : 'Day complete'}
          </button>`
          : `<div class="row" style="margin-top:16px;justify-content:space-between">
              <span class="muted small">${esc(formatDate(state.selected, { weekday: 'long', day: 'numeric', month: 'long' }))}</span>
              ${statusPill(record?.status || 'absent')}
            </div>`}
      </section>

      <section class="card">
        <div class="card__head">
          <h3>This month</h3>
          <div class="row spacer" style="gap:6px">
            <button class="week__nav" data-month="-1">${icon('arrowLeft', 16)}</button>
            <span class="small" style="font-weight:600;min-width:96px;text-align:center">${esc(formatDate(`${state.month}-01`, { month: 'long', year: 'numeric' }))}</span>
            <button class="week__nav" data-month="1" ${state.month >= monthIso() ? 'disabled' : ''}>${icon('arrowRight', 16)}</button>
          </div>
        </div>
        <div class="summary">
          <div><strong class="t-green">${summary.present}</strong><small>Present</small></div>
          <div><strong class="t-amber">${summary.late}</strong><small>Late</small></div>
          <div><strong class="t-blue">${summary.half_day}</strong><small>Half day</small></div>
          <div><strong class="t-grey">${summary.absent}</strong><small>Absent</small></div>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h3>History</h3><span class="muted small spacer">${data.records.length} entries</span></div>
        ${data.records.length ? `<div class="table-wrap"><table>
          <thead><tr><th>Date</th><th>Status</th><th>Punch in</th><th>Punch out</th><th>Source</th></tr></thead>
          <tbody>${data.records.map((row) => `<tr class="clickable" data-day="${row.attendance_date}">
            <td>${esc(formatDate(row.attendance_date, { weekday: 'short', day: '2-digit', month: 'short' }))}</td>
            <td>${statusPill(row.status)}</td>
            <td>${esc(formatTime(row.punch_in_at))}</td>
            <td>${esc(formatTime(row.punch_out_at))}</td>
            <td><span class="pill">${esc(row.entry_source || 'mobile')}</span></td>
          </tr>`).join('')}</tbody></table></div>`
          : emptyState('Nothing this month', 'Punches will show up here as soon as they are recorded.')}
      </section>`;

    panel.querySelectorAll('[data-day]').forEach((node) => node.addEventListener('click', () => {
      state.selected = node.dataset.day;
      if (state.selected.slice(0, 7) !== state.month) { state.month = state.selected.slice(0, 7); load(); return; }
      paintMine();
    }));
    panel.querySelectorAll('[data-week]').forEach((node) => node.addEventListener('click', () => {
      state.selected = shiftDays(state.selected, Number(node.dataset.week));
      if (state.selected.slice(0, 7) !== state.month) { state.month = state.selected.slice(0, 7); load(); return; }
      paintMine();
    }));
    panel.querySelectorAll('[data-month]').forEach((node) => node.addEventListener('click', () => {
      state.month = shiftMonth(state.month, Number(node.dataset.month));
      state.selected = state.month === monthIso() ? todayIso() : `${state.month}-01`;
      load();
    }));
    qs('[data-punch]', panel)?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const mode = button.dataset.punch;
      if (mode === 'done') return;
      button.disabled = true;
      try {
        const position = await currentPosition();
        if (mode === 'in') await api.punchIn(position || {});
        else await api.punchOut(position || {});
        toast(mode === 'in' ? 'Punched in. Have a great shift!' : 'Punched out. Well done!', 'ok');
        await load();
      } catch (error) { toast(error.message, 'err'); button.disabled = false; }
    });
  }

  /* ---------------- team register ---------------- */

  function paintRegister() {
    const filtered = state.register.filter((row) => !state.search
      || `${row.name || ''} ${row.employee_code || ''} ${row.department || ''}`.toLowerCase().includes(state.search));

    panel.innerHTML = `<section class="card">
      <div class="card__head">
        <h3>Team register</h3>
        <div class="row spacer">
          <input type="month" value="${state.registerMonth}" data-register-month style="padding:8px 11px;border-radius:11px;border:1px solid var(--line)" />
          ${canManage ? `<button class="btn btn--sm" data-manual>${icon('plus', 15)} Manual entry</button>` : ''}
        </div>
      </div>
      <div class="field" style="margin-bottom:12px"><input type="search" data-search value="${esc(state.search)}" placeholder="Search employee or department…" /></div>
      ${filtered.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Employee</th><th>Date</th><th>Status</th><th>Punch in</th><th>Punch out</th><th>Source</th></tr></thead>
        <tbody>${filtered.map((row) => `<tr>
          <td><div class="cell-user">${avatar(row.name || 'Employee', null)}<div><strong>${esc(row.name || '—')}</strong><small>${esc(row.employee_code || row.department || '')}</small></div></div></td>
          <td>${esc(formatDate(row.attendance_date, { day: '2-digit', month: 'short' }))}</td>
          <td>${statusPill(row.status)}</td>
          <td>${esc(formatTime(row.punch_in_at))}</td>
          <td>${esc(formatTime(row.punch_out_at))}</td>
          <td><span class="pill">${esc(row.entry_source || 'mobile')}</span></td>
        </tr>`).join('')}</tbody></table></div>`
        : emptyState('No attendance records', `Nothing recorded for ${formatDate(`${state.registerMonth}-01`, { month: 'long', year: 'numeric' })}.`)}
    </section>`;

    qs('[data-register-month]', panel).addEventListener('change', (event) => { state.registerMonth = event.target.value || monthIso(); load(); });
    const search = qs('[data-search]', panel);
    search.addEventListener('input', (event) => {
      state.search = event.target.value.toLowerCase();
      const caret = event.target.selectionStart;
      paintRegister();
      const next = qs('[data-search]', panel);
      next.focus();
      next.setSelectionRange(caret, caret);
    });
    qs('[data-manual]', panel)?.addEventListener('click', () => manualEntry(load));
  }
}

export async function manualEntry(onDone, preselectId) {
  let employees = [];
  try { employees = (await api.employees()).employees; } catch { toast('Could not load employees', 'err'); return; }
  const result = await modal({
    title: 'Manual attendance',
    submitLabel: 'Save attendance',
    tone: 'btn--gradient',
    body: `<p class="muted small" style="margin-top:-6px">Mark or correct employee attendance.</p>
    <div class="form-grid">
      <div class="field"><label>Employee</label><select name="employeeId" required>
        ${employees.map((employee) => `<option value="${employee.id}" ${Number(preselectId) === employee.id ? 'selected' : ''}>${esc(employee.name)}${employee.employee_code ? ` · ${esc(employee.employee_code)}` : ''}</option>`).join('')}
      </select></div>
      <div class="field"><label>Date</label><input type="date" name="attendanceDate" value="${todayIso()}" max="${todayIso()}" required /></div>
      <div class="field"><label>Status</label><select name="status">
        <option value="present">Present</option><option value="late">Late</option>
        <option value="half_day">Half day</option><option value="absent">Absent</option>
      </select></div>
      <div class="field"><label>In time</label><input type="time" name="punchIn" /></div>
      <div class="field"><label>Out time</label><input type="time" name="punchOut" /></div>
    </div>
    <div class="field"><label>Reason</label><textarea name="reason" placeholder="Supervisor correction"></textarea></div>
    <p class="muted small">${icon('shield', 13)} This entry will be recorded in audit history.</p>`,
  });
  if (!result) return;
  const stamp = (time) => (time ? new Date(`${result.attendanceDate}T${time}:00+05:30`).toISOString() : null);
  try {
    await api.manualAttendance({
      employeeId: Number(result.employeeId),
      attendanceDate: result.attendanceDate,
      status: result.status,
      punchInAt: stamp(result.punchIn),
      punchOutAt: stamp(result.punchOut),
      reason: result.reason || null,
    });
    toast('Attendance saved', 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
