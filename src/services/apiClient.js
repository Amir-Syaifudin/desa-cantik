const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const TOKEN_KEY = 'desaCantikToken';
const ROLE_KEY = 'desaCantikRole';

const getTokenFromStorage = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const buildUrl = (path, params) => {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value);
      }
    });
  }
  return url.toString();
};

const request = async (method, path, { data, params, headers } = {}) => {
  const url = buildUrl(path, params);
  const requestHeaders = new Headers(headers || {});
  
  const token = getTokenFromStorage();
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = data instanceof FormData;
  if (data && !isFormData && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });

    if (response.status === 401) {
      apiClient.clearToken();
      if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
      }
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok || (json && json.success === false)) {
      const errorMessage =
        json.message ||
        (json.errors ? Object.values(json.errors).flat().join(', ') : null) ||
        `Request failed with status ${response.status}`;
        
      throw new Error(errorMessage);
    }

    return json;

  } catch (error) {
    console.error(`API Error (${method} ${path}):`, error);
    throw error;
  }
};

const setAuthSession = (token, role) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      if (role) localStorage.setItem(ROLE_KEY, role);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
    }
  } catch (e) {
    console.error("Storage Error:", e);
  }
};

export const apiClient = {
  get: (path, options) => request('GET', path, options),
  post: (path, data, options = {}) => request('POST', path, { ...options, data }),
  put: (path, data, options = {}) => request('PUT', path, { ...options, data }),
  delete: (path, options) => request('DELETE', path, options),
  
  setAuthSession, 
  clearToken: () => setAuthSession(null),
  getToken: getTokenFromStorage,
  getRole: () => localStorage.getItem(ROLE_KEY)
};