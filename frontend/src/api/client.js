// Centralized API client for communicating with backend
// Uses VITE_API_URL if configured, otherwise defaults to local backend at http://localhost:5000

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Ensure no trailing slash
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('fee_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Normalize endpoint: ensure starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Ensure we don't accidentally duplicate /api if already present
  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data.message ||
        `Request failed with status ${response.status} (${response.statusText})`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${path}]:`, error.message);
    throw error;
  }
}

// Convenience methods
export const api = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
};
