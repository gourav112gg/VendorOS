/**
 * VendorOS Super Admin API Client
 * Completely isolated from regular user API calls and token storage.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAdminToken = (): string | null => localStorage.getItem('vendoros_admin_token');
const saveAdminToken = (token: string) => localStorage.setItem('vendoros_admin_token', token);
const clearAdminToken = () => localStorage.removeItem('vendoros_admin_token');

async function adminRequest<T = any>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAdminToken();
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
    throw new Error(data.message || `Admin request failed: ${res.status}`);
  }

  return data as T;
}

export const adminApi = {
  // Auth
  login: async (payload: { email: string; password: string; passphrase: string }) => {
    const data = await adminRequest<{ success: boolean; token: string; admin: any }>('POST', '/api/admin/auth/login', payload);
    if (data.token) saveAdminToken(data.token);
    return data;
  },

  getMe: () => adminRequest<{ success: boolean; admin: any }>('GET', '/api/admin/auth/me'),

  logout: () => clearAdminToken(),

  // Analytics & Directories
  getStats: () => adminRequest<{ success: boolean; stats: any }>('GET', '/api/admin/stats'),

  getCompanies: () => adminRequest<{ success: boolean; count: number; companies: any[] }>('GET', '/api/admin/companies'),

  getUsers: () => adminRequest<{ success: boolean; count: number; users: any[] }>('GET', '/api/admin/users'),

  getAuditLogs: () => adminRequest<{ success: boolean; count: number; logs: any[] }>('GET', '/api/admin/audit-logs'),

  // Subscription Override Actions
  updateSubscriptionOverride: (companyId: string, tier: 'free' | 'growth' | 'scale') =>
    adminRequest<{ success: boolean; message: string; company: any }>('PATCH', `/api/admin/companies/${companyId}/subscription`, { tier }),

  clearSubscriptionOverride: (companyId: string) =>
    adminRequest<{ success: boolean; message: string; company: any }>('PATCH', `/api/admin/companies/${companyId}/subscription/clear-override`),

  // Company Management Actions
  toggleSuspension: (companyId: string) =>
    adminRequest<{ success: boolean; message: string; company: any }>('PATCH', `/api/admin/companies/${companyId}/suspend`),

  deleteCompany: (companyId: string, confirmName: string) =>
    adminRequest<{ success: boolean; message: string }>('DELETE', `/api/admin/companies/${companyId}`, { confirmName }),

  getAdminToken,
};

export default adminApi;
