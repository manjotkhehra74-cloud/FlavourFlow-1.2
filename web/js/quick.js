import { api } from './api.js';
import { can } from './rbac.js';
import { currentPosition, el, esc, icon, qs, toast } from './ui.js';
import { t } from './i18n.js';
import { employeeForm } from './pages/employees.js';
import { manualEntry } from './pages/attendance.js';
import { applyLeave } from './pages/leave.js';
import { broadcastForm } from './pages/notifications.js';

/**
 * The centre button of the mobile tab bar. When the signed-in user is linked to an
 * employee record and the day is still open it punches straight in or out; otherwise it
 * opens a sheet with every create action their role allows.
 */

let busy = false;

export async function quickAction(user, reload) {
  if (busy) return;
  busy = true;
  try {
    const punch = await punchState();
    if (punch === 'in' || punch === 'out') return await doPunch(punch, reload);
    await openSheet(user, reload, punch);
  } finally { busy = false; }
}

/** 'in' | 'out' | 'done' | 'none' — 'none' means the account has no employee profile. */
async function punchState() {
  try {
    const data = await api.attendanceMe();
    if (!data.employee) return 'none';
    // `today` is the day's attendance row (or null), not a date string.
    const record = data.today;
    if (!record?.punch_in_at) return 'in';
    if (!record.punch_out_at) return 'out';
    return 'done';
  } catch { return 'none'; }
}

async function doPunch(mode, reload) {
  toast(mode === 'in' ? t('Recording your punch…') : t('Saving your punch out…'));
  try {
    const position = await currentPosition();
    if (mode === 'in') await api.punchIn(position || {});
    else await api.punchOut(position || {});
    toast(mode === 'in' ? t('Punched in. Have a great shift!') : t('Punched out. Well done!'), 'ok');
    await reload?.();
  } catch (error) { toast(error.message, 'err'); }
}

function openSheet(user, reload, punch) {
  const actions = [
    {
      show: punch === 'done',
      glyph: 'circleCheck', tone: 'tone-green',
      label: t('Attendance complete'), hint: t('You have already punched out today.'),
      run: () => { window.location.hash = '#/attendance'; },
    },
    {
      show: can(user.role, 'leave.view'),
      glyph: 'umbrella', tone: 'tone-blue',
      label: t('Apply for leave'), hint: t('Request time off'),
      run: async () => {
        let balance = { casual: 0, sick: 0, earned: 0 };
        try { balance = (await api.leavesMe()).balance || balance; } catch { /* defaults are fine */ }
        await applyLeave(balance, reload);
      },
    },
    {
      show: can(user.role, 'attendance.manage'),
      glyph: 'attendance', tone: 'tone-green',
      label: t('Manual attendance'), hint: t('Mark or correct a punch'),
      run: () => manualEntry(reload),
    },
    {
      show: can(user.role, 'employees.manage'),
      glyph: 'employees', tone: 'tone-violet',
      label: t('Add employee'), hint: t('Create an employee record'),
      run: () => employeeForm(null, reload),
    },
    {
      show: can(user.role, 'settings.manage'),
      glyph: 'bell', tone: 'tone-amber',
      label: t('Send announcement'), hint: t('Notify every active account'),
      run: () => broadcastForm(reload),
    },
  ].filter((action) => action.show);

  return new Promise((resolve) => {
    const sheet = el(`<div class="sheet-backdrop" role="dialog" aria-modal="true">
      <div class="sheet">
        <span class="sheet__grip"></span>
        <h3>${esc(t('Quick actions'))}</h3>
        <div class="stack">${actions.map((action, index) => `
          <button type="button" class="rowcard rowcard--tap" data-run="${index}">
            <span class="rowcard__icon ${action.tone}">${icon(action.glyph)}</span>
            <span class="rowcard__body"><strong>${esc(action.label)}</strong><small>${esc(action.hint)}</small></span>
            ${icon('arrowRight', 16)}
          </button>`).join('')}
        </div>
        <button type="button" class="btn btn--ghost btn--block" data-close>${esc(t('Cancel'))}</button>
      </div>
    </div>`);

    const close = () => { sheet.remove(); document.removeEventListener('keydown', onKey); resolve(); };
    const onKey = (event) => { if (event.key === 'Escape') close(); };
    sheet.addEventListener('click', async (event) => {
      if (event.target === sheet || event.target.closest('[data-close]')) return close();
      const button = event.target.closest('[data-run]');
      if (!button) return;
      close();
      await actions[Number(button.dataset.run)].run();
    });
    document.addEventListener('keydown', onKey);
    qs('#modal-root').append(sheet);
  });
}
