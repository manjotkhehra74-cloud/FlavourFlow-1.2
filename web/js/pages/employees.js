import { api } from '../api.js';
import { can } from '../rbac.js';
import {
  avatar, emptyState, esc, formatDate, formatTime, icon, loadingRows, modal, qs,
  statusPill, toast,
} from '../ui.js';

export const meta = { key: 'employees', title: 'Employees', subtitle: 'Team directory and profiles' };

export async function render(root, context) {
  const { user } = context;
  const canManage = can(user.role, 'employees.manage');
  const state = { search: '', department: '', employees: [] };

  root.innerHTML = `<section class="card">
    <div class="card__head">
      <h3>Employee directory</h3>
      <div class="row spacer">
        <select data-department style="padding:9px 11px;border-radius:11px;border:1px solid var(--line)"><option value="">All departments</option></select>
        ${canManage ? `<button class="btn btn--sm" data-add>${icon('plus', 15)} Add employee</button>` : ''}
      </div>
    </div>
    <div class="field" style="margin-bottom:12px"><input type="search" data-search placeholder="Search by name, code, phone or role…" /></div>
    <div data-body>${loadingRows()}</div>
  </section>`;

  const body = qs('[data-body]', root);
  qs('[data-search]', root).addEventListener('input', (event) => { state.search = event.target.value.toLowerCase(); paint(); });
  qs('[data-department]', root).addEventListener('change', (event) => { state.department = event.target.value; paint(); });
  qs('[data-add]', root)?.addEventListener('click', () => employeeForm(null, load));

  await load();

  async function load() {
    body.innerHTML = loadingRows();
    try {
      state.employees = (await api.employees()).employees;
      const departments = [...new Set(state.employees.map((employee) => employee.department).filter(Boolean))].sort();
      qs('[data-department]', root).innerHTML = `<option value="">All departments</option>${departments.map((name) => `<option>${esc(name)}</option>`).join('')}`;
      paint();
    } catch (error) { body.innerHTML = emptyState('Could not load employees', error.message); }
  }

  function paint() {
    const filtered = state.employees.filter((employee) => {
      const haystack = `${employee.name} ${employee.employee_code || ''} ${employee.phone || ''} ${employee.role_title || ''}`.toLowerCase();
      return haystack.includes(state.search) && (!state.department || employee.department === state.department);
    });
    if (!filtered.length) { body.innerHTML = emptyState('No employees found', 'Try a different search or add a new employee.'); return; }
    body.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Employee</th><th>Department</th><th>Shift</th><th>Phone</th><th>Joined</th>${canManage ? '<th></th>' : ''}</tr></thead>
      <tbody>${filtered.map((employee) => `<tr class="clickable" data-open="${employee.id}">
        <td><div class="cell-user">${avatar(employee.name, employee.photo_url)}<div><strong>${esc(employee.name)}</strong><small>${esc(employee.role_title || 'Employee')}${employee.employee_code ? ` · ${esc(employee.employee_code)}` : ''}</small></div></div></td>
        <td>${esc(employee.department || '—')}</td>
        <td>${esc(employee.shift_name || '—')}</td>
        <td>${esc(employee.phone || '—')}</td>
        <td>${esc(formatDate(employee.join_date))}</td>
        ${canManage ? `<td><button class="btn btn--sm btn--ghost" data-edit="${employee.id}">Edit</button></td>` : ''}
      </tr>`).join('')}</tbody></table></div>`;

    body.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', (event) => {
      event.stopPropagation();
      employeeForm(state.employees.find((employee) => employee.id === Number(button.dataset.edit)), load);
    }));
    body.querySelectorAll('[data-open]').forEach((row) => row.addEventListener('click', () => openProfile(row.dataset.open)));
  }
}

async function openProfile(id) {
  let data;
  try { data = await api.employee(id); } catch (error) { toast(error.message, 'err'); return; }
  const { employee, attendance, balance } = data;
  await modal({
    title: employee.name,
    submitLabel: 'Close',
    body: `<div class="row" style="gap:14px;margin-bottom:6px">
        ${avatar(employee.name, employee.photo_url, 'avatar--lg')}
        <div>
          <strong>${esc(employee.role_title || 'Employee')}</strong>
          <div class="muted small">${esc(employee.department || 'Unassigned')} · ${esc(employee.shift_name || 'No shift')}</div>
          <div class="muted small">${esc(employee.phone || 'No phone')} · Joined ${esc(formatDate(employee.join_date))}</div>
        </div>
      </div>
      ${balance ? `<div class="row">
        <span class="pill pill--info">Casual ${balance.casual}</span>
        <span class="pill pill--pending">Sick ${balance.sick}</span>
        <span class="pill pill--ok">Earned ${balance.earned}</span>
      </div>` : ''}
      <h4 style="margin-top:6px">Recent attendance</h4>
      ${attendance.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Status</th><th>In</th><th>Out</th></tr></thead>
        <tbody>${attendance.slice(0, 12).map((record) => `<tr>
          <td>${esc(formatDate(record.attendance_date, { day: '2-digit', month: 'short' }))}</td>
          <td>${statusPill(record.status)}</td>
          <td>${esc(formatTime(record.punch_in_at))}</td>
          <td>${esc(formatTime(record.punch_out_at))}</td>
        </tr>`).join('')}</tbody></table></div>` : '<p class="muted small">No attendance recorded yet.</p>'}`,
  });
}

async function employeeForm(employee, onDone) {
  const editing = Boolean(employee);
  let users = [];
  if (!editing) { try { users = (await api.users()).users; } catch { users = []; } }
  const value = (key) => esc(employee?.[key] ?? '');
  const result = await modal({
    title: editing ? `Edit ${employee.name}` : 'Add employee',
    submitLabel: editing ? 'Save changes' : 'Add employee',
    body: `<div class="form-grid">
      <div class="field"><label>Full name</label><input name="name" value="${value('name')}" required /></div>
      <div class="field"><label>Employee code</label><input name="employeeCode" value="${value('employee_code')}" placeholder="GDF-001" /></div>
      <div class="field"><label>Phone</label><input name="phone" value="${value('phone')}" placeholder="+91XXXXXXXXXX" /></div>
      <div class="field"><label>Designation</label><input name="roleTitle" value="${value('role_title')}" placeholder="Line operator" /></div>
      <div class="field"><label>Department</label><input name="department" value="${value('department')}" placeholder="Production" /></div>
      <div class="field"><label>Shift</label><input name="shiftName" value="${value('shift_name')}" placeholder="General 9-6" /></div>
      <div class="field"><label>Joining date</label><input type="date" name="joinDate" value="${value('join_date')}" /></div>
      ${!editing && users.length ? `<div class="field"><label>Link login account</label><select name="userId">
        <option value="">Not linked</option>
        ${users.map((account) => `<option value="${account.id}">${esc(account.name)} · ${esc(account.phone || '')}</option>`).join('')}
      </select><span class="field__hint">Needed for app punch-in</span></div>` : ''}
    </div>`,
  });
  if (!result) return;
  const payload = { ...result, userId: result.userId ? Number(result.userId) : undefined };
  Object.keys(payload).forEach((key) => { if (payload[key] === '') payload[key] = null; });
  try {
    if (editing) await api.updateEmployee(employee.id, payload);
    else await api.createEmployee(payload);
    toast(editing ? 'Employee updated' : 'Employee added', 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
