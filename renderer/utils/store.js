import { ALLOWED_STORE_KEYS, MAX_STORE_VALUE_SIZE } from '../shared/constants.js';
import { isElectron, getPlatform } from './platform.js';

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

// IndexedDB存储适配器（用于安卓和iOS平台）
class IndexedDBStore {
  constructor() {
    this.dbName = 'calculate_JYY';
    this.storeName = 'calculator_data';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get(key, defaultValue) {
    assertAllowedKey(key);
    
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result !== undefined ? result : defaultValue);
      };
    });
  }

  async set(key, value) {
    assertAllowedKey(key);
    if (!isValidStoreValue(value)) {
      throw new Error('Invalid store value');
    }
    
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key) {
    assertAllowedKey(key);
    
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// localStorage存储适配器（用于Web平台）
class LocalStorageStore {
  async get(key, defaultValue) {
    assertAllowedKey(key);
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  async set(key, value) {
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
  }

  async delete(key) {
    assertAllowedKey(key);
    localStorage.removeItem(key);
  }
}

// 存储工厂
function createStoreAdapter() {
  const platform = getPlatform();
  
  // Electron环境使用原生存储
  if (isElectron()) {
    return window.electronAPI.store;
  }
  
  // 安卓和iOS平台使用IndexedDB（更好的性能和容量）
  if (platform === 'android' || platform === 'ios') {
    return new IndexedDBStore();
  }
  
  // Web平台使用localStorage
  return new LocalStorageStore();
}

export function createStore() {
  return createStoreAdapter();
}
