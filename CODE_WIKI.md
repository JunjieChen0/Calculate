# calculate_JYY Code Wiki

> 图形化科学计算器项目技术文档

---

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈与依赖](#2-技术栈与依赖)
- [3. 项目架构](#3-项目架构)
  - [3.1 整体架构图](#31-整体架构图)
  - [3.2 目录结构](#32-目录结构)
  - [3.3 进程模型](#33-进程模型)
- [4. 核心模块详解](#4-核心模块详解)
  - [4.1 主进程 (main.cjs)](#41-主进程-maincjs)
  - [4.2 预加载脚本 (preload.cjs)](#42-预加载脚本-preloadcjs)
  - [4.3 渲染进程入口 (app.js)](#43-渲染进程入口-appjs)
  - [4.4 计算引擎 (calculator/engine.js)](#44-计算引擎-calculatorenginejs)
  - [4.5 状态管理 (calculator/state.js)](#45-状态管理-calculatorstatejs)
  - [4.6 结果格式化 (calculator/formatter.js)](#46-结果格式化-calculatorformatterjs)
- [5. 计算模式模块](#5-计算模式模块)
  - [5.1 标准模式](#51-标准模式)
  - [5.2 复数模式](#52-复数模式)
  - [5.3 矩阵模式](#53-矩阵模式)
  - [5.4 向量模式 (calculator/vector.js)](#54-向量模式-calculatorvectorjs)
  - [5.5 求解模式 (calculator/solve.js)](#55-求解模式-calculatorsolvejs)
  - [5.6 进制模式 (calculator/base.js)](#56-进制模式-calculatorbasejs)
  - [5.7 单位换算模式](#57-单位换算模式)
  - [5.8 统计模式](#58-统计模式)
- [6. 数学功能模块](#6-数学功能模块)
  - [6.1 微积分 (calculator/calculus.js)](#61-微积分-calculatorcalculusjs)
  - [6.2 概率分布 (calculator/probability.js)](#62-概率分布-calculatorprobabilityjs)
  - [6.3 回归分析 (calculator/regression.js)](#63-回归分析-calculatorregressionjs)
  - [6.4 数论 (calculator/number-theory.js)](#64-数论-calculatornumber-theoryjs)
  - [6.5 特殊函数 (calculator/special-functions.js)](#65-特殊函数-calculatorspecial-functionsjs)
- [7. UI 模块](#7-ui-模块)
  - [7.1 面板管理器 (modules/panel.js)](#71-面板管理器-modulespaneljs)
  - [7.2 设置管理器 (modules/settings.js)](#72-设置管理器-modulessettingsjs)
  - [7.3 记忆管理器 (modules/memory.js)](#73-记忆管理器-modulesmemoryjs)
  - [7.4 显示模块 (modules/display.js)](#74-显示模块-modulesdisplayjs)
  - [7.5 模式与辅助面板 (modules/mode.js)](#75-模式与辅助面板-modulesmodejs)
  - [7.6 历史记录 (history.js)](#76-历史记录-historyjs)
  - [7.7 公式渲染器 (formula-renderer.js)](#77-公式渲染器-formula-rendererjs)
  - [7.8 数值表格与绘图 (modules/table.js, modules/plot.js)](#78-数值表格与绘图-modulestablejs-modulesplotjs)
- [8. 核心基础设施](#8-核心基础设施)
  - [8.1 事件总线 (core/event-bus.js)](#81-事件总线-coreevent-busjs)
  - [8.2 响应式状态 (core/state.js)](#82-响应式状态-corestatejs)
  - [8.3 错误处理 (core/errors.js)](#83-错误处理-coreerrorsjs)
  - [8.4 日志系统 (core/logger.js)](#84-日志系统-coreloggerjs)
  - [8.5 国际化 (core/i18n.js)](#85-国际化-corei18njs)
- [9. 工具模块](#9-工具模块)
  - [9.1 存储适配器 (utils/store.js)](#91-存储适配器-utilsstorejs)
  - [9.2 平台检测 (utils/platform.js)](#92-平台检测-utilsplatformjs)
  - [9.3 输入处理 (app/input-handler.js)](#93-输入处理-appinput-handlerjs)
  - [9.4 撤销管理 (app/undo-manager.js)](#94-撤销管理-appundo-managerjs)
  - [9.5 键盘处理 (keyboard.js)](#95-键盘处理-keyboardjs)
- [10. 数据流与依赖关系](#10-数据流与依赖关系)
  - [10.1 模块依赖图](#101-模块依赖图)
  - [10.2 计算请求数据流](#102-计算请求数据流)
- [11. 构建与运行](#11-构建与运行)
  - [11.1 环境要求](#111-环境要求)
  - [11.2 安装依赖](#112-安装依赖)
  - [11.3 开发模式](#113-开发模式)
  - [11.4 生产构建](#114-生产构建)
  - [11.5 测试](#115-测试)
  - [11.6 代码质量](#116-代码质量)
- [12. 跨平台支持](#12-跨平台支持)
  - [12.1 Electron (桌面)](#121-electron-桌面)
  - [12.2 Web 浏览器](#122-web-浏览器)
  - [12.3 Android (Capacitor)](#123-android-capacitor)
- [13. 安全机制](#13-安全机制)
- [14. 关键常量配置](#14-关键常量配置)

---

## 1. 项目概述

**calculate_JYY** 是一款功能完整的图形化科学计算器，对标卡西欧 fx-991 系列。支持 8 种计算模式、LaTeX 实时公式渲染、深色/浅色主题切换、完整历史记录管理、内置常量库以及数值表格与函数绘图功能。

**核心特性：**

- 8 种计算模式：标准、复数、矩阵、向量、求解、进制、换算、统计
- LaTeX 实时公式预览（基于 KaTeX）
- 函数图像绘制（基于 Chart.js）
- 多平台支持：Electron 桌面、Web 浏览器、Android (Capacitor)
- 深色/浅色主题（Catppuccin 配色方案）
- 完整的撤销/重做和历史记录系统
- 变量存储（A-Z）和自定义函数（f, g, h）
- 内置 24 个物理/数学/天文常量
- PWA 支持（manifest.json + Service Worker）

---

## 2. 技术栈与依赖

### 运行时依赖

| 依赖                 | 版本     | 用途                                                   |
| -------------------- | -------- | ------------------------------------------------------ |
| `mathjs`             | ^13.0.0  | 核心数学计算引擎，提供表达式解析、矩阵运算、复数运算等 |
| `katex`              | ^0.16.10 | LaTeX 数学公式渲染                                     |
| `chart.js`           | ^4.5.1   | 函数图像绘制                                           |
| `electron-store`     | ^10.0.0  | Electron 环境下的持久化存储                            |
| `@capacitor/core`    | 6.2.1    | Android 原生应用打包                                   |
| `@capacitor/android` | 6.2.1    | Android 平台支持                                       |

### 开发依赖

| 依赖               | 版本     | 用途              |
| ------------------ | -------- | ----------------- |
| `electron`         | ^36.0.0  | 桌面应用框架      |
| `vite`             | ^8.0.16  | 前端构建工具      |
| `vitest`           | ^4.1.9   | 单元测试框架      |
| `eslint`           | ^10.5.0  | 代码检查          |
| `prettier`         | ^3.8.4   | 代码格式化        |
| `husky`            | ^9.1.7   | Git hooks 管理    |
| `electron-builder` | ^26.0.12 | Electron 应用打包 |
| `jsdom`            | ^29.1.1  | 测试环境 DOM 模拟 |

---

## 3. 项目架构

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Electron 主进程                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  main.cjs    │  │ preload.cjs  │  │  electron-store          │  │
│  │  BrowserWindow│  │ contextBridge│  │  持久化存储              │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │ IPC
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        渲染进程 (renderer/)                         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      app.js (应用入口)                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │ EventBus │ │Reactive- │ │UndoManager│ │Expression-   │  │   │
│  │  │          │ │State     │ │          │ │History       │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    calculator.js (API 层)                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │ engine.js│ │ state.js │ │formatter │ │special-funcs │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                    │                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ standard │ │ complex  │ │ matrix   │ │ vector   │ │ solve  │ │
│  │ (mathjs) │ │ (mathjs) │ │ (mathjs) │ │vector.js │ │solve.js│ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                         │
│  │   base   │ │ convert  │ │  stats   │                         │
│  │ base.js  │ │ (mathjs) │ │ (mathjs) │                         │
│  └──────────┘ └──────────┘ └──────────┘                         │
│                                    │                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      UI 模块 (modules/)                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │  panel   │ │ settings │ │  memory  │ │   display    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │   mode   │ │  table   │ │   plot   │ │   history    │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 目录结构

```
calculate/
├── .github/workflows/          # CI/CD 配置
│   └── ci.yml
├── .husky/                     # Git hooks
│   └── pre-commit
├── assets/icons/               # 应用图标
├── docs/                       # 项目文档
├── renderer/                   # 渲染进程源码（核心业务逻辑）
│   ├── app/                    # 应用层逻辑
│   │   ├── expression-history.js   # 表达式历史导航
│   │   ├── input-handler.js        # 输入处理工具函数
│   │   └── undo-manager.js         # 撤销栈管理
│   ├── calculator/             # 计算引擎模块
│   │   ├── angle-utils.js          # 角度转换工具
│   │   ├── base.js                 # 进制模式
│   │   ├── calculus.js             # 微积分（导数/积分/求和/求积）
│   │   ├── engine.js               # 核心求值引擎
│   │   ├── formatter.js            # 结果格式化
│   │   ├── index.js                # calculator 子模块导出
│   │   ├── math-instance.js        # mathjs 全局单例
│   │   ├── number-theory.js        # 数论（GCD/LCM/因式分解/不等式）
│   │   ├── probability.js          # 概率分布函数
│   │   ├── regression.js           # 回归分析
│   │   ├── solve.js                # 方程求解
│   │   ├── special-functions.js    # 特殊函数分发器
│   │   ├── state.js                # 计算器状态管理
│   │   └── vector.js               # 向量运算
│   ├── core/                   # 核心基础设施
│   │   ├── i18n/                   # 国际化资源
│   │   │   ├── en.js
│   │   │   └── zh.js
│   │   ├── errors.js               # 错误处理系统
│   │   ├── event-bus.js            # 事件总线
│   │   ├── i18n.js                 # 国际化模块
│   │   ├── logger.js               # 日志系统
│   │   └── state.js                # 响应式状态管理
│   ├── modules/                # UI 功能模块
│   │   ├── constants-panel.js      # 常量库面板
│   │   ├── display.js              # 显示更新
│   │   ├── help.js                 # 帮助面板
│   │   ├── history-panel.js        # 历史记录面板
│   │   ├── memory.js               # 记忆功能
│   │   ├── modal.js                # 模态对话框
│   │   ├── mode.js                 # 模式切换与辅助面板
│   │   ├── panel.js                # 面板管理器
│   │   ├── plot.js                 # 函数绘图
│   │   ├── qrcode.js               # 二维码生成
│   │   ├── settings.js             # 设置管理
│   │   ├── spreadsheet.js          # 电子表格
│   │   ├── stats-editor.js         # 统计数据编辑器
│   │   ├── table.js                # 数值表格
│   │   └── variables-panel.js      # 变量面板
│   ├── shared/                 # 共享常量
│   │   └── constants.js
│   ├── utils/                  # 工具函数
│   │   ├── debounce.js             # 防抖函数
│   │   ├── download.js             # 文件下载
│   │   ├── escape.js               # HTML 转义
│   │   ├── platform.js             # 平台检测
│   │   └── store.js                # 存储适配器工厂
│   ├── app.js                  # 应用主入口
│   ├── calculator.js           # calculator 模块公共 API（re-export）
│   ├── constants.js            # 常量（已弃用，使用 shared/constants.js）
│   ├── formula-renderer.js     # LaTeX 公式渲染
│   ├── history.js              # 历史记录管理
│   ├── index.html              # Electron 入口 HTML
│   ├── index-web.html          # Web 入口 HTML
│   ├── keyboard.js             # 键盘事件处理
│   ├── manifest.json           # PWA 配置
│   ├── styles.css              # 全局样式
│   ├── sw.js                   # Service Worker
│   ├── test-android.html       # Android 测试页面
│   └── theme.js                # 主题管理
├── shared/                     # 跨进程共享常量
│   └── constants.cjs
├── test/                       # 测试文件
│   ├── calculator.test.js
│   ├── core.test.js
│   ├── formula-renderer.test.js
│   ├── history.test.js
│   ├── memory.test.js
│   ├── qrcode.test.js
│   ├── spreadsheet.test.js
│   └── variables-panel.test.js
├── main.cjs                    # Electron 主进程
├── preload.cjs                 # Electron 预加载脚本
├── package.json                # 项目配置
├── vite.config.js              # Vite 构建配置
├── vitest.config.js            # Vitest 测试配置
├── eslint.config.js            # ESLint 配置
├── capacitor.config.json       # Capacitor 配置
└── electron-builder.yml        # Electron 打包配置
```

### 3.3 进程模型

项目采用 Electron 的双进程架构：

```
┌─────────────────────┐         IPC          ┌─────────────────────┐
│    主进程 (Main)     │ ◄──────────────────► │  渲染进程 (Renderer) │
│                     │   ipcMain.handle      │                     │
│  - BrowserWindow    │   ipcRenderer.invoke  │  - 应用逻辑         │
│  - electron-store   │                       │  - UI 渲染          │
│  - 安全策略         │                       │  - 计算引擎         │
│  - 权限控制         │                       │  - 用户交互         │
└─────────────────────┘                       └─────────────────────┘
```

**安全隔离策略：**

- `nodeIntegration: false` — 渲染进程禁用 Node.js
- `contextIsolation: true` — 上下文隔离
- `sandbox: true` — 启用沙箱
- 通过 `preload.cjs` 暴露安全的 API 桥接

---

## 4. 核心模块详解

### 4.1 主进程 (main.cjs)

**文件位置：** `main.cjs`

**职责：**

- 创建和管理 BrowserWindow
- 初始化 electron-store 持久化存储
- 注册 IPC 处理器（store-get/store-set/store-delete）
- 实施安全策略（导航限制、权限拒绝、安全响应头）

**关键函数：**

| 函数                       | 说明                                    |
| -------------------------- | --------------------------------------- |
| `createWindow()`           | 创建主窗口，配置安全选项，加载入口页面  |
| `createStore()`            | 初始化 electron-store 并注册 IPC 处理器 |
| `isAllowedStoreKey(key)`   | 验证存储键是否在白名单中                |
| `isValidStoreValue(value)` | 验证存储值是否符合大小限制              |
| `isMainFrame(event)`       | 验证 IPC 请求是否来自主框架             |

**IPC 通道：**

| 通道           | 方向            | 说明           |
| -------------- | --------------- | -------------- |
| `store-get`    | Renderer → Main | 读取持久化数据 |
| `store-set`    | Renderer → Main | 写入持久化数据 |
| `store-delete` | Renderer → Main | 删除持久化数据 |

### 4.2 预加载脚本 (preload.cjs)

**文件位置：** `preload.cjs`

**职责：**

- 通过 `contextBridge.exposeInMainWorld` 安全地暴露 API
- 提供 `window.electronAPI.store` 接口
- 在调用前验证存储键的合法性

**暴露的 API：**

```javascript
window.electronAPI = {
  store: {
    get(key, defaultValue)    // 读取
    set(key, value)           // 写入
    delete(key)               // 删除
  }
}
```

### 4.3 渲染进程入口 (app.js)

**文件位置：** `renderer/app.js`

**职责：**

- 初始化所有核心基础设施（EventBus, ReactiveState, UndoManager）
- 初始化所有 Manager 模块（Settings, Memory, Table, Constants 等）
- 绑定所有 DOM 事件
- 协调各模块间的交互

**关键初始化流程：**

```
init()
  ├── initTheme(store)           // 加载主题设置
  ├── initHistory(store)         // 加载历史记录
  ├── memoryManager.load()       // 加载记忆值
  ├── settingsManager.load()     // 加载计算设置
  ├── new ConstantsPanelManager  // 初始化常量面板
  ├── new VariablesPanelManager  // 初始化变量面板
  ├── new SpreadsheetManager     // 初始化电子表格
  ├── new HistoryPanelManager    // 初始化历史面板
  ├── new HelpPanelManager       // 初始化帮助面板
  ├── bindEvents()               // 绑定所有 DOM 事件
  ├── renderHelperPanel()        // 渲染辅助面板
  ├── initKeyboard()             // 初始化键盘处理
  └── updateDisplayWithCursor()  // 初始显示
```

**核心状态 (uiState)：**

| 属性           | 类型   | 说明           |
| -------------- | ------ | -------------- |
| `currentInput` | string | 当前输入表达式 |
| `currentMode`  | string | 当前计算模式   |
| `lastResult`   | string | 上次计算结果   |
| `cursorIndex`  | number | 光标位置       |

**关键事件：**

| 事件           | 说明               |
| -------------- | ------------------ |
| `mode-changed` | 计算模式切换时触发 |
| `calculated`   | 计算完成时触发     |

### 4.4 计算引擎 (calculator/engine.js)

**文件位置：** `renderer/calculator/engine.js`

**职责：**

- 表达式求值主入口
- 协调各模式处理器
- 处理变量替换、自定义函数调用
- 微积分特殊处理

**核心函数：**

#### `evaluateExpression(expression, mode)`

表达式求值主函数，返回 `{ success, result, error }` 对象。

**处理流程：**

```
输入表达式
  │
  ├── 长度检查 (MAX_EXPRESSION_LENGTH = 500)
  │
  ├── 多语句分割 (: 或 ;)
  │
  ├── 符号替换 (×→*, ÷→/, −→-)
  │
  ├── 小数分隔符处理 (欧洲格式)
  │
  ├── 混合分数处理 ("1 2/3" → "(1 + 2/3)")
  │
  ├── 变量赋值检测 ("A=5")
  │
  ├── 自定义函数定义检测 ("f(x)=x^2")
  │
  ├── ans 变量替换
  │
  ├── 自定义函数调用替换
  │
  ├── 变量引用替换 (A-Z)
  │
  ├── 特殊函数处理
  │
  └── 模式分发
      ├── 'standard' → math.evaluate(expr)
      ├── 'complex'  → math.evaluate(expr, { re, im, arg, conj })
      ├── 'matrix'   → math.evaluate(expr)
      ├── 'vector'   → evaluateVectorExpression(expr)
      ├── 'solve'    → handleSolve(expr)
      ├── 'base'     → evaluateBaseExpression(expr)
      ├── 'convert'  → math.evaluate(expr) (带 "to" 关键字)
      └── 'stats'    → math.evaluate(expr)
```

#### `generateTable(expression, start, end, step)`

生成数值表格数据，返回 `[{ x, y }]` 数组。

### 4.5 状态管理 (calculator/state.js)

**文件位置：** `renderer/calculator/state.js`

**职责：**

- 管理所有计算器全局状态
- 提供 getter/setter 函数
- 支持状态重置

**状态列表：**

| 状态                   | 类型    | 默认值       | 说明                           |
| ---------------------- | ------- | ------------ | ------------------------------ |
| `angleUnit`            | string  | `'rad'`      | 角度单位 (rad/deg/grad)        |
| `ansValue`             | number  | `0`          | 上次计算结果                   |
| `precision`            | number  | `12`         | 显示精度 (0-15)                |
| `displayFormat`        | string  | `'norm'`     | 显示格式 (norm1/norm2/fix/sci) |
| `fixDecimals`          | number  | `4`          | 定点小数位数                   |
| `currentBase`          | number  | `10`         | 进制基数 (2/8/10/16)           |
| `engineeringNotation`  | boolean | `false`      | 工程符号开关                   |
| `fractionMode`         | boolean | `false`      | 分数显示模式                   |
| `exactMode`            | boolean | `false`      | 精确模式 (√2, π 等)            |
| `fractionType`         | string  | `'improper'` | 分数类型 (improper/mixed)      |
| `thousandSeparator`    | boolean | `false`      | 千分位分隔符                   |
| `decimalSeparator`     | string  | `'.'`        | 小数点符号 (. 或 ,)            |
| `language`             | string  | `'zh'`       | 语言 (zh/en)                   |
| `complexDisplayFormat` | string  | `'rect'`     | 复数显示格式 (rect/polar)      |
| `variables`            | object  | `{}`         | 变量存储 (A-Z)                 |
| `customFunctions`      | object  | `{}`         | 自定义函数 (f/g/h)             |
| `ansStack`             | array   | `[]`         | 结果历史栈 (最多 10 个)        |

### 4.6 结果格式化 (calculator/formatter.js)

**文件位置：** `renderer/calculator/formatter.js`

**职责：**

- 数值格式化（精度、进制、科学计数法）
- 分数转换（连分数算法）
- 精确形式识别（√n, π, e 等）
- 工程符号格式化
- 矩阵/复数/单位结果格式化
- 错误消息友好化

**核心函数：**

| 函数                            | 说明                                          |
| ------------------------------- | --------------------------------------------- |
| `formatResult(result)`          | 格式化计算结果，处理数值/复数/矩阵/单位等类型 |
| `toFractionString(value)`       | 连分数算法将浮点数转换为分数                  |
| `toMixedFraction(num, den)`     | 假分数转带分数                                |
| `toExactForm(value)`            | 识别并返回精确符号形式                        |
| `formatEngineering(value)`      | 工程符号格式化 (k, M, G, m, μ)                |
| `matrixToString(matrix)`        | 矩阵转字符串                                  |
| `getFriendlyError(error)`       | 错误消息友好化                                |
| `formatBaseResult(value, base)` | 进制结果格式化 (0b/0o/0x 前缀)                |

---

## 5. 计算模式模块

### 5.1 标准模式

标准模式直接使用 `math.evaluate()` 进行表达式求值，支持：

- 四则运算、幂运算、阶乘
- 三角函数及其反函数
- 对数函数（log, ln）
- 绝对值、取整函数
- 随机数生成

**角度转换：** 通过 `angle-utils.js` 的 `applyAngleConversions()` 在求值前将三角函数参数转换为弧度。

### 5.2 复数模式

复数模式使用 mathjs 内置的复数支持，额外提供：

- `re(z)` — 实部
- `im(z)` — 虚部
- `arg(z)` — 辐角
- `conj(z)` — 共轭复数

**显示格式：** 支持直角坐标 (a+bi) 和极坐标 (r∠θ°) 两种格式。

### 5.3 矩阵模式

矩阵模式使用 mathjs 的矩阵运算能力，支持：

- 矩阵加减乘
- `det(M)` — 行列式
- `inv(M)` — 逆矩阵
- `transpose(M)` — 转置
- `trace(M)` — 迹
- `eig(M)` — 特征值

**输入格式：** `[[a,b],[c,d]]` — 行间用 `],[` 分隔。

### 5.4 向量模式 (calculator/vector.js)

**文件位置：** `renderer/calculator/vector.js`

向量模式提供自定义向量运算函数：

| 函数          | 实现                        |
| ------------- | --------------------------- |
| `dot(a, b)`   | `math.dot(a, b)`            |
| `cross(a, b)` | `math.cross(a, b)`          |
| `norm(v)`     | `math.norm(v)`              |
| `unit(v)`     | `v / norm(v)`               |
| `proj(a, b)`  | `b * (dot(a,b) / dot(b,b))` |

### 5.5 求解模式 (calculator/solve.js)

**文件位置：** `renderer/calculator/solve.js`

**职责：** 方程求解与方程组求解

**支持的求解类型：**

| 类型           | 函数                | 算法                    |
| -------------- | ------------------- | ----------------------- |
| 通用方程       | `x^2 - 4 = 0`       | 二分法数值求解          |
| 一元二次       | `solve2(a,b,c)`     | 求根公式 + 精确根式表示 |
| 一元三次       | `solve3(a,b,c,d)`   | Cardano 公式            |
| 一元四次       | `solve4(a,b,c,d,e)` | Durand-Kerner 数值法    |
| 二元一次方程组 | `solveLinear2(...)` | Cramer 法则             |
| 三元一次方程组 | `solveLinear3(...)` | LU 分解                 |
| 四元一次方程组 | `solveLinear4(...)` | 高斯消元法              |

**通用方程求解流程：**

1. 检测等号，提取变量名
2. 将方程转换为 `f(x) = 0` 形式
3. 在预定义搜索范围 `[-100, 100]` 内查找变号区间
4. 使用二分法精确定位根

### 5.6 进制模式 (calculator/base.js)

**文件位置：** `renderer/calculator/base.js`

**职责：** 进制转换和整数算术运算

**进制转换：**

| 函数     | 说明              |
| -------- | ----------------- |
| `bin(n)` | 十进制 → 二进制   |
| `oct(n)` | 十进制 → 八进制   |
| `hex(n)` | 十进制 → 十六进制 |
| `dec(n)` | 其他进制 → 十进制 |

**位运算：** 使用递归下降解析器实现安全的整数表达式求值，支持 `&`, `|`, `^^`(XOR), `~`(NOT), `<<`, `>>` 运算符。

### 5.7 单位换算模式

单位换算模式直接使用 mathjs 内置的单位系统，格式为 `数值 单位 to 目标单位`。

支持的单位类别：长度、质量、时间、速度、面积、体积、温度、压力、能量、功率、数据、磁场、频率等。

### 5.8 统计模式

统计模式使用 mathjs 内置的统计函数：`mean`, `median`, `std`, `variance`, `sum`, `min`, `max`。

额外支持通过 `special-functions.js` 提供的回归分析和概率分布函数。

---

## 6. 数学功能模块

### 6.1 微积分 (calculator/calculus.js)

**文件位置：** `renderer/calculator/calculus.js`

| 函数                                   | 算法             | 说明                           |
| -------------------------------------- | ---------------- | ------------------------------ |
| `numericalDerivative(f, x, h)`         | 中心差分法       | f'(x) ≈ (f(x+h) - f(x-h)) / 2h |
| `numericalIntegration(f, a, b)`        | Simpson 1/3 法则 | 将区间分为 1000 份近似积分     |
| `calculateSummation(f, i, start, end)` | 直接求和         | Σf(i)                          |
| `calculateProduct(f, i, start, end)`   | 直接求积         | Πf(i)                          |

**常量配置：**

- `NUMERICAL_DERIVATIVE_STEP = 1e-8`
- `SIMPSON_INTERVALS = 1000`

### 6.2 概率分布 (calculator/probability.js)

**文件位置：** `renderer/calculator/probability.js`

**连续分布：**

| 函数                       | 分布                                 |
| -------------------------- | ------------------------------------ |
| `uniformPDF/CDF(x, a, b)`  | 均匀分布                             |
| `exponentialPDF/CDF(x, λ)` | 指数分布                             |
| `normalCDF(x, μ, σ)`       | 正态分布（Abramowitz & Stegun 近似） |
| `invNormalCDF(p, μ, σ)`    | 正态分布反函数                       |

**离散分布：**

| 函数                       | 分布     |
| -------------------------- | -------- |
| `binomialPMF/CDF(k, n, p)` | 二项分布 |
| `poissonPMF/CDF(k, λ)`     | 泊松分布 |

**特殊分布：**

| 函数                            | 分布             |
| ------------------------------- | ---------------- |
| `chiSquaredCDF(x, df)`          | χ² 分布          |
| `tDistributionCDF(t, df)`       | Student's t 分布 |
| `fDistributionCDF(x, df1, df2)` | F 分布           |

**辅助函数：**

- `regularizedGamma(a, x)` — 正则化不完全 Gamma 函数
- `regularizedBeta(a, b, x)` — 正则化不完全 Beta 函数
- `gamma(z)` — Gamma 函数（Lanczos 近似）
- `factorial(n)` — 阶乘（限制 n ≤ 170）

### 6.3 回归分析 (calculator/regression.js)

**文件位置：** `renderer/calculator/regression.js`

| 函数                          | 模型                    | 输出        |
| ----------------------------- | ----------------------- | ----------- |
| `linearRegression(x, y)`      | y = ax + b              | a, b, r, r² |
| `quadraticRegression(x, y)`   | y = ax² + bx + c        | a, b, c, R² |
| `exponentialRegression(x, y)` | y = a·e^(bx)            | a, b, R²    |
| `powerRegression(x, y)`       | y = a·x^b               | a, b, R²    |
| `logarithmicRegression(x, y)` | y = a + b·ln(x)         | a, b, R²    |
| `logisticRegression(x, y)`    | y = c / (1 + a·e^(-bx)) | a, b, c, R² |

### 6.4 数论 (calculator/number-theory.js)

**文件位置：** `renderer/calculator/number-theory.js`

| 函数                                    | 说明                          |
| --------------------------------------- | ----------------------------- |
| `gcd(a, b)`                             | 最大公约数（欧几里得算法）    |
| `lcm(a, b)`                             | 最小公倍数                    |
| `factorize(n)`                          | 质因数分解                    |
| `solveQuadraticInequality(a, b, c, op)` | 二次不等式求解                |
| `solveGeneralInequality(coeffs, op)`    | 高次不等式求解                |
| `decimalToDMS(decimal)`                 | 十进制 → 度分秒               |
| `dmsToDecimal(d, m, s)`                 | 度分秒 → 十进制               |
| `findPolynomialRoots(coeffs)`           | 多项式求根（有理根 + 牛顿法） |

### 6.5 特殊函数 (calculator/special-functions.js)

**文件位置：** `renderer/calculator/special-functions.js`

**职责：** 分发和处理所有非标准 mathjs 函数调用

**支持的函数类别：**

| 类别     | 函数                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 比例     | `ratio(a,b,c)`                                                                 |
| 坐标转换 | `polar(re,im)`, `rect(r,θ)`                                                    |
| 随机模拟 | `dice(n)`, `coin(n)`                                                           |
| 微积分   | `d/dx()`, `integrate()`, `sum()`, `product()`                                  |
| 数论     | `gcd()`, `lcm()`, `factorize()`                                                |
| 回归     | `linReg()`, `quadReg()`, `expReg()`, `powerReg()`, `logReg()`, `logisticReg()` |
| 概率分布 | `normCDF()`, `binomPMF()`, `poissonPMF()` 等                                   |
| 不等式   | `solveIneq()`                                                                  |
| 角度转换 | `toDMS()`, `toDecimal()`                                                       |
| 验证     | `verify(lhs, rhs, val)`                                                        |

**实现模式：** 使用预编译正则表达式匹配函数调用，提取参数后调用对应实现。

---

## 7. UI 模块

### 7.1 面板管理器 (modules/panel.js)

**文件位置：** `renderer/modules/panel.js`

**职责：** 统一管理所有侧边栏和面板的显示/隐藏

**管理的面板：**

| 面板        | DOM ID              | 说明           |
| ----------- | ------------------- | -------------- |
| history     | `history-sidebar`   | 历史记录侧边栏 |
| constants   | `constants-sidebar` | 常量库侧边栏   |
| settings    | `settings-panel`    | 设置面板       |
| table       | `table-panel`       | 数值表格面板   |
| help        | `help-sidebar`      | 帮助侧边栏     |
| variables   | `variables-sidebar` | 变量管理侧边栏 |
| spreadsheet | `spreadsheet-panel` | 电子表格面板   |

**关键方法：**

| 方法                            | 说明                   |
| ------------------------------- | ---------------------- |
| `toggle(panel, triggerElement)` | 切换面板显示/隐藏      |
| `closeAll()`                    | 关闭所有面板并恢复焦点 |

**特性：** 支持焦点陷阱（Focus Trap），确保 Tab 键在面板内循环。

### 7.2 设置管理器 (modules/settings.js)

**文件位置：** `renderer/modules/settings.js`

**职责：** 管理所有计算器设置的加载、保存和 UI 同步

**管理的设置项：**

| 设置     | 存储键                | 说明                |
| -------- | --------------------- | ------------------- |
| 精度     | `precision`           | 0-15 位小数         |
| 自动括号 | `autoBracket`         | 计算时自动补全括号  |
| 显示格式 | `displayFormat`       | norm1/norm2/fix/sci |
| 进制     | `currentBase`         | 2/8/10/16           |
| 工程符号 | `engineeringNotation` | 开/关               |
| 分数模式 | `fractionMode`        | 开/关               |
| 精确模式 | `exactMode`           | 开/关               |
| 角度单位 | `angleUnit`           | rad/deg/grad        |

**持久化键：** `calculator_settings`

### 7.3 记忆管理器 (modules/memory.js)

**文件位置：** `renderer/modules/memory.js`

**职责：** 管理计算器记忆功能（MS/MR/M+/M-/MC）

**状态：**

- `value` — 记忆值
- `hasMemory` — 是否有存储值

**操作：**

| 操作 | 说明                     |
| ---- | ------------------------ |
| MC   | 清除记忆                 |
| MR   | 读取记忆值并插入表达式   |
| M+   | 将当前结果加到记忆值     |
| M-   | 将当前结果从记忆值中减去 |
| MS   | 将当前结果存入记忆       |

**持久化键：** `calculator_memory`

### 7.4 显示模块 (modules/display.js)

**文件位置：** `renderer/modules/display.js`

**职责：** 管理公式预览区和结果区的渲染

**关键函数：**

| 函数                                   | 说明                      |
| -------------------------------------- | ------------------------- |
| `updateDisplay(input, result, cursor)` | 更新显示（使用 rAF 节流） |
| `setError(message)`                    | 显示错误消息              |
| `clearError()`                         | 清除错误消息              |
| `copyResult(result)`                   | 复制结果到剪贴板          |

**性能优化：** 使用 `requestAnimationFrame` 合并同帧内的多次渲染请求。

### 7.5 模式与辅助面板 (modules/mode.js)

**文件位置：** `renderer/modules/mode.js`

**职责：**

- 定义每种计算模式的辅助按钮配置
- 渲染辅助面板
- 管理模式标签的激活状态
- 处理进制模式下的键盘可用性

**辅助按钮配置：** 每种模式有独立的 `MODE_HELPERS` 配置，定义按钮的插入值和显示标签。

**函数映射表 (`FUNC_MAP`)：** 将用户友好的标签映射到实际的函数调用语法。

### 7.6 历史记录 (history.js)

**文件位置：** `renderer/history.js`

**职责：**

- 管理计算历史记录的增删改查
- 支持搜索过滤
- 支持导出为 JSON 文件
- 渲染历史记录列表

**关键函数：**

| 函数                    | 说明                     |
| ----------------------- | ------------------------ |
| `initHistory(store)`    | 从存储加载历史记录       |
| `addHistory(item)`      | 添加历史记录（自动去重） |
| `clearHistory()`        | 清空所有历史             |
| `deleteHistoryItem(id)` | 删除单条历史             |
| `setSearchQuery(query)` | 设置搜索过滤             |
| `exportHistory()`       | 导出为 JSON 文件         |

**配置：** 最多保存 100 条记录 (`MAX_HISTORY_ITEMS`)。

**持久化键：** `calculator_history`

### 7.7 公式渲染器 (formula-renderer.js)

**文件位置：** `renderer/formula-renderer.js`

**职责：**

- 将计算器输入转换为 LaTeX 表达式
- 使用 KaTeX 渲染公式预览和结果

**核心函数：**

| 函数                            | 说明                |
| ------------------------------- | ------------------- |
| `inputToLatex(input)`           | 输入 → LaTeX 转换   |
| `renderFormula(element, latex)` | 渲染公式到 DOM 元素 |
| `renderResult(element, result)` | 渲染结果到 DOM 元素 |

**转换规则：**

- 三角函数：`sin(` → `\sin(`
- 幂运算：`x^2` → `x^{2}`
- 分数：`a/b` → `\frac{a}{b}`
- 绝对值：`abs(x)` → `\left|x\right|`
- 取整：`floor(x)` → `\lfloor x \rfloor`
- 矩阵：`[[a,b],[c,d]]` → `\begin{bmatrix} a & b \\ c & d \end{bmatrix}`

### 7.8 数值表格与绘图 (modules/table.js, modules/plot.js)

**TableManager (modules/table.js)：**

- 生成函数数值表格 (x, f(x))
- 支持双函数对比
- 支持 CSV/JSON 导入导出

**PlotManager (modules/plot.js)：**

- 使用 Chart.js 绘制函数曲线
- 自动采样 200 个点
- 支持主题联动
- 支持悬停查看精确坐标

---

## 8. 核心基础设施

### 8.1 事件总线 (core/event-bus.js)

**文件位置：** `renderer/core/event-bus.js`

**职责：** 模块间解耦通信

**API：**

| 方法                    | 说明                       |
| ----------------------- | -------------------------- |
| `on(event, callback)`   | 订阅事件，返回取消订阅函数 |
| `off(event, callback)`  | 取消订阅                   |
| `emit(event, data)`     | 发布事件                   |
| `once(event, callback)` | 一次性订阅                 |

### 8.2 响应式状态 (core/state.js)

**文件位置：** `renderer/core/state.js`

**职责：** 状态变更自动通知订阅者

**API：**

| 方法                | 说明                             |
| ------------------- | -------------------------------- |
| `get(key)`          | 获取状态值                       |
| `set(key, value)`   | 设置状态值（值变化时自动通知）   |
| `batch(updates)`    | 批量更新（仅在最后触发一次通知） |
| `on(key, callback)` | 监听状态变化                     |
| `snapshot()`        | 获取当前所有状态的快照（只读）   |

### 8.3 错误处理 (core/errors.js)

**文件位置：** `renderer/core/errors.js`

**职责：** 统一错误处理、日志记录、友好消息转换

**错误码枚举 (`ErrorCode`)：**

| 错误码               | 说明             |
| -------------------- | ---------------- |
| `INVALID_EXPRESSION` | 表达式无效       |
| `DIVISION_BY_ZERO`   | 除零错误         |
| `OVERFLOW`           | 数值溢出         |
| `UNDEFINED_VARIABLE` | 未知变量         |
| `DIMENSION_MISMATCH` | 矩阵维度不匹配   |
| `ROOT_NOT_FOUND`     | 未找到根         |
| `STORAGE_ERROR`      | 存储读写失败     |
| `INVALID_INPUT`      | 输入无效         |
| `NEGATIVE_ROOT`      | 负数不能开偶次根 |
| `EIGEN_NOT_CONVERGE` | 特征值迭代未收敛 |

**ErrorHandler 类：** 通过正则匹配错误消息自动推断错误码，并返回友好的中文错误消息。

### 8.4 日志系统 (core/logger.js)

**文件位置：** `renderer/core/logger.js`

**职责：** 分级日志系统

**日志级别：** `debug` < `info` < `warn` < `error` < `silent`

**环境适配：**

- 开发环境：输出所有级别 (`debug`)
- 生产环境：仅输出 `warn` 和 `error`

**特性：** 保留最近 200 条日志用于错误上报。

### 8.5 国际化 (core/i18n.js)

**文件位置：** `renderer/core/i18n.js`

**职责：** 轻量级国际化支持

**API：**

| 函数                | 说明                         |
| ------------------- | ---------------------------- |
| `setLocale(locale)` | 设置当前语言                 |
| `getLocale()`       | 获取当前语言                 |
| `t(key, params)`    | 翻译指定 key，支持占位符替换 |

**支持语言：** 中文 (zh)、英文 (en)

---

## 9. 工具模块

### 9.1 存储适配器 (utils/store.js)

**文件位置：** `renderer/utils/store.js`

**职责：** 根据运行环境自动选择存储后端

**存储后端：**

| 环境        | 后端                       | 说明                                 |
| ----------- | -------------------------- | ------------------------------------ |
| Electron    | `window.electronAPI.store` | 通过 IPC 调用主进程的 electron-store |
| Android/iOS | `IndexedDBStore`           | 使用 IndexedDB，更好的性能和容量     |
| Web         | `LocalStorageStore`        | 使用 localStorage                    |

**安全验证：**

- 存储键白名单检查
- 值大小限制 (MAX_STORE_VALUE_SIZE = 1MB)
- NaN 值检测

### 9.2 平台检测 (utils/platform.js)

**文件位置：** `renderer/utils/platform.js`

**API：**

| 函数                | 说明               |
| ------------------- | ------------------ |
| `isElectron()`      | 检测 Electron 环境 |
| `isMobile()`        | 检测移动设备       |
| `isAndroid()`       | 检测 Android       |
| `isIOS()`           | 检测 iOS           |
| `getPlatform()`     | 返回平台类型字符串 |
| `isTouchDevice()`   | 检测触摸支持       |
| `getPlatformInfo()` | 获取完整平台信息   |

### 9.3 输入处理 (app/input-handler.js)

**文件位置：** `renderer/app/input-handler.js`

**职责：** 纯函数式的输入处理

| 函数                                    | 说明               |
| --------------------------------------- | ------------------ |
| `applyBackspace(input, cursorIndex)`    | 执行退格操作       |
| `applyInsert(input, text, cursorIndex)` | 在光标位置插入文本 |

### 9.4 撤销管理 (app/undo-manager.js)

**文件位置：** `renderer/app/undo-manager.js`

**职责：** 管理输入撤销栈

**API：**

| 方法                       | 说明                 |
| -------------------------- | -------------------- |
| `push(input, cursorIndex)` | 保存当前状态到撤销栈 |
| `pop()`                    | 弹出上一个状态       |

**配置：** 最大栈深度 50 (`MAX_UNDO_SIZE`)。

### 9.5 键盘处理 (keyboard.js)

**文件位置：** `renderer/keyboard.js`

**职责：** 处理所有键盘快捷键

**快捷键映射：**

| 快捷键             | 功能                           |
| ------------------ | ------------------------------ |
| `0-9`, `.`, 运算符 | 数字/运算符输入                |
| `Enter`            | 计算结果                       |
| `=`                | 计算结果（求解模式下插入等号） |
| `Backspace`        | 退格删除                       |
| `Escape`           | 关闭面板 / 清空输入            |
| `Tab`              | 自动补全括号                   |
| `←` `→`            | 光标移动                       |
| `↑` `↓`            | 历史表达式导航                 |
| `Ctrl+Z`           | 撤销                           |
| `Ctrl+H`           | 切换历史记录                   |
| `Ctrl+T`           | 切换主题                       |
| `Ctrl+L`           | 清空历史记录                   |
| `Ctrl+/`           | 切换帮助                       |

---

## 10. 数据流与依赖关系

### 10.1 模块依赖图

```
app.js (入口)
  ├── calculator.js (API 层, re-export)
  │   └── calculator/
  │       ├── engine.js (核心引擎)
  │       │   ├── math-instance.js (mathjs 单例)
  │       │   ├── state.js (状态)
  │       │   ├── formatter.js (格式化)
  │       │   ├── angle-utils.js (角度转换)
  │       │   ├── special-functions.js (特殊函数)
  │       │   │   ├── probability.js
  │       │   │   ├── regression.js
  │       │   │   └── number-theory.js
  │       │   ├── calculus.js (微积分)
  │       │   ├── base.js (进制)
  │       │   ├── vector.js (向量)
  │       │   └── solve.js (求解)
  │       └── state.js (计算器状态)
  │
  ├── core/
  │   ├── event-bus.js (事件总线)
  │   ├── state.js (响应式状态)
  │   ├── errors.js (错误处理)
  │   ├── logger.js (日志)
  │   └── i18n.js (国际化)
  │
  ├── modules/
  │   ├── panel.js (面板管理)
  │   ├── settings.js (设置)
  │   ├── memory.js (记忆)
  │   ├── display.js (显示)
  │   ├── mode.js (模式)
  │   ├── table.js (表格)
  │   ├── plot.js (绘图)
  │   └── ...
  │
  ├── app/
  │   ├── undo-manager.js (撤销)
  │   ├── expression-history.js (表达式历史)
  │   └── input-handler.js (输入处理)
  │
  ├── utils/
  │   ├── store.js (存储)
  │   ├── platform.js (平台检测)
  │   └── ...
  │
  ├── history.js (历史记录)
  ├── theme.js (主题)
  ├── keyboard.js (键盘)
  └── formula-renderer.js (公式渲染)
```

### 10.2 计算请求数据流

```
用户输入 (键盘/按钮)
       │
       ▼
   app.js::insertText()
       │
       ▼
   app/input-handler.js::applyInsert()
       │
       ▼
   app.js::uiState.set('currentInput', ...)
       │
       ▼
   modules/display.js::updateDisplay()
       │
       ├── formula-renderer.js::inputToLatex() → KaTeX 渲染
       │
       ▼
   [用户按下 Enter/=]
       │
       ▼
   app.js::handleCalculate()
       │
       ├── keyboard.js::autoCompleteBrackets() (如果启用)
       │
       ▼
   calculator/engine.js::evaluateExpression(expr, mode)
       │
       ├── 状态管理: 变量替换、ans 替换
       ├── 特殊函数: special-functions.js
       ├── 模式分发:
       │   ├── standard → math.evaluate()
       │   ├── complex → math.evaluate() + re/im/arg/conj
       │   ├── matrix → math.evaluate()
       │   ├── vector → vector.js::evaluateVectorExpression()
       │   ├── solve → solve.js::handleSolve()
       │   ├── base → base.js::evaluateBaseExpression()
       │   ├── convert → math.evaluate() (带 "to")
       │   └── stats → math.evaluate()
       │
       ▼
   calculator/formatter.js::formatResult()
       │
       ├── 数值格式化 (精度/进制/科学计数法)
       ├── 分数转换 (如果启用)
       ├── 精确形式识别 (如果启用)
       └── 复数/矩阵/单位格式化
       │
       ▼
   返回 { success: true, result: "..." }
       │
       ▼
   app.js::handleCalculate() 继续处理
       │
       ├── uiState.set('lastResult', result)
       ├── calculator/state.js::setAns(result)
       ├── history.js::addHistory({ expression, result, mode })
       ├── expression-history.js::push(expr)
       ├── event-bus.js::emit('calculated', ...)
       └── modules/display.js::updateDisplay()
```

---

## 11. 构建与运行

### 11.1 环境要求

- Node.js >= 18.0.0
- pnpm (推荐) 或 npm

### 11.2 安装依赖

```bash
pnpm install
```

### 11.3 开发模式

**Electron 开发模式（热更新）：**

```bash
pnpm electron:dev
```

此命令会：

1. 启动 Vite 开发服务器 (localhost:5173)
2. 等待服务器就绪后启动 Electron
3. 渲染进程支持热模块替换 (HMR)

**Web 开发模式：**

```bash
pnpm dev
```

### 11.4 生产构建

**构建 Electron 应用：**

```bash
pnpm build:electron
```

构建流程：

1. `vite build` — 将渲染进程代码打包到 `dist/renderer/`
2. `electron-builder` — 将应用打包为平台安装包

**构建 Web 应用：**

```bash
pnpm build:web
```

**构建 Android 应用：**

```bash
pnpm build:android
```

构建流程：

1. `vite build` — 构建 Web 资源
2. `cap sync android` — 同步到 Capacitor Android 项目

### 11.5 测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch
```

**测试框架：** Vitest + jsdom

**测试文件：**

| 文件                       | 测试内容         |
| -------------------------- | ---------------- |
| `calculator.test.js`       | 计算引擎核心功能 |
| `core.test.js`             | 核心基础设施     |
| `formula-renderer.test.js` | LaTeX 公式渲染   |
| `history.test.js`          | 历史记录管理     |
| `memory.test.js`           | 记忆功能         |
| `qrcode.test.js`           | 二维码生成       |
| `spreadsheet.test.js`      | 电子表格         |
| `variables-panel.test.js`  | 变量面板         |

### 11.6 代码质量

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# Prettier 格式化
pnpm format

# Prettier 检查
pnpm format:check
```

**Git Hooks (husky)：**

- `pre-commit` — 运行 lint-staged，自动对暂存文件执行 ESLint 和 Prettier

---

## 12. 跨平台支持

### 12.1 Electron (桌面)

**配置文件：** `electron-builder.yml`

**特性：**

- 窗口尺寸：520×800（最小 380×640）
- 安全沙箱模式
- IPC 通信存储
- 开发模式自动打开 DevTools

### 12.2 Web 浏览器

**入口文件：** `renderer/index-web.html`

**特性：**

- 使用 localStorage 存储
- PWA 支持 (manifest.json + sw.js)
- 响应式布局

### 12.3 Android (Capacitor)

**配置文件：** `capacitor.config.json`

**特性：**

- 使用 IndexedDB 存储
- 原生应用体验
- 竖屏锁定

---

## 13. 安全机制

### 主进程安全

| 机制                     | 说明                                                       |
| ------------------------ | ---------------------------------------------------------- |
| `contextIsolation: true` | 渲染进程与预加载脚本上下文隔离                             |
| `nodeIntegration: false` | 渲染进程禁用 Node.js API                                   |
| `sandbox: true`          | 启用 Chromium 沙箱                                         |
| 导航限制                 | 仅允许加载 localhost:5173 或本地文件                       |
| 窗口打开拒绝             | `setWindowOpenHandler` 返回 `{ action: 'deny' }`           |
| 权限拒绝                 | 所有权限请求均被拒绝                                       |
| 安全响应头               | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` |

### 存储安全

| 机制       | 说明                   |
| ---------- | ---------------------- |
| 键白名单   | 仅允许预定义的存储键   |
| 值大小限制 | 单个值最大 1MB         |
| 主框架验证 | IPC 请求必须来自主框架 |
| NaN 检测   | 拒绝包含 NaN 的值      |

### 输入安全

| 机制           | 说明                                |
| -------------- | ----------------------------------- |
| 表达式长度限制 | 最大 500 字符                       |
| 多语句数量限制 | 最多 10 条语句                      |
| HTML 转义      | 历史记录等用户内容使用 `escapeHtml` |
| 递归下降解析   | 进制模式使用安全的递归下降解析器    |

---

## 14. 关键常量配置

**文件位置：** `renderer/shared/constants.js`

| 常量                           | 值                                                                                       | 说明                         |
| ------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------- |
| `ALLOWED_STORE_KEYS`           | `['calculator_settings', 'calculator_memory', 'calculator_history', 'calculator_theme']` | 允许的存储键                 |
| `MAX_STORE_VALUE_SIZE`         | 1MB                                                                                      | 存储值最大大小               |
| `MAX_HISTORY_ITEMS`            | 100                                                                                      | 历史记录最大条数             |
| `MAX_TABLE_DATA_POINTS`        | 1000                                                                                     | 表格最大数据点               |
| `MAX_FACTORIAL_INPUT`          | 170                                                                                      | 阶乘最大输入                 |
| `MAX_EXPRESSION_LENGTH`        | 500                                                                                      | 表达式最大长度               |
| `MAX_STATEMENT_COUNT`          | 10                                                                                       | 多语句最大数量               |
| `MAX_VARIABLES`                | 9                                                                                        | 变量最大数量 (A-Z 中取 9 个) |
| `MAX_UNDO_SIZE`                | 50                                                                                       | 撤销栈最大深度               |
| `MAX_EXPRESSION_HISTORY`       | 100                                                                                      | 表达式历史最大条数           |
| `NUMERICAL_DERIVATIVE_STEP`    | 1e-8                                                                                     | 数值导数步长                 |
| `SIMPSON_INTERVALS`            | 1000                                                                                     | Simpson 积分区间数           |
| `BISECTION_MAX_ITERATIONS`     | 100                                                                                      | 二分法最大迭代次数           |
| `ROOT_FINDING_TOLERANCE`       | 1e-12                                                                                    | 求根容差                     |
| `FEEDBACK_DISPLAY_TIMEOUT`     | 3000ms                                                                                   | 反馈消息显示时长             |
| `NORM1_EXPONENT_THRESHOLD_LOW` | 1e-2                                                                                     | NORM1 科学计数法阈值         |
| `NORM2_EXPONENT_THRESHOLD_LOW` | 1e-9                                                                                     | NORM2 科学计数法阈值         |
| `NORM_EXPONENT_THRESHOLD_HIGH` | 1e10                                                                                     | 科学计数法上限阈值           |

---

> 本文档由代码分析自动生成，最后更新时间：2026-06-24
