// ============================================================
// TRIMORA — Secure Backend API Client
// Connects frontend to Express backend + Neon PostgreSQL with JWT Auth
// ============================================================

export interface DbHealthResponse {
  status: string;
  serverTime: string;
  neonDatabase: {
    isConfigured: boolean;
    connected: boolean;
    message: string;
    version: string | null;
  };
}

let _isServerReachable: boolean | null = null;
let _isNeonConnected: boolean | null = null;
let _lastCheckTime = 0;

export const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem('trimora_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const getHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const checkBackendHealth = async (force = false): Promise<{ serverOnline: boolean; neonConnected: boolean; message: string }> => {
  const now = Date.now();
  if (!force && _isServerReachable !== null && now - _lastCheckTime < 10000) {
    return {
      serverOnline: _isServerReachable,
      neonConnected: _isNeonConnected ?? false,
      message: _isNeonConnected ? 'Connected to Neon DB' : 'Backend online (Neon DB pending config)',
    };
  }

  try {
    const res = await fetch('/api/health', {
      method: 'GET',
      headers: getHeaders(),
    });
    if (res.ok) {
      const data: DbHealthResponse = await res.json();
      _isServerReachable = true;
      _isNeonConnected = data.neonDatabase.connected;
      _lastCheckTime = now;
      return {
        serverOnline: true,
        neonConnected: data.neonDatabase.connected,
        message: data.neonDatabase.message,
      };
    } else {
      _isServerReachable = false;
      _isNeonConnected = false;
      return {
        serverOnline: false,
        neonConnected: false,
        message: 'Backend server returned non-200 status',
      };
    }
  } catch {
    _isServerReachable = false;
    _isNeonConnected = false;
    return {
      serverOnline: false,
      neonConnected: false,
      message: 'Backend server offline (using fallback mock data)',
    };
  }
};

export const apiClient = {
  async get<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(`/api${url}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (res.status === 401) {
        // If unauthorized/expired token on a protected endpoint, trigger event
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        return null;
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async post<T>(url: string, data: any): Promise<T | null> {
    try {
      const res = await fetch(`/api${url}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (errData?.error) {
          throw new Error(errData.error);
        }
        return null;
      }
      return await res.json();
    } catch (err: any) {
      if (err.message) throw err;
      return null;
    }
  },

  async put<T>(url: string, data: any): Promise<T | null> {
    try {
      const res = await fetch(`/api${url}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async patch<T>(url: string, data: any): Promise<T | null> {
    try {
      const res = await fetch(`/api${url}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async delete<T>(url: string): Promise<T | null> {
    try {
      const res = await fetch(`/api${url}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },
};
