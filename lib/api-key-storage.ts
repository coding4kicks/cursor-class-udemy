const API_KEY_STORAGE_KEY = 'validated_api_key';
const API_KEY_COOKIE_NAME = 'api_key';

export const apiKeyStorage = {
  save: (apiKey: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      // Also set as cookie for middleware
      document.cookie = `${API_KEY_COOKIE_NAME}=${apiKey}; path=/`;
    }
  },

  get: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_KEY_STORAGE_KEY);
    }
    return null;
  },

  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      // Remove cookie
      document.cookie = `${API_KEY_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    }
  }
};
