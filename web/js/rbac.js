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

export const ROLE_LABEL = {
  super_admin: 'Super admin', hr_manager: 'HR manager', supervisor: 'Supervisor', employee: 'Employee',
};

export const can = (role, permission) => role === 'super_admin' || (ROLE_PERMISSIONS[role] || []).includes(permission);
