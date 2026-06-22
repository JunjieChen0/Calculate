const { contextBridge, ipcRenderer } = require('electron');

const ALLOWED_STORE_KEYS = [
  'calculator_settings',
  'calculator_memory',
  'calculator_history',
  'calculator_theme'
];

function assertAllowedKey(key) {
  if (typeof key !== 'string' || !ALLOWED_STORE_KEYS.includes(key)) {
    throw new Error('Invalid store key');
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key, defaultValue) => {
      assertAllowedKey(key);
      return ipcRenderer.invoke('store-get', key, defaultValue);
    },
    set: (key, value) => {
      assertAllowedKey(key);
      return ipcRenderer.invoke('store-set', key, value);
    },
    delete: key => {
      assertAllowedKey(key);
      return ipcRenderer.invoke('store-delete', key);
    }
  }
});
