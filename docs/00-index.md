# calculate_JYY — Code Wiki 索引

> 一套基于 Electron 的图形化科学计算器（对标卡西欧 fx-991），支持 8 种计算模式、LaTeX 实时公式渲染、深色/浅色主题、完整历史记录和内置常量库。

## 文档导航

| 文档                                               | 内容                                                         |
| -------------------------------------------------- | ------------------------------------------------------------ |
| [01-architecture.md](./01-architecture.md)         | 项目整体架构（主进程 / 预加载 / 渲染进程）                   |
| [02-main-process.md](./02-main-process.md)         | 主进程与预加载脚本：窗口管理、IPC、持久化存储                |
| [03-renderer-core.md](./03-renderer-core.md)       | 渲染层核心模块：计算引擎、键盘、主题、历史、常量、LaTeX 渲染 |
| [04-renderer-modules.md](./04-renderer-modules.md) | 渲染层功能模块：面板、内存、设置、表格、绘图、模式辅助       |
| [05-renderer-utils.md](./05-renderer-utils.md)     | 工具模块：HTML 转义、存储抽象                                |
| [06-dependencies.md](./06-dependencies.md)         | 依赖关系与第三方库说明                                       |
| [07-running.md](./07-running.md)                   | 安装、运行、构建、测试                                       |

## 项目一览

- **项目名**：`calculate_JYY`
- **版本**：`1.0.0`
- **包管理器**：pnpm 10.8+
- **Node 要求**：≥ 18.0.0
- **技术栈**：Electron 36 · Vite 8 · Vitest 4 · mathjs 13 · KaTeX 0.16 · Chart.js 4.5
- **License**：MIT
- **作者**：JYY

## 顶层目录结构

```
calculate/
├── main.cjs                # Electron 主进程入口
├── preload.cjs             # 预加载脚本（contextBridge 暴露 electronAPI）
├── package.json            # 依赖与脚本配置
├── vite.config.js          # Vite 构建配置
├── vitest.config.js        # Vitest 测试配置
├── eslint.config.js        # ESLint 配置
├── electron-builder.yml    # 打包配置
├── .github/workflows/ci.yml# CI 流程
├── .husky/                 # Git 钩子（pre-commit 走 lint-staged）
├── assets/icons/           # 应用图标（ico/png/svg）
├── renderer/               # 渲染层（前端 UI）
│   ├── index.html          # 入口 HTML
│   ├── styles.css          # 主题样式（Catppuccin Mocha / Latte）
│   ├── app.js              # 应用入口与事件绑定
│   ├── calculator.js       # 计算引擎核心
│   ├── formula-renderer.js # KaTeX 渲染
│   ├── keyboard.js         # 键盘事件
│   ├── history.js          # 历史记录状态
│   ├── theme.js            # 主题管理
│   ├── constants.js        # 常量库
│   ├── modules/            # UI 子模块
│   └── utils/              # 通用工具
└── test/                   # Vitest 单元测试
    ├── calculator.test.js
    ├── formula-renderer.test.js
    ├── history.test.js
    └── memory.test.js
```

## 关键能力速查

| 能力         | 实现位置                                                        |
| ------------ | --------------------------------------------------------------- |
| 表达式求值   | `renderer/calculator.js` → `evaluateExpression()`               |
| 8 种计算模式 | `renderer/calculator.js` 中 switch 分支                         |
| LaTeX 渲染   | `renderer/formula-renderer.js` → `inputToLatex()` + KaTeX       |
| 历史记录     | `renderer/history.js` + `renderer/modules/history-panel.js`     |
| 常量库       | `renderer/constants.js` + `renderer/modules/constants-panel.js` |
| 内存功能     | `renderer/modules/memory.js` (`MemoryManager`)                  |
| 设置管理     | `renderer/modules/settings.js` (`SettingsManager`)              |
| 面板调度     | `renderer/modules/panel.js` (`PanelManager`)                    |
| 数值表格     | `renderer/modules/table.js` (`TableManager`)                    |
| 函数绘图     | `renderer/modules/plot.js` (`PlotManager`)                      |
| 主题切换     | `renderer/theme.js`                                             |
| 持久化       | `renderer/utils/store.js` + `preload.cjs` (electron-store)      |
| 帮助面板     | `renderer/modules/help.js`                                      |
