# 01 - 项目整体架构

## 架构总览

`calculate_JYY` 采用经典的 **Electron 多进程架构**：

```
┌──────────────────────────────────────────────────────────────┐
│                      Electron 进程模型                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────┐    IPC    ┌──────────────────────┐   │
│   │   主进程 (Node)    │◄────────►│   预加载脚本 (隔离)    │   │
│   │   main.cjs        │          │   preload.cjs         │   │
│   │                   │          │   contextBridge →     │   │
│   │ • BrowserWindow   │          │   window.electronAPI  │   │
│   │ • ipcMain         │          │                       │   │
│   │ • electron-store  │          └──────────┬────────────┘   │
│   └──────────────────┘                     │                 │
│                                            │ window.* API    │
│                                            ▼                 │
│                            ┌──────────────────────────────┐ │
│                            │   渲染进程 (Chromium + Vite)  │ │
│                            │                              │ │
│                            │  renderer/                   │ │
│                            │   ├ app.js (入口)             │ │
│                            │   ├ calculator.js (核心)     │ │
│                            │   ├ modules/ (UI 组件)        │ │
│                            │   └ utils/ (工具)             │ │
│                            └──────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 进程职责

### 主进程（`main.cjs`）

- 创建 `BrowserWindow` 加载前端（开发态 `http://localhost:5173`，生产态 `dist/renderer/index.html`）
- 注册 IPC 处理器：`store-get` / `store-set` / `store-delete`
- 通过 `electron-store` 实现本地持久化（**白名单 key 校验**，**值大小上限 1MB**，**仅允许主帧访问**）
- 安全策略：
  - `nodeIntegration: false`
  - `contextIsolation: true`
  - `sandbox: true`
  - CSP 在 `renderer/index.html` 中声明
  - 阻止外部跳转（`will-navigate`）和 `window.open`
- 开发态自动打开 DevTools

### 预加载脚本（`preload.cjs`）

- 通过 `contextBridge.exposeInMainWorld('electronAPI', { store: { get, set, delete } })`
- 对 key 进行白名单断言，IPC 与主进程一一对应
- 渲染层只看到 `window.electronAPI.store` 这一狭窄桥

### 渲染进程（`renderer/`）

- 纯前端 ES Module，由 Vite 打包到 `dist/renderer/`
- 单页结构，HTML 内声明所有侧边栏 DOM
- 启动入口：[`app.js`](../renderer/app.js) → `init()` 串联主题 / 历史 / 内存 / 设置 / 面板管理器的初始化

## 安全模型

| 风险面 | 防御措施 |
|--------|----------|
| Node 能力泄漏到渲染层 | `nodeIntegration: false` + `sandbox: true` |
| 渲染层访问主进程任意 API | `contextIsolation: true` + `contextBridge` 暴露最小集 |
| 主进程接受任意 key | `ALLOWED_STORE_KEYS` 白名单 |
| 主进程接受超大值 | `JSON.stringify(...).length ≤ 1MB` |
| 任意 frame 触发 IPC | 仅接受主帧（`!event.senderFrame.parent`） |
| 外部跳转 | `will-navigate` 阻止 + `setWindowOpenHandler` 拒绝 |
| 远程脚本 | CSP `default-src 'self'` |

## 数据流

```
用户输入（按键 / 点击）
       │
       ▼
  app.js（状态：currentInput / cursorIndex）
       │
       ▼
  mode.js → getHelperText()  将 UI 标签翻译成表达式片段
       │
       ▼
  display.js → inputToLatex() + KaTeX.render() 实时预览
       │
       ▼  Enter / =
  calculator.js → evaluateExpression(expr, mode)
       │  ├─ applyAngleConversions()（DEG/GRAD 注入）
       │  ├─ handleSpecialFunctions()（ratio/polar/rect）
       │  └─ switch(mode)：base/vector/complex/matrix/solve/convert/stats/standard
       │
       ▼
  formatResult()：精度 / FIX / SCI / 工程符号 / 分数模式 / 复数 / 矩阵
       │
       ▼
  display.js 渲染结果
       │
       ▼
  history.addHistory()  写入 store（持久化）
       │
       ▼
  状态机回到 idle，等待下一轮输入
```

## 状态持久化

四个 key 通过 `electron-store` 持久化到磁盘（OS 用户目录下）：

| Key | 持有者 | 内容 |
|-----|--------|------|
| `calculator_settings` | `SettingsManager` | 精度、显示格式、角度模式、工程符号、分数模式、当前进制、括号自动补全 |
| `calculator_memory` | `MemoryManager` | `{ value, hasMemory }` |
| `calculator_history` | `history.js` | 历史条目（最多 100 条） |
| `calculator_theme` | `theme.js` | `'dark'` / `'light'` |

非 Electron 环境（如浏览器调试）会自动降级到 `localStorage`（见 [`utils/store.js`](../renderer/utils/store.js#L33-L66)）。

## 构建与运行管线

```
src:  renderer/*.js (ESM)
       │
       ▼ Vite (vite.config.js)
dist: dist/renderer/*
       │
       ▼ electron-builder (electron-builder.yml)
pkg:  dist/*.exe / *.dmg / *.AppImage / *.deb
```

详见 [07-running.md](./07-running.md)。