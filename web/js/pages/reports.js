import { api, downloadFile } from '../api.js';
import { emptyState, esc, formatDate, icon, loadingRows, monthIso, qs, toast } from '../ui.js';

export const meta = { key: 'reports', title: 'Reports', subtitle: 'Monthly insights and exports' };

export async function render(root) {
  const state = { month: monthIso() };

  root.innerHTML = `<section class="card">
    <div class="card__head">
      <h3>Monthly attendance report</h3>
      <div class="row spacer">
        <input type="month" value="${state.month}" data-month style="padding:8px 11px;border-radius:11px;border:1px solid var(--line)" />
        <button class="btn btn--sm" data-export>${icon('download', 15)} Export CSV</button>
      </div>
    </div>
    <div data-summary>${loadingRows(3)}</div>
  </section>
  <section class="card">
    <div class="card__head"><h3>Register preview</h3><span class="muted small spacer" data-count></span></div>
    <div data-register>${loadingRows()}</div>
  </section>`;

  qs('[data-month]', root).addEventListener('change', (event) => { state.month = event.target.value || monthIso(); load(); });
  qs('[data-export]', root).addEventListener('click', async () => {
    try {
      await downloadFile(api.registerCsvUrl(state.month), `hrmate-attendance-${state.month}.csv`);
      toast('Register exported', 'ok');
    } catch (error) { toast(error.message, 'err'); }
  });

  await load();

  async function load() {
    const summaryHost = qs('[data-summary]', root);
    const registerHost = qs('[data-register]', root);
    summaryHost.innerHTML = loadingRows(3);
    registerHost.innerHTML = loadingRows();
    try {
      const [summary, register] = await Promise.all([api.attendanceSummary(state.month), api.attendanceRegister(state.month)]);
      const cards = [
        { label: 'Attendance rate', value: `${summary.attendanceRate}%`, tone: 'green', iconName: 'reports', foot: 'Present + late of all marked days' },
        { label: 'Present days', value: (summary.counts.present || 0) + (summary.counts.late || 0), tone: 'blue', iconName: 'attendance', foot: `${summary.counts.late || 0} were late` },
        { label: 'Absent days', value: summary.counts.absent || 0, tone: 'red', iconName: 'close', foot: `${summary.counts.half_day || 0} half days` },
        { label: 'Approved leave', value: summary.leaveDays, tone: 'violet', iconName: 'leave', foot: 'Days approved this month' },
      ];
      summaryHost.innerHTML = `<div class="grid grid--stats">${cards.map((card) => `<article class="card card--flat stat" style="border-color:#eef2f7">
        <div class="stat__top"><span class="stat__icon tone-${card.tone}">${icon(card.iconName)}</span><span class="stat__label">${esc(card.label)}</span></div>
        <div class="stat__value">${esc(card.value)}</div><div class="stat__foot">${esc(card.foot)}</div>
      </article>`).join('')}</div>`;

      const byEmployee = new Map();
      register.records.forEach((record) => {
        const key = record.name || 'Unknown';
        const row = byEmployee.get(key) || { name: key, code: record.employee_code, department: record.department, present: 0, late: 0, half_day: 0, absent: 0 };
        row[record.status] = (row[record.status] || 0) + 1;
        byEmployee.set(key, row);
      });
      const rows = [...byEmployee.values()].sort((a, b) => a.name.localeCompare(b.name));
      qs('[data-count]', root).textContent = `${rows.length} employees · ${formatDate(`${state.month}-01`, { month: 'long', year: 'numeric' })}`;
      registerHost.innerHTML = rows.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Employee</th><th>Department</th><th>Present</th><th>Late</th><th>Half day</th><th>Absent</th><th>Rate</th></tr></thead>
        <tbody>${rows.map((row) => {
          const total = row.present + row.late + row.half_day + row.absent;
          const rate = total ? Math.round(((row.present + row.late) * 100) / total) : 0;
          return `<tr>
            <td><strong>${esc(row.name)}</strong>${row.code ? `<div class="muted small">${esc(row.code)}</div>` : ''}</td>
            <td>${esc(row.department || '—')}</td>
            <td>${row.present}</td><td>${row.late}</td><td>${row.half_day}</td><td>${row.absent}</td>
            <td><span class="pill ${rate >= 90 ? 'pill--present' : rate >= 75 ? 'pill--late' : 'pill--absent'}">${rate}%</span></td>
          </tr>`;
        }).join('')}</tbody></table></div>`
        : emptyState('No records this month', 'Pick another month or add attendance entries.');
    } catch (error) {
      summaryHost.innerHTML = emptyState('Could not load the report', error.message);
      registerHost.innerHTML = '';
    }
  }
}
