import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ============================================
// AXIOS CLIENT (Primary - with interceptors)
// ============================================
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - inject auth token
api.interceptors.request.use((config: any) => {
  // Normalize url to prevent duplicate /api prefix
  if (config.url && config.url.startsWith('/api/')) {
    config.url = config.url.substring(4);
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle 401 & errors
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// FETCH-BASED FUNCTION (Special cases - FormData, custom headers)
// ============================================
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const normalizedEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };

  // Only set Content-Type to JSON if body is NOT FormData
  if (!(options?.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API request failed (${response.status})`;
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || JSON.stringify(error);
      console.warn(`[API ${response.status}] ${errorMessage}`);
    } catch {
      console.warn(`[API Error] ${response.status} ${response.statusText} (no JSON body)`);
      errorMessage = `Server error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// Default export for backward compatibility
export default api;