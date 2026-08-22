import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  avatar, emptyState, esc, formatDate, formatTime, icon, loadingRows,
  modal, monthIso, qs, statusPill, toast, todayIso,
} from '../ui.js';

export const meta = { key: 'attendance', title: 'Attendance', subtitle: 'Punches, register and manual entries' };

export async function render(root, context) {
  const { user } = context;
  const canManage = can(user.role, 'attendance.manage');
  const state = { month: monthIso(), search: '', tab: canManage || can(user.role, 'employees.view') ? 'register' : 'mine' };

  root.innerHTML = `
    <section class="card">
      <div class="card__head">
        <h3>Attendance</h3>
        <div class="row spacer">
          <div class="row" style="gap:6px">
            <button class="btn btn--sm ${state.tab === 'register' ? '' : 'btn--ghost'}" data-tab="register">Register</button>
            <button class="btn btn--sm ${state.tab === 'mine' ? '' : 'btn--ghost'}" data-tab="mine">My attendance</button>
          </div>
          <input type="month" value="${state.month}" data-month style="padding:8px 11px;border-radius:11px;border:1px solid var(--line)" />
          ${canManage ? `<button class="btn btn--sm" data-manual>${icon('plus', 15)} Manual entry</button>` : ''}
        </div>
      </div>
      <div class="row" style="margin-bottom:12px">
        <div class="field" style="flex:1 1 240px">
          <input type="search" placeholder="Search employee or department…" data-search />
        </div>
      </div>
      <div data-body>${loadingRows()}</div>
    </section>`;

  const body = qs('[data-body]', root);

  qs('[data-month]', root).addEventListener('change', (event) => { state.month = event.target.value || monthIso(); load(); });
  qs('[data-search]', root).addEventListener('input', (event) => { state.search = event.target.value.toLowerCase(); paint(); });
  root.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => {
    state.tab = button.dataset.tab;
    root.querySelectorAll('[data-tab]').forEach((other) => other.classList.toggle('btn--ghost', other.dataset.tab !== state.tab));
    load();
  }));
  qs('[data-manual]', root)?.addEventListener('click', () => manualEntry(load));

  let rows = [];
  await load();

  async function load() {
    body.innerHTML = loadingRows();
    try {
      if (state.tab === 'register') {
        const data = await api.attendanceRegister(state.month);
        rows = data.records;
      } else {
        const data = await api.attendanceMe();
        rows = data.records.map((record) => ({ ...record, name: data.employee?.name, employee_code: data.employee?.employee_code, department: data.employee?.department }));
      }
      paint();
    } catch (error) { body.innerHTML = emptyState('Could not load attendance', error.message); }
  }

  function paint() {
    const filtered = rows.filter((row) => !state.search
      || `${row.name || ''} ${row.employee_code || ''} ${row.department || ''}`.toLowerCase().includes(state.search));
    if (!filtered.length) {
      body.innerHTML = emptyState('No attendance records', `Nothing recorded for ${formatDate(`${state.month}-01`, { month: 'long', year: 'numeric' })}.`);
      return;
    }
    body.innerHTML = `<div class="table-wrap"><table>
      <thead><tr>
        <th>Employee</th><th>Date</th><th>Status</th><th>Punch in</th><th>Punch out</th><th>Source</th>
      </tr></thead>
      <tbody>${filtered.map((row) => `<tr>
        <td><div class="cell-user">${avatar(row.name || 'Employee', null)}<div><strong>${esc(row.name || '—')}</strong><small>${esc(row.employee_code || row.department || '')}</small></div></div></td>
        <td>${esc(formatDate(row.attendance_date, { day: '2-digit', month: 'short' }))}</td>
        <td>${statusPill(row.status)}</td>
        <td>${esc(formatTime(row.punch_in_at))}</td>
        <td>${esc(formatTime(row.punch_out_at))}</td>
        <td><span class="pill">${esc(row.entry_source || 'mobile')}</span></td>
      </tr>`).join('')}</tbody>
    </table></div>`;
  }
}

export async function manualEntry(onDone) {
  let employees = [];
  try { employees = (await api.employees()).employees; } catch { toast('Could not load employees', 'err'); return; }
  const result = await modal({
    title: 'Manual attendance entry',
    submitLabel: 'Save entry',
    body: `<div class="form-grid">
      <div class="field"><label>Employee</label><select name="employeeId" required>
        ${employees.map((employee) => `<option value="${employee.id}">${esc(employee.name)}${employee.employee_code ? ` · ${esc(employee.employee_code)}` : ''}</option>`).join('')}
      </select></div>
      <div class="field"><label>Date</label><input type="date" name="attendanceDate" value="${todayIso()}" max="${todayIso()}" required /></div>
      <div class="field"><label>Status</label><select name="status">
        <option value="present">Present</option><option value="late">Late</option>
        <option value="half_day">Half day</option><option value="absent">Absent</option>
      </select></div>
      <div class="field"><label>Punch in</label><input type="time" name="punchIn" /></div>
      <div class="field"><label>Punch out</label><input type="time" name="punchOut" /></div>
    </div>
    <div class="field"><label>Reason</label><textarea name="reason" placeholder="Why is this entry being added manually?"></textarea></div>`,
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
