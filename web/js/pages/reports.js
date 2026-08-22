import { api, downloadFile } from '../api.js';
import {
  emptyState, esc, icon, loadingRows, monthIso, qs, shiftMonth, toast,
} from '../ui.js';

export const meta = { key: 'reports', title: 'Reports', subtitle: 'Monthly attendance insights and exports' };

const monthName = (month) => new Date(`${month}-01T00:00:00Z`)
  .toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * Draws the month's attendance percentage as an SVG sparkline. Days with no attendance at
 * all (weekly offs, future dates) are skipped so the line does not dive to zero.
 */
function lineChart(daily) {
  const points = daily.map((day, index) => ({ index, ...day })).filter((day) => day.rate !== null);
  if (points.length < 2) {
    return '<div class="chart chart--empty"><span>Not enough data yet for a trend line</span></div>';
  }
  const width = 640;
  const height = 150;
  const padding = { top: 14, bottom: 24, left: 6, right: 6 };
  const span = Math.max(1, daily.length - 1);
  const x = (index) => padding.left + (index / span) * (width - padding.left - padding.right);
  const y = (value) => padding.top + (1 - value / 100) * (height - padding.top - padding.bottom);

  const path = points.map((point, i) => `${i ? 'L' : 'M'}${x(point.index).toFixed(1)} ${y(point.rate).toFixed(1)}`).join(' ');
  const area = `${path} L${x(points[points.length - 1].index).toFixed(1)} ${y(0).toFixed(1)} L${x(points[0].index).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const grid = [100, 75, 50, 25].map((value) => `<line x1="${padding.left}" x2="${width - padding.right}" y1="${y(value)}" y2="${y(value)}" stroke="rgba(255,255,255,.18)" stroke-dasharray="3 5" />`).join('');
  const dots = points.filter((_, i) => i % Math.ceil(points.length / 10) === 0 || i === points.length - 1)
    .map((point) => `<circle cx="${x(point.index).toFixed(1)}" cy="${y(point.rate).toFixed(1)}" r="3.2" fill="#fff"><title>${esc(point.date)} · ${point.rate}%</title></circle>`).join('');
  const labels = [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]]
    .map((point) => `<text x="${x(point.index).toFixed(1)}" y="${height - 6}" fill="rgba(255,255,255,.75)" font-size="11" text-anchor="middle">${Number(point.date.slice(8))}</text>`).join('');

  return `<svg class="chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Attendance percentage across the month">
    <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,.42)" /><stop offset="100%" stop-color="rgba(255,255,255,0)" />
    </linearGradient></defs>
    ${grid}
    <path d="${area}" fill="url(#chartFill)" />
    <path d="${path}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" />
    ${dots}${labels}
  </svg>`;
}

export async function render(root, context) {
  let month = monthIso();

  root.innerHTML = `
    <section class="card">
      <div class="card__head">
        <h3>Reports</h3>
        <div class="row" style="flex-wrap:nowrap;gap:6px;margin-left:auto">
          <button class="icon-btn" data-month="-1" title="Previous month">${icon('arrowLeft', 16)}</button>
          <strong class="small" data-label style="min-width:120px;text-align:center">${esc(monthName(month))}</strong>
          <button class="icon-btn" data-month="1" title="Next month">${icon('arrowRight', 16)}</button>
        </div>
      </div>
    </section>
    <div data-body>${loadingRows(4)}</div>`;

  const body = qs('[data-body]', root);
  root.querySelectorAll('[data-month]').forEach((button) => button.addEventListener('click', () => {
    month = shiftMonth(month, Number(button.dataset.month));
    qs('[data-label]', root).textContent = monthName(month);
    load();
  }));

  await load();

  async function load() {
    body.innerHTML = loadingRows(4);
    let data;
    try { data = await api.attendanceSummary(month); }
    catch (error) { body.innerHTML = `<section class="card">${emptyState('Could not load the report', error.message)}</section>`; return; }

    const { counts, attendanceRate, change, insights, employees, departments } = data;
    const trend = data.previousTotal === 0
      ? `No attendance recorded in ${monthName(data.previousMonth)}`
      : `${change === 0 ? 'Level with' : `${change > 0 ? 'Up' : 'Down'} ${Math.abs(change)}% on`} ${monthName(data.previousMonth)}`;

    body.innerHTML = `
      <section class="hero">
        <div class="row" style="justify-content:space-between;align-items:flex-start">
          <div>
            <span class="hero__label">Attendance this month</span>
            <h2 style="font-size:44px;letter-spacing:-.04em;line-height:1.05">${esc(attendanceRate)}<span style="font-size:24px">%</span></h2>
            <div class="row" style="gap:6px;margin-top:6px;font-size:13px;opacity:.92">
              ${data.previousTotal === 0 ? '' : icon(change >= 0 ? 'trendUp' : 'trendDown', 15)} ${esc(trend)}
            </div>
          </div>
          <span class="pill" style="background:rgba(255,255,255,.22);color:#fff">${esc(insights.workingDays)} working days</span>
        </div>
        ${lineChart(data.daily)}
        <div class="hero__tiles">
          <div class="hero__tile"><strong>${esc(counts.present)}</strong><small>Present</small></div>
          <div class="hero__tile"><strong>${esc(counts.late)}</strong><small>Late</small></div>
          <div class="hero__tile"><strong>${esc(counts.half_day)}</strong><small>Half day</small></div>
          <div class="hero__tile"><strong>${esc(counts.absent)}</strong><small>Absent</small></div>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h3>Insights</h3></div>
        <div class="tiles">
          <div class="tile" style="cursor:default"><span class="tile__icon tone-amber">${icon('clock')}</span>
            <small>Avg late arrival</small><strong>${esc(insights.averageLateMinutes)}<span style="font-size:13px;color:var(--muted);font-weight:600"> min</span></strong></div>
          <div class="tile" style="cursor:default"><span class="tile__icon tone-green">${icon('circleCheck')}</span>
            <small>On-time rate</small><strong>${esc(insights.onTimeRate)}<span style="font-size:13px;color:var(--muted);font-weight:600">%</span></strong></div>
          <div class="tile" style="cursor:default"><span class="tile__icon tone-blue">${icon('umbrella')}</span>
            <small>Leave days</small><strong>${esc(insights.leaveDays)}</strong></div>
        </div>
      </section>

      <section class="card">
        <div class="card__head"><h3>Export register</h3><span class="muted small spacer">${esc(monthName(month))}</span></div>
        <div class="grid grid--3">
          <button class="btn btn--outline btn--lg" data-export="pdf">${icon('download', 18)} PDF</button>
          <button class="btn btn--outline btn--lg" data-export="xlsx">${icon('download', 18)} Excel</button>
          <button class="btn btn--outline btn--lg" data-export="csv">${icon('download', 18)} CSV</button>
        </div>
        <button class="btn btn--gradient btn--lg" data-export="summary" style="width:100%;margin-top:12px">${icon('reports', 18)} Download summary PDF</button>
      </section>

      ${departments.length ? `<section class="card">
        <div class="card__head"><h3>By department</h3></div>
        <div class="stack">${departments.map((row) => `
          <div>
            <div class="row" style="justify-content:space-between;font-size:13.5px;font-weight:600">
              <span>${esc(row.department)}</span><span class="muted">${esc(row.rate)}%</span>
            </div>
            <div class="bar"><i style="width:${Math.max(2, row.rate)}%"></i></div>
          </div>`).join('')}</div>
      </section>` : ''}

      <section class="card">
        <div class="card__head"><h3>Per employee</h3><span class="muted small spacer">${esc(employees.length)} people</span></div>
        ${employees.length ? `<div class="table-wrap"><table>
          <thead><tr><th>Employee</th><th>Present</th><th>Late</th><th>Half</th><th>Absent</th><th>Rate</th></tr></thead>
          <tbody>${employees.map((row) => `<tr>
            <td><strong>${esc(row.name)}</strong><div class="muted small">${esc(row.employee_code || '')}${row.department ? ` · ${esc(row.department)}` : ''}</div></td>
            <td class="t-green">${esc(row.present)}</td><td class="t-amber">${esc(row.late)}</td>
            <td class="t-blue">${esc(row.half_day)}</td><td class="t-grey">${esc(row.absent)}</td>
            <td><strong>${esc(row.rate)}%</strong></td>
          </tr>`).join('')}</tbody></table></div>` : emptyState('No attendance recorded', `Nothing was marked in ${monthName(month)}.`)}
      </section>`;

    body.querySelectorAll('[data-export]').forEach((button) => button.addEventListener('click', async () => {
      const kind = button.dataset.export;
      const targets = {
        pdf: [api.registerPdfUrl(month), `hrmate-attendance-${month}.pdf`],
        xlsx: [api.registerXlsxUrl(month), `hrmate-attendance-${month}.xlsx`],
        csv: [api.registerCsvUrl(month), `hrmate-attendance-${month}.csv`],
        summary: [api.summaryPdfUrl(month), `hrmate-summary-${month}.pdf`],
      };
      const [url, filename] = targets[kind];
      button.disabled = true;
      try { await downloadFile(url, filename); toast(`${filename} downloaded`, 'ok'); }
      catch (error) { toast(error.message, 'err'); }
      finally { button.disabled = false; }
    }));
  }
}

