const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { ALLOWED_STORE_KEYS, MAX_STORE_VALUE_SIZE } = require('./shared/constants.cjs');

let mainWindow;
let store;

const isDev =
  process.env.NODE_ENV === 'development' ||
  (process.env.NODE_ENV !== 'production' && !app.isPackaged);

function isAllowedStoreKey(key) {
  return typeof key === 'string' && ALLOWED_STORE_KEYS.includes(key);
}

function isValidStoreValue(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' && serialized.length <= MAX_STORE_VALUE_SIZE;
  } catch {
    return false;
  }
}

function isMainFrame(event) {
  try {
    return !event.senderFrame || !event.senderFrame.parent;
  } catch {
    return false;
  }
}

async function createStore() {
  const { default: Store } = await import('electron-store');
  store = new Store();

  ipcMain.handle('store-get', (event, key, defaultValue) => {
    if (!isMainFrame(event)) {
      throw new Error('Access denied');
    }
    if (!isAllowedStoreKey(key)) {
      throw new Error('Invalid store key');
    }
    return store.get(key, defaultValue);
  });

  ipcMain.handle('store-set', (event, key, value) => {
    if (!isMainFrame(event)) {
      throw new Error('Access denied');
    }
    if (!isAllowedStoreKey(key)) {
      throw new Error('Invalid store key');
    }
    if (!isValidStoreValue(value)) {
      throw new Error('Invalid store value');
    }
    store.set(key, value);
  });

  ipcMain.handle('store-delete', (event, key) => {
    if (!isMainFrame(event)) {
      throw new Error('Access denied');
    }
    if (!isAllowedStoreKey(key)) {
      throw new Error('Invalid store key');
    }
    store.delete(key);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 800,
    minWidth: 380,
    minHeight: 640,
    title: 'calculate_JYY',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    show: false,
    backgroundColor: '#1e1e2e'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
  }

  mainWindow.webContents.on('will-navigate', (event, url) => {
    try {
      const parsed = new URL(url);
      if (isDev) {
        if (parsed.origin !== 'http://localhost:5173') {
          event.preventDefault();
        }
      } else {
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await createStore();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
