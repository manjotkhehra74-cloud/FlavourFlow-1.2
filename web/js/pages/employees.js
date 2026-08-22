import { api } from '../api.js';
import { can } from '../rbac.js';
import { avatar, emptyState, esc, icon, loadingRows, modal, qs, toast } from '../ui.js';

export const meta = { key: 'employees', title: 'Employees', subtitle: 'Team directory and profiles' };

const TODAY_TONE = {
  present: { label: 'Present', colour: '#16a34a' },
  late: { label: 'Late', colour: 'var(--amber)' },
  half_day: { label: 'Half day', colour: 'var(--amber)' },
  absent: { label: 'Absent', colour: 'var(--red)' },
  leave: { label: 'On leave', colour: 'var(--amber)' },
  none: { label: 'Not marked', colour: 'var(--muted)' },
};

export async function render(root, context) {
  const { user } = context;
  const canManage = can(user.role, 'employees.manage');
  const state = { search: '', department: 'All', employees: [] };

  root.innerHTML = `<section class="card">
    <div class="card__head">
      <h3>Employees</h3>
      ${canManage ? `<button class="btn btn--sm btn--gradient spacer" data-add>${icon('plus', 15)} Add employee</button>` : ''}
    </div>
    <div class="field"><input type="search" data-search placeholder="Search name, department…" /></div>
    <div class="chips" data-chips style="margin-top:12px"></div>
  </section>
  <div data-body>${loadingRows(4)}</div>`;

  const body = qs('[data-body]', root);
  qs('[data-search]', root).addEventListener('input', (event) => { state.search = event.target.value.toLowerCase(); paint(); });
  qs('[data-add]', root)?.addEventListener('click', () => employeeForm(null, load));

  await load();

  async function load() {
    body.innerHTML = loadingRows(4);
    try {
      state.employees = (await api.employees()).employees;
      const departments = ['All', ...new Set(state.employees.map((employee) => employee.department).filter(Boolean))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
      const chips = qs('[data-chips]', root);
      chips.innerHTML = departments.map((name) => `<button class="chip ${name === state.department ? 'is-active' : ''}" data-chip="${esc(name)}">${esc(name)}</button>`).join('');
      chips.querySelectorAll('[data-chip]').forEach((chip) => chip.addEventListener('click', () => {
        state.department = chip.dataset.chip;
        chips.querySelectorAll('[data-chip]').forEach((other) => other.classList.toggle('is-active', other.dataset.chip === state.department));
        paint();
      }));
      paint();
    } catch (error) { body.innerHTML = emptyState('Could not load employees', error.message); }
  }

  function paint() {
    const filtered = state.employees.filter((employee) => {
      const haystack = `${employee.name} ${employee.employee_code || ''} ${employee.phone || ''} ${employee.role_title || ''} ${employee.department || ''}`.toLowerCase();
      return haystack.includes(state.search) && (state.department === 'All' || employee.department === state.department);
    });
    if (!filtered.length) { body.innerHTML = `<section class="card">${emptyState('No employees found', 'Try a different search or add a new employee.')}</section>`; return; }

    body.innerHTML = `<div class="stack">${filtered.map((employee) => {
      const key = employee.on_leave ? 'leave' : (employee.today_status || 'none');
      const status = TODAY_TONE[key] ?? TODAY_TONE.none;
      return `<article class="list-card clickable" data-open="${employee.id}" style="cursor:pointer">
        <div class="list-card__top">
          ${avatar(employee.name, employee.photo_url)}
          <div class="list-card__body">
            <div class="row" style="justify-content:space-between;flex-wrap:nowrap;gap:10px">
              <strong>${esc(employee.name)}</strong>
              <span class="muted small" style="white-space:nowrap">${esc(employee.employee_code || '')}</span>
            </div>
            <span class="type">${esc(employee.department || 'Unassigned')}</span>
            <div class="meta">${icon('attendance', 13)} ${esc(employee.shift_name || 'No shift')}</div>
            <div class="meta" style="color:${status.colour};font-weight:600">
              <i style="width:8px;height:8px;border-radius:50%;background:${status.colour};display:inline-block"></i> ${esc(status.label)}
            </div>
          </div>
          ${canManage ? `<button class="btn btn--sm btn--ghost" data-edit="${employee.id}">Edit</button>` : ''}
        </div>
      </article>`;
    }).join('')}</div>`;

    body.querySelectorAll('[data-edit]').forEach((button) => button.addEventListener('click', (event) => {
      event.stopPropagation();
      employeeForm(state.employees.find((employee) => employee.id === Number(button.dataset.edit)), load);
    }));
    body.querySelectorAll('[data-open]').forEach((card) => card.addEventListener('click', () => {
      window.location.hash = `#/employees?id=${card.dataset.open}`;
    }));
  }
}

export async function employeeForm(employee, onDone) {
  const editing = Boolean(employee);
  let users = [];
  if (!editing) { try { users = (await api.users()).users; } catch { users = []; } }
  const value = (key) => esc(employee?.[key] ?? '');
  const result = await modal({
    title: editing ? `Edit ${employee.name}` : 'Add employee',
    submitLabel: editing ? 'Save changes' : 'Add employee',
    tone: 'btn--gradient',
    body: `<div class="form-grid">
      <div class="field"><label>Full name</label><input name="name" value="${value('name')}" required /></div>
      <div class="field"><label>Employee code</label><input name="employeeCode" value="${value('employee_code')}" placeholder="GDF-001" /></div>
      <div class="field"><label>Phone</label><input name="phone" value="${value('phone')}" placeholder="+91XXXXXXXXXX" /></div>
      <div class="field"><label>Designation</label><input name="roleTitle" value="${value('role_title')}" placeholder="Line operator" /></div>
      <div class="field"><label>Department</label><input name="department" value="${value('department')}" placeholder="Production" /></div>
      <div class="field"><label>Shift</label><input name="shiftName" value="${value('shift_name')}" placeholder="Morning shift" /></div>
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
