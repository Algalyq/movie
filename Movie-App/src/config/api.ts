// Base URL configuration for API endpoints
export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.17:8000',
  API_PREFIX: '/api',
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const url = new URL(API_CONFIG.BASE_URL);
  url.pathname = `${API_CONFIG.API_PREFIX}${endpoint}`;
  return url.toString();
};
