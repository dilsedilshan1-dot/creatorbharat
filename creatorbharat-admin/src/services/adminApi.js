// 🛡️ CreatorBharat SaaS Admin API Client
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

export class AdminApi {
  static getToken() {
    return localStorage.getItem('cb_admin_token') || sessionStorage.getItem('cb_admin_token') || '';
  }

  static setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('cb_admin_token', token);
    } else {
      sessionStorage.setItem('cb_admin_token', token);
    }
  }

  static clearToken() {
    localStorage.removeItem('cb_admin_token');
    sessionStorage.removeItem('cb_admin_token');
  }

  static async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (response.status === 401) {
        this.clearToken();
        window.dispatchEvent(new Event('cb_admin_unauthorized'));
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data.error || data.message || `Request failed with status ${response.status}`;
        const error = new Error(message);
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Backend server is unreachable. Please verify network connectivity.');
      }
      throw err;
    }
  }

  // ─── API Endpoints ────────────────────────────────────────────────────────
  static async fetchAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/admin/audit-logs${query ? `?${query}` : ''}`);
  }

  static async reviewKyc(creatorId, { decision, reason }) {
    return this.request(`/api/admin/kyc/review/${creatorId}`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason })
    });
  }

  static async toggleUserSuspension(userId) {
    return this.request(`/api/admin/users/suspend/${userId}`, {
      method: 'POST'
    });
  }

  static async fetchSystemDiagnostics() {
    return this.request('/api/admin/system/diagnostics');
  }
}
