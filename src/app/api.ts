const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('quro_token');
}

function setToken(token: string): void {
  localStorage.setItem('quro_token', token);
}

function clearToken(): void {
  localStorage.removeItem('quro_token');
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    if (!path.startsWith('/auth/')) {
      clearToken();
      window.location.reload();
    }
    const err = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(err.error || 'Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>('POST', '/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    request<{ token: string; user: any }>('POST', '/auth/register', { name, email, password }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('POST', '/auth/forgot-password', { email }),
  resetPassword: (id: string, token: string, password: string) =>
    request<{ message: string }>('POST', '/auth/reset-password', { id, token, password }),
  setToken,
  getToken,
  clearToken,
  isLoggedIn: () => !!getToken(),
};

// User
export const user = {
  getProfile: () => request<any>('GET', '/user/profile'),
  updateProfile: (data: any) => request<any>('PATCH', '/user/profile', data),
  deleteAccount: () => request<any>('DELETE', '/user/account'),
  getDashboardStats: () => request<any>('GET', '/user/dashboard-stats'),
};

// Tasks
export const tasks = {
  getAll: () => request<any[]>('GET', '/tasks'),
  create: (data: any) => request<any>('POST', '/tasks', data),
  update: (id: number, data: any) => request<any>('PATCH', `/tasks/${id}`, data),
  toggle: (id: number) => request<any>('PATCH', `/tasks/${id}/toggle`),
  delete: (id: number) => request<any>('DELETE', `/tasks/${id}`),
};

// Habits
export const habits = {
  getAll: () => request<any[]>('GET', '/habits'),
  create: (data: any) => request<any>('POST', '/habits', data),
  toggle: (id: number) => request<any>('PATCH', `/habits/${id}/toggle`),
  update: (id: number, data: any) => request<any>('PATCH', `/habits/${id}`, data),
  delete: (id: number) => request<any>('DELETE', `/habits/${id}`),
};

// Study
export const study = {
  getSubjects: (scope = 'semester-1') => request<any[]>('GET', `/study/subjects?scope=${encodeURIComponent(scope)}`),
  createSubject: (data: any, scope = 'semester-1') => request<any>('POST', '/study/subjects', { ...data, scope }),
  updateSubject: (id: number, data: any, scope = 'semester-1') => request<any>('PATCH', `/study/subjects/${id}`, { ...data, scope }),
  deleteSubject: (id: number, scope = 'semester-1') => request<any>('DELETE', `/study/subjects/${id}?scope=${encodeURIComponent(scope)}`),
  getResources: (scope = 'semester-1') => request<any[]>('GET', `/study/resources?scope=${encodeURIComponent(scope)}`),
  createResource: (data: any, scope = 'semester-1') => request<any>('POST', '/study/resources', { ...data, scope }),
  updateResource: (id: number, data: any, scope = 'semester-1') => request<any>('PATCH', `/study/resources/${id}`, { ...data, scope }),
  deleteResource: (id: number, scope = 'semester-1') => request<any>('DELETE', `/study/resources/${id}?scope=${encodeURIComponent(scope)}`),
  getNotes: (scope = 'semester-1') => request<any[]>('GET', `/study/notes?scope=${encodeURIComponent(scope)}`),
  createNote: (data: any, scope = 'semester-1') => request<any>('POST', '/study/notes', { ...data, scope }),
  deleteNote: (id: number, scope = 'semester-1') => request<any>('DELETE', `/study/notes/${id}?scope=${encodeURIComponent(scope)}`),
  getSettings: (scope = 'semester-1') => request<any>('GET', `/study/settings?scope=${encodeURIComponent(scope)}`),
  updateSettings: (data: any, scope = 'semester-1') => request<any>('PATCH', '/study/settings', { ...data, scope }),
  getTrend: (scope = 'semester-1') => request<any[]>('GET', `/study/trend?scope=${encodeURIComponent(scope)}`),
};

// Projects
export const projects = {
  getAll: () => request<any[]>('GET', '/projects'),
  create: (data: any) => request<any>('POST', '/projects', data),
  update: (id: number, data: any) => request<any>('PATCH', `/projects/${id}`, data),
  toggleMilestone: (projectId: number, milestoneId: number) =>
    request<any>('PATCH', `/projects/${projectId}/milestones/${milestoneId}/toggle`),
  delete: (id: number) => request<any>('DELETE', `/projects/${id}`),
};

// Finance
export const finance = {
  getTransactions: () => request<any[]>('GET', '/finance/transactions'),
  createTransaction: (data: any) => request<any>('POST', '/finance/transactions', data),
  deleteTransaction: (id: number) => request<any>('DELETE', `/finance/transactions/${id}`),
  getSummary: () => request<any>('GET', '/finance/summary'),
  updateSavingsGoal: (data: any) => request<any>('PATCH', '/finance/savings-goal', data),
};

// Health
export const health = {
  getWorkouts: () => request<any[]>('GET', '/health/workouts'),
  createWorkout: (data: any) => request<any>('POST', '/health/workouts', data),
  deleteWorkout: (id: number) => request<any>('DELETE', `/health/workouts/${id}`),
  getMetrics: () => request<any>('GET', '/health/metrics'),
  createMetric: (data: any) => request<any>('POST', '/health/metrics', data),
};

// Diary
export const diary = {
  getAll: () => request<any[]>('GET', '/diary'),
  create: (data: any) => request<any>('POST', '/diary', data),
  update: (id: number, data: any) => request<any>('PATCH', `/diary/${id}`, data),
  delete: (id: number) => request<any>('DELETE', `/diary/${id}`),
};

// Entertainment
export const entertainment = {
  getAll: () => request<any[]>('GET', '/entertainment'),
  create: (data: any) => request<any>('POST', '/entertainment', data),
  update: (id: number, data: any) => request<any>('PATCH', `/entertainment/${id}`, data),
  delete: (id: number) => request<any>('DELETE', `/entertainment/${id}`),
};

// Analytics
export const analytics = {
  get: () => request<any>('GET', '/analytics'),
  getLifeMeter: () => request<any>('GET', '/analytics/lifemeter'),
};

// Notifications
export const notifications = {
  getAll: () => request<any[]>('GET', '/notifications'),
  create: (data: any) => request<any>('POST', '/notifications', data),
  markRead: (id: number) => request<any>('PATCH', `/notifications/${id}/read`),
  markAllRead: () => request<any>('PATCH', '/notifications/read-all'),
  delete: (id: number) => request<any>('DELETE', `/notifications/${id}`),
};

// Search
export const search = {
  query: (q: string) => request<any[]>('GET', `/search?q=${encodeURIComponent(q)}`),
};

// Admin
export const admin = {
  getUsers: () => request<any[]>('GET', '/admin/users'),
  deleteUser: (id: number) => request<any>('DELETE', `/admin/users/${id}`),
  getStats: () => request<any>('GET', '/admin/stats'),
};
