# 02 - 主进程与预加载脚本

## 2.1 `main.cjs`

Electron 主进程入口（CommonJS 模块），负责窗口创建、安全策略、IPC 路由、持久化存储。

### 常量

| 名称                   | 用途                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ALLOWED_STORE_KEYS`   | 允许持久化的 key 白名单：`calculator_settings` / `calculator_memory` / `calculator_history` / `calculator_theme` |
| `MAX_STORE_VALUE_SIZE` | 单个 value 序列化后字节上限 = 1MB                                                                                |
| `isDev`                | 判定逻辑：`NODE_ENV === 'development'` 或（未打包且非 production）                                               |

### 工具函数

#### `isAllowedStoreKey(key)` — [main.cjs#L19-L21](../main.cjs#L19-L21)

类型与白名单双重校验。

#### `isValidStoreValue(value)` — [main.cjs#L23-L30](../main.cjs#L23-L30)

`JSON.stringify` 能成功且序列化长度 ≤ 1MB。

#### `isMainFrame(event)` — [main.cjs#L32-L38](../main.cjs#L32-L38)

通过 `event.senderFrame.parent` 判定是否为主 frame，阻止子 frame 绕过安全策略。

### 异步初始化：`createStore()` — [main.cjs#L40-L76](../main.cjs#L40-L76)

1. 动态 `import('electron-store')`（主进程仍走 CommonJS，ESM 兼容）
2. 注册三个 IPC 处理器，每个都执行：
   - `isMainFrame(event)` —— 拒绝子 frame
   - `isAllowedStoreKey(key)` —— 拒绝非白名单
   - `isValidStoreValue(value)`（仅 set）—— 拒绝超大值

| IPC 通道       | 行为                           |
| -------------- | ------------------------------ |
| `store-get`    | `store.get(key, defaultValue)` |
| `store-set`    | `store.set(key, value)`        |
| `store-delete` | `store.delete(key)`            |

### 窗口创建：`createWindow()` — [main.cjs#L78-L128](../main.cjs#L78-L128)

`BrowserWindow` 配置：

| 项                     | 值                                                                 |
| ---------------------- | ------------------------------------------------------------------ |
| `width × height`       | 520 × 800                                                          |
| `minWidth × minHeight` | 380 × 640                                                          |
| `title`                | `calculate_JYY`                                                    |
| `nodeIntegration`      | `false`                                                            |
| `contextIsolation`     | `true`                                                             |
| `sandbox`              | `true`                                                             |
| `preload`              | `preload.cjs`                                                      |
| `backgroundColor`      | `#1e1e2e`（深色底，避免启动白闪）                                  |
| `show`                 | `false`（等 `ready-to-show` 再显示，避免内容未加载完成的视觉抖动） |

加载逻辑：

```js
if (isDev) {
  mainWindow.loadURL('http://localhost:5173');
  mainWindow.webContents.openDevTools();
} else {
  mainWindow.loadFile(path.join(__dirname, 'dist/renderer/index.html'));
}
```

安全拦截：

- `will-navigate` — 开发态限制 origin 为 `http://localhost:5173`，生产态全部 `preventDefault()`
- `setWindowOpenHandler` — 一律返回 `{ action: 'deny' }`
- `closed` — 清空 `mainWindow` 引用

### 应用生命周期

| 钩子                        | 行为                                         |
| --------------------------- | -------------------------------------------- |
| `app.whenReady().then(...)` | 顺序执行：`createStore()` → `createWindow()` |
| `window-all-closed`         | 非 macOS 平台 `app.quit()`                   |
| `activate`                  | macOS 重新激活时若无窗口则重建               |

---

## 2.2 `preload.cjs`

预加载脚本：在 `contextIsolation: true` 的隔离世界里，仅暴露经过白名单的窄 API。

### `ALLOWED_STORE_KEYS` — [preload.cjs#L3-L8](../preload.cjs#L3-L8)

与主进程同源的白名单。

### `assertAllowedKey(key)` — [preload.cjs#L10-L14](../preload.cjs#L10-L14)

渲染层调用前的二次白名单断言，防止通过 DevTools 注入非法 key。

### `window.electronAPI.store`

| 方法                     | 签名                            | 行为                                             |
| ------------------------ | ------------------------------- | ------------------------------------------------ |
| `get(key, defaultValue)` | `(string, any) → Promise<any>`  | 转发到 `ipcRenderer.invoke('store-get', ...)`    |
| `set(key, value)`        | `(string, any) → Promise<void>` | 转发到 `ipcRenderer.invoke('store-set', ...)`    |
| `delete(key)`            | `(string) → Promise<void>`      | 转发到 `ipcRenderer.invoke('store-delete', ...)` |

任何 key 抛 `Invalid store key`。

---

## 2.3 渲染层与主进程的接口契约

```ts
// 类型化伪签名
interface ElectronAPIStore {
  get<T>(key: 'calculator_settings' | 'calculator_memory' | 'calculator_history' | 'calculator_theme', defaultValue: T): Promise<T>;
  set(key: ..., value: unknown): Promise<void>;
  delete(key: ...): Promise<void>;
}
```

渲染层通过 [`renderer/utils/store.js`](../renderer/utils/store.js) 的 `createStore()` 工厂获取该实例；当 `window.electronAPI.store` 不存在（例如纯浏览器调试）时，回落到 `localStorage` 实现，保证单测与外部开发可用。
