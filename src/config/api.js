const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://160.191.245.237/api';

// Derive root (without trailing /api) to support services that live at domain root
const API_ROOT_URL = (() => {
  try {
    if (API_BASE_URL.endsWith('/api')) return API_BASE_URL.slice(0, -4);
    if (API_BASE_URL.endsWith('/api/')) return API_BASE_URL.slice(0, -5);
    return API_BASE_URL;
  } catch {
    return API_BASE_URL;
  }
})();

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export const getApiRootUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_ROOT_URL}/${cleanEndpoint}`;
};

export default API_BASE_URL;




