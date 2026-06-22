const ALLOWED_STORE_KEYS = [
  'calculator_settings',
  'calculator_memory',
  'calculator_history',
  'calculator_theme'
];

const MAX_STORE_VALUE_SIZE = 1024 * 1024; // 1MB

function assertAllowedKey(key) {
  if (typeof key !== 'string' || !ALLOWED_STORE_KEYS.includes(key)) {
    throw new Error('Invalid store key');
  }
}

function hasNaN(value) {
  if (typeof value === 'number' && Number.isNaN(value)) return true;
  if (Array.isArray(value)) return value.some(hasNaN);
  if (value && typeof value === 'object') return Object.values(value).some(hasNaN);
  return false;
}

function isValidStoreValue(value) {
  try {
    if (hasNaN(value)) return false;
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' && serialized.length <= MAX_STORE_VALUE_SIZE;
  } catch {
    return false;
  }
}

export function createStore() {
  if (window.electronAPI && window.electronAPI.store) {
    return window.electronAPI.store;
  }

  return {
    get: async (key, defaultValue) => {
      assertAllowedKey(key);
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    set: async (key, value) => {
      assertAllowedKey(key);
      if (!isValidStoreValue(value)) {
        throw new Error('Invalid store value');
      }
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          throw new Error('Storage quota exceeded', { cause: error });
        }
        throw error;
      }
    },
    delete: async key => {
      assertAllowedKey(key);
      localStorage.removeItem(key);
    }
  };
}
