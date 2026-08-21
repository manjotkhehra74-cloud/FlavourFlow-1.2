export const ROLES = ['super_admin', 'hr_manager', 'supervisor', 'employee'];
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
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', permission: 'dashboard.view' },
  { key: 'attendance', label: 'Attendance', permission: 'attendance.view' },
  { key: 'leave', label: 'Leave', permission: 'leave.view' },
  { key: 'employees', label: 'Employees', permission: 'employees.view' },
  { key: 'reports', label: 'Reports', permission: 'reports.view' },
  { key: 'users', label: 'Users', permission: 'users.view' },
];
// Super admin is intentionally future-proof: every present and future permission is allowed.
export const hasPermission = (role, permission) =>
  role === 'super_admin' || (ROLE_PERMISSIONS[role]?.includes(permission) ?? false);
