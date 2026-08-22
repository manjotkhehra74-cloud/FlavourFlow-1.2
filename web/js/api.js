const BASE = '/api/v1';
const TOKEN_KEY = 'hrmate.token';
const USER_KEY = 'hrmate.user';

export const auth = {
  get token() { return localStorage.getItem(TOKEN_KEY); },
  get user() { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } },
  save(token, user) { localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(USER_KEY, JSON.stringify(user)); },
  clear() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); },
};

export class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

async function request(method, path, body, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  let payload = body;
  if (body && !(body instanceof FormData)) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  const response = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  if (response.status === 401 && !path.startsWith('/auth/login')) {
    auth.clear();
    window.dispatchEvent(new CustomEvent('hrmate:signed-out'));
    throw new ApiError('Session expired. Please sign in again.', 401);
  }
  if (options.raw) {
    if (!response.ok) throw new ApiError('Request failed', response.status);
    return response;
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new ApiError(data.error || `Request failed (${response.status})`, response.status);
  return data;
}

export const api = {
  get: (path, options) => request('GET', path, undefined, options),
  post: (path, body, options) => request('POST', path, body, options),
  patch: (path, body) => request('PATCH', path, body),
  login: (phone, password) => request('POST', '/auth/login', { phone, password }),
  me: () => request('GET', '/auth/me'),
  updateMe: (body) => request('PATCH', '/auth/me', body),
  changePassword: (body) => request('POST', '/auth/change-password', body),
  navigation: () => request('GET', '/meta/navigation'),
  dashboard: () => request('GET', '/dashboard'),
  employees: () => request('GET', '/employees'),
  employee: (id) => request('GET', `/employees/${id}`),
  createEmployee: (body) => request('POST', '/employees', body),
  updateEmployee: (id, body) => request('PATCH', `/employees/${id}`, body),
  attendanceMe: () => request('GET', '/attendance/me'),
  attendanceRegister: (month) => request('GET', `/attendance/register?month=${month}`),
  punchIn: (body) => request('POST', '/attendance/punch-in', body),
  punchOut: (body) => request('POST', '/attendance/punch-out', body),
  manualAttendance: (body) => request('POST', '/attendance/manual', body),
  leavesMe: () => request('GET', '/leaves/me'),
  applyLeave: (body) => request('POST', '/leaves', body),
  pendingLeaves: () => request('GET', '/leaves/pending'),
  reviewLeave: (id, body) => request('POST', `/leaves/${id}/review`, body),
  users: () => request('GET', '/users'),
  createUser: (body) => request('POST', '/users', body),
  updateUser: (id, body) => request('PATCH', `/users/${id}`, body),
  resetUserPassword: (id, newPassword) => request('POST', `/users/${id}/reset-password`, { newPassword }),
  notifications: () => request('GET', '/notifications'),
  readAll: () => request('POST', '/notifications/read-all'),
  readOne: (id) => request('POST', `/notifications/${id}/read`),
  attendanceSummary: (month) => request('GET', `/reports/attendance-summary?month=${month}`),
  registerCsvUrl: (month) => `${BASE}/reports/attendance-register.csv?month=${month}`,
};

/** Downloads a protected file through fetch so the bearer token travels with it. */
export async function downloadFile(url, filename) {
  const response = await fetch(url, { headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {} });
  if (!response.ok) throw new ApiError('Download failed', response.status);
  const blob = await response.blob();
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
