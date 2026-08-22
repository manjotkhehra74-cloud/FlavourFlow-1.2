import { t } from './i18n.js';

/** Mirror of server/src/rbac.js so the console can hide what the API would reject. */
export const PERMISSIONS = [
  'dashboard.view', 'employees.view', 'employees.manage', 'attendance.view',
  'attendance.manage', 'leave.view', 'leave.manage', 'reports.view', 'reports.manage',
  'users.view', 'users.manage', 'settings.manage', 'notifications.view',
];

export const ROLE_PERMISSIONS = {
  super_admin: PERMISSIONS,
  hr_manager: PERMISSIONS.filter((p) => !p.startsWith('settings.')),
  supervisor: ['dashboard.view', 'employees.view', 'attendance.view', 'attendance.manage', 'leave.view', 'leave.manage', 'notifications.view'],
  employee: ['dashboard.view', 'attendance.view', 'leave.view', 'notifications.view'],
};

const ROLE_KEY = {
  super_admin: 'Super admin', hr_manager: 'HR manager', supervisor: 'Supervisor', employee: 'Employee',
};
/** A Proxy keeps the `ROLE_LABEL[role]` call sites unchanged while translating lazily. */
export const ROLE_LABEL = new Proxy(ROLE_KEY, { get: (target, key) => (target[key] ? t(target[key]) : undefined) });

export const can = (role, permission) => role === 'super_admin' || (ROLE_PERMISSIONS[role] || []).includes(permission);
