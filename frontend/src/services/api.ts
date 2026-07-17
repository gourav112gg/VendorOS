/**
 * VendorOS Frontend API Client
 *
 * Connects the React frontend to the Node/Express/MongoDB backend.
 * Base URL is configured via VITE_API_URL environment variable.
 * Falls back to localhost:5000 for local development.
 *
 * Usage:
 *   import api from './services/api';
 *   const { data } = await api.auth.ownerLogin({ email, password });
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── HTTP Helper ───────────────────────────────────────────────────────────────

async function request<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data as T;
}

// Token management helpers
const getToken = (): string | null => localStorage.getItem('vendoros_token');
const saveToken = (token: string) => localStorage.setItem('vendoros_token', token);
const clearToken = () => localStorage.removeItem('vendoros_token');

const auth = {
  /** Register a new company Owner — sends Firebase ID token to backend */
  ownerSignup: (payload: {
    idToken: string;
    name: string;
    email: string;
    phone: string;
    companyName: string;
  }) => request('POST', '/api/auth/owner/signup', payload),

  /** Register a new Customer — sends Firebase ID token to backend */
  customerSignup: (payload: {
    idToken: string;
    name: string;
    email: string;
    phone?: string;
  }) => request('POST', '/api/auth/customer/signup', payload),

  /** Register a new Vendor (Manager/Worker) — sends Firebase ID token to backend */
  vendorSignup: (payload: {
    idToken: string;
    name: string;
    email: string;
    phone?: string;
    companyId: string;
    role: 'Manager' | 'Worker';
  }) => request<{ token: string; user: any }>('POST', '/api/auth/vendor/signup', payload),

  /** Unified login endpoint — sends Firebase ID token + category to backend */
  login: async (payload: { idToken: string; email: string; category: string }) => {
    const data = await request<{ token: string; user: any }>('POST', '/api/auth/login', payload);
    if (data.token) saveToken(data.token);
    return data;
  },

  /** Report failed login attempt */
  reportFailure: (payload: { email: string }) =>
    request('POST', '/api/auth/report-failure', payload),

  /** Clear stored token (logout) */
  logout: () => clearToken(),
};

const orders = {
  getAll: (page: number = 1, limit: number = 10) => request('GET', `/api/orders?page=${page}&limit=${limit}`, undefined, getToken() || undefined),

  getById: (id: string) =>
    request('GET', `/api/orders/${id}`, undefined, getToken() || undefined),

  create: (payload: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    products: Array<{ product: string; quantity: number }>;
  }) => request('POST', '/api/orders', payload, getToken() || undefined),

  update: (id: string, payload: Record<string, unknown>) =>
    request('PUT', `/api/orders/${id}`, payload, getToken() || undefined),

  delete: (id: string) =>
    request('DELETE', `/api/orders/${id}`, undefined, getToken() || undefined),

  assignManager: (orderId: string, managerId: string) =>
    request('PATCH', '/api/orders/assign-manager', { orderId, managerId }, getToken() || undefined),

  assignWorker: (orderId: string, workerId: string) =>
    request('PATCH', '/api/orders/assign-worker', { orderId, workerId }, getToken() || undefined),

  /** Worker: get my assigned orders */
  getMyOrders: () =>
    request('GET', '/api/orders/worker/my-orders', undefined, getToken() || undefined),

  /** Worker: update order status */
  updateStatus: (id: string, status: string) =>
    request('PATCH', `/api/orders/worker/${id}/status`, { status }, getToken() || undefined),

  /** Customer: get my orders */
  getCustomerOrders: () =>
    request('GET', '/api/customers/my-orders', undefined, getToken() || undefined),
};

// ─── Inventory API ────────────────────────────────────────────────────────────

const inventory = {
  getAll: () =>
    request('GET', '/api/inventory', undefined, getToken() || undefined),

  getById: (id: string) =>
    request('GET', `/api/inventory/${id}`, undefined, getToken() || undefined),

  create: (payload: {
    productName: string;
    category: string;
    sku: string;
    quantity: number;
    minimumStock?: number;
    price: number;
    unit: string;
  }) => request('POST', '/api/inventory', payload, getToken() || undefined),

  update: (id: string, payload: Record<string, unknown>) =>
    request('PUT', `/api/inventory/${id}`, payload, getToken() || undefined),

  delete: (id: string) =>
    request('DELETE', `/api/inventory/${id}`, undefined, getToken() || undefined),

  updateStock: (id: string, quantity: number) =>
    request('PATCH', `/api/inventory/${id}/stock`, { quantity }, getToken() || undefined),
};

// ─── Managers API ─────────────────────────────────────────────────────────────

const managers = {
  getAll: () =>
    request('GET', '/api/managers', undefined, getToken() || undefined),

  create: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => request('POST', '/api/managers/create', payload, getToken() || undefined),

  update: (id: string, payload: Record<string, unknown>) =>
    request('PUT', `/api/managers/${id}`, payload, getToken() || undefined),

  delete: (id: string) =>
    request('DELETE', `/api/managers/${id}`, undefined, getToken() || undefined),
};

// ─── Workers API ──────────────────────────────────────────────────────────────

const workers = {
  getAll: () =>
    request('GET', '/api/workers', undefined, getToken() || undefined),

  create: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => request('POST', '/api/workers/create', payload, getToken() || undefined),

  update: (id: string, payload: Record<string, unknown>) =>
    request('PUT', `/api/workers/${id}`, payload, getToken() || undefined),

  delete: (id: string) =>
    request('DELETE', `/api/workers/${id}`, undefined, getToken() || undefined),

  toggleAvailability: (id: string) =>
    request('PATCH', `/api/workers/${id}/availability`, undefined, getToken() || undefined),
};

// ─── Domains API ──────────────────────────────────────────────────────────────

const domains = {
  getAll: () =>
    request('GET', '/api/domains', undefined, getToken() || undefined),

  getById: (id: string) =>
    request('GET', `/api/domains/${id}`, undefined, getToken() || undefined),

  create: (payload: { name: string; type?: string }) =>
    request('POST', '/api/domains', payload, getToken() || undefined),

  update: (id: string, payload: { name?: string; type?: string; status?: string }) =>
    request('PUT', `/api/domains/${id}`, payload, getToken() || undefined),

  delete: (id: string) =>
    request('DELETE', `/api/domains/${id}`, undefined, getToken() || undefined),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

const dashboard = {
  /** Owner dashboard stats */
  getOwnerStats: () =>
    request('GET', '/api/dashboard/owner', undefined, getToken() || undefined),

  /** Manager dashboard stats */
  getManagerStats: () =>
    request('GET', '/api/manager-dashboard', undefined, getToken() || undefined),

  /** Company trust score */
  getTrustScore: () =>
    request('GET', '/api/trust-score', undefined, getToken() || undefined),
};

// ─── Risk Engine API ──────────────────────────────────────────────────────────

const risk = {
  analyze: (payload: {
    orderId?: string;
    deliveryDate: string;
    stagesRemaining: number;
    totalStages: number;
    assignedWorker?: {
      id: string;
      activeTaskCount: number;
      activeTaskLoadScore: number;
    };
  }) => request('POST', '/api/risk/analyze', payload, getToken() || undefined),
};

const users = {
  getProfile: () => request<{ success: boolean; user: any }>('GET', '/api/users/profile', undefined, getToken() || undefined),
  updateProfile: (payload: { name: string; phone?: string; role?: string; companyId?: string; email?: string }) =>
    request<{ success: boolean; user: any }>('PUT', '/api/users/profile', payload, getToken() || undefined),
  promote: (workerId: string) =>
    request<{ success: boolean; user: any }>('PATCH', '/api/users/promote', { workerId }, getToken() || undefined),
};

const joinRequests = {
  create: (payload: { companyId: string; role: string }) =>
    request<{ success: boolean; request: any }>('POST', '/api/join-requests', payload, getToken() || undefined),
  getPending: () =>
    request<{ success: boolean; requests: any[] }>('GET', '/api/join-requests/pending', undefined, getToken() || undefined),
  handle: (requestId: string, payload: { action: 'approve' | 'reject' }) =>
    request<{ success: boolean; request: any }>('PATCH', `/api/join-requests/${requestId}`, payload, getToken() || undefined),
  getMyPending: () =>
    request<{ success: boolean; request: any }>('GET', '/api/join-requests/my-pending', undefined, getToken() || undefined),
};

const companies = {
  getAll: () => request<{ success: boolean; companies: any[] }>('GET', '/api/companies'),
  updateMe: (payload: { description?: string; address?: string; minimumOrderValue?: number }) =>
    request<{ success: boolean; company: any }>('PATCH', '/api/companies/me', payload, getToken() || undefined),
};

const notifications = {
  getAll: () => request<{ success: boolean; notifications: any[] }>('GET', '/api/notifications', undefined, getToken() || undefined),
  markRead: (id: string) => request<{ success: boolean }>('PATCH', `/api/notifications/${id}/read`, undefined, getToken() || undefined),
  markAllRead: () => request<{ success: boolean }>('PATCH', '/api/notifications/read-all', undefined, getToken() || undefined),
};

// ─── Named export ─────────────────────────────────────────────────────────────

const api = {
  auth,
  users,
  joinRequests,
  companies,
  notifications,
  orders,
  inventory,
  managers,
  workers,
  domains,
  dashboard,
  risk,
  /** Raw request helper for custom calls */
  request,
  getToken,
  saveToken,
  clearToken,
};

export default api;
