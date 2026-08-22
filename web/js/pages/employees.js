import { api } from '../api.js';
import { can } from '../rbac.js';
import { avatar, emptyState, esc, filterSheet, icon, loadingRows, modal, qs, toast } from '../ui.js';
import { t } from '../i18n.js';

export const meta = { key: 'employees', title: 'Employees', subtitle: 'Team directory and profiles' };

const TODAY_TONE = {
  present: { label: t('Present'), colour: '#16a34a' },
  late: { label: t('Late'), colour: 'var(--amber)' },
  half_day: { label: t('Half day'), colour: 'var(--amber)' },
  absent: { label: t('Absent'), colour: 'var(--red)' },
  leave: { label: t('On leave'), colour: 'var(--amber)' },
  none: { label: t('Not marked'), colour: 'var(--muted)' },
};

export async function render(root, context) {
  const { user } = context;
  const canManage = can(user.role, 'employees.manage');
  const state = { search: '', department: 'All', status: 'all', shift: 'all', employees: [] };

  const head = context.pageActions?.(`
    <button class="icon-btn" data-filter title="${esc(t('Filters'))}">${icon('filter', 18)}</button>
    ${canManage ? `<button class="btn btn--gradient" data-add>${icon('plus', 16)} ${esc(t('Add employee'))}</button>` : ''}`);

  root.innerHTML = `<section class="card">
    <div class="field"><input type="search" data-search placeholder="${esc(t('Search name, department…'))}" /></div>
    <div class="chips" data-chips style="margin-top:12px"></div>
  </section>
  <div data-body>${loadingRows(4)}</div>`;

  const body = qs('[data-body]', root);
  qs('[data-search]', root).addEventListener('input', (event) => { state.search = event.target.value.toLowerCase(); paint(); });
  head?.querySelector('[data-add]')?.addEventListener('click', () => employeeForm(null, load));
  head?.querySelector('[data-filter]')?.addEventListener('click', openFilters);

  async function openFilters() {
    const shifts = [...new Set(state.employees.map((employee) => employee.shift_name).filter(Boolean))].sort();
    const picked = await filterSheet({
      groups: [
        {
          key: 'status',
          label: t("Today's status"),
          value: state.status,
          options: [
            { value: 'all', label: t('All') },
            ...Object.entries(TODAY_TONE).map(([key, tone]) => ({ value: key, label: tone.label })),
          ],
        },
        {
          key: 'shift',
          label: t('Shift'),
          value: state.shift,
          options: [{ value: 'all', label: t('All') }, ...shifts.map((name) => ({ value: name, label: name }))],
        },
      ],
    });
    if (!picked) return;
    Object.assign(state, picked);
    const active = state.status !== 'all' || state.shift !== 'all';
    head?.querySelector('[data-filter]')?.classList.toggle('is-active', active);
    paint();
  }

  await load();

  async function load() {
    body.innerHTML = loadingRows(4);
    try {
      state.employees = (await api.employees()).employees;
      const departments = ['All', ...new Set(state.employees.map((employee) => employee.department).filter(Boolean))].sort((a, b) => (a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)));
      const chips = qs('[data-chips]', root);
      chips.innerHTML = departments.map((name) => `<button class="chip ${name === state.department ? 'is-active' : ''}" data-chip="${esc(name)}">${esc(name === 'All' ? t('All') : name)}</button>`).join('');
      chips.querySelectorAll('[data-chip]').forEach((chip) => chip.addEventListener('click', () => {
        state.department = chip.dataset.chip;
        chips.querySelectorAll('[data-chip]').forEach((other) => other.classList.toggle('is-active', other.dataset.chip === state.department));
        paint();
      }));
      paint();
    } catch (error) { body.innerHTML = emptyState(t('Could not load employees'), error.message); }
  }

  function paint() {
    const filtered = state.employees.filter((employee) => {
      const haystack = `${employee.name} ${employee.employee_code || ''} ${employee.phone || ''} ${employee.role_title || ''} ${employee.department || ''}`.toLowerCase();
      const key = employee.on_leave ? 'leave' : (employee.today_status || 'none');
      return haystack.includes(state.search)
        && (state.department === 'All' || employee.department === state.department)
        && (state.status === 'all' || key === state.status)
        && (state.shift === 'all' || employee.shift_name === state.shift);
    });
    if (!filtered.length) { body.innerHTML = `<section class="card">${emptyState(t('No employees found'), t('Try a different search or add a new employee.'))}</section>`; return; }

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
            <span class="type">${esc(employee.department || t('Unassigned'))}</span>
            <div class="meta">${icon('attendance', 13)} ${esc(employee.shift_name || t('No shift'))}</div>
            <div class="meta" style="color:${status.colour};font-weight:600">
              <i style="width:8px;height:8px;border-radius:50%;background:${status.colour};display:inline-block"></i> ${esc(status.label)}
            </div>
          </div>
          ${canManage ? `<button class="btn btn--sm btn--ghost" data-edit="${employee.id}">${esc(t('Edit'))}</button>` : ''}
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

export async function employeeForm(employee, onDone, prefill = {}) {
  const editing = Boolean(employee);
  let users = [];
  if (!editing) { try { users = (await api.users()).users; } catch { users = []; } }
  const value = (key) => esc(employee?.[key] ?? prefill[key] ?? '');
  const result = await modal({
    title: editing ? `Edit ${employee.name}` : t('Add employee'),
    submitLabel: editing ? t('Save changes') : t('Add employee'),
    tone: 'btn--gradient',
    body: `<div class="form-grid">
      <div class="field"><label>${esc(t('Full name'))}</label><input name="name" value="${value('name')}" required /></div>
      <div class="field"><label>${esc(t('Employee code'))}</label><input name="employeeCode" value="${value('employee_code')}" placeholder="GDF-001" /></div>
      <div class="field"><label>${esc(t('Phone'))}</label><input name="phone" value="${value('phone')}" placeholder="+91XXXXXXXXXX" /></div>
      <div class="field"><label>${esc(t('Designation'))}</label><input name="roleTitle" value="${value('role_title')}" placeholder="Line operator" /></div>
      <div class="field"><label>${esc(t('Department'))}</label><input name="department" value="${value('department')}" placeholder="Production" /></div>
      <div class="field"><label>${esc(t('Shift'))}</label><input name="shiftName" value="${value('shift_name')}" placeholder="Morning shift" /></div>
      <div class="field"><label>${esc(t('Joining date'))}</label><input type="date" name="joinDate" value="${value('join_date')}" /></div>
      ${!editing && users.length ? `<div class="field"><label>${esc(t('Link login account'))}</label><select name="userId">
        <option value="">${esc(t('Not linked'))}</option>
        ${users.map((account) => `<option value="${account.id}" ${Number(prefill.userId) === account.id ? 'selected' : ''}>${esc(account.name)} · ${esc(account.phone || '')}</option>`).join('')}
      </select><span class="field__hint">${esc(t('Needed for app punch-in'))}</span></div>` : ''}
    </div>`,
  });
  if (!result) return;
  const payload = { ...result, userId: result.userId ? Number(result.userId) : undefined };
  Object.keys(payload).forEach((key) => { if (payload[key] === '') payload[key] = null; });
  try {
    if (editing) await api.updateEmployee(employee.id, payload);
    else await api.createEmployee(payload);
    toast(editing ? t('Employee updated') : t('Employee added'), 'ok');
    onDone?.();
  } catch (error) { toast(error.message, 'err'); }
}
