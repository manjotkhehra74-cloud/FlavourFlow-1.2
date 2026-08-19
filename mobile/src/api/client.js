import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { Platform } from 'react-native';

// In Expo Go / simulator use localhost. On a physical device, set the LAN IP via EXPO_PUBLIC_API_URL.
// On web (preview) we use a same-origin /api path that the dev proxy forwards to the backend.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'web' ? '/api' : Constants.expoConfig?.extra?.apiUrl) ||
  'http://localhost:4000/api';

export const API_URL = BASE_URL;

let tokenPromise = null;
export async function getToken() {
  if (!tokenPromise) tokenPromise = AsyncStorage.getItem('token');
  return tokenPromise;
}
export async function setToken(t) {
  tokenPromise = null;
  if (t) await AsyncStorage.setItem('token', t);
  else await AsyncStorage.removeItem('token');
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = await getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const Api = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => api('/auth/me'),
  summary: () => api('/dashboard/summary'),
  employees: (q) => api(`/employees${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  team: () => api('/employees/team'),
  events: () => api('/employees/events/today'),
  employee: (id) => api(`/employees/${id}`),

  clock: (payload) => api('/attendance/clock', { method: 'POST', body: typeof payload === 'string' ? { action: payload } : payload }),
  lateReasons: () => api('/meta/late-reasons', { auth: true }),
  permissions: () => api('/meta/permissions', { auth: true }),
  serverTime: () => api('/meta/time'),
  attendanceToday: () => api('/attendance/today'),
  attendanceHistory: (month) => api(`/attendance/history${month ? `?month=${month}` : ''}`),
  createAttendanceRequest: (date, type, reason) => api('/attendance/requests', { method: 'POST', body: { date, type, reason } }),
  myAttendanceRequests: () => api('/attendance/requests/mine'),
  pendingAttendance: () => api('/attendance/requests/pending'),
  bulkAttendance: (ids, action) => api('/attendance/requests/bulk', { method: 'POST', body: { ids, action } }),

  leaveBalances: () => api('/leaves/balances'),
  myLeaves: () => api('/leaves/mine'),
  requestLeave: (leave) => api('/leaves/request', { method: 'POST', body: leave }),
  pendingLeaves: () => api('/leaves/pending'),
  reviewLeave: (id, action) => api(`/leaves/${id}/review`, { method: 'POST', body: { action } }),

  teamActions: () => api('/team/actions/pending'),
  createTeamAction: (user_id, action_type, payload) => api('/team/actions', { method: 'POST', body: { user_id, action_type, payload } }),
  reviewTeamAction: (id, action) => api(`/team/actions/${id}/review`, { method: 'POST', body: { action } }),

  posts: () => api('/social/posts'),
  createPost: (post) => api('/social/posts', { method: 'POST', body: post }),
  likePost: (id) => api(`/social/posts/${id}/like`, { method: 'POST' }),
  commentPost: (id, body) => api(`/social/posts/${id}/comments`, { method: 'POST', body: { body } }),
  sendWish: (recipient_id, wish_type, body) => api('/social/wishes', { method: 'POST', body: { recipient_id, wish_type, body } }),

  tickets: () => api('/tickets'),
  createTicket: (t) => api('/tickets', { method: 'POST', body: t }),
  updateTicketStatus: (id, status) => api(`/tickets/${id}/status`, { method: 'POST', body: { status } }),
};
