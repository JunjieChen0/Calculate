# calculate_JYY 生产级代码审查报告

> 审查时间：2026-06-24  
> 审查范围：全量源码  
> 严重级别：🔴 严重 | 🟠 中等 | 🟡 轻微 | 🔵 建议

---

## 目录

- [审查摘要](#审查摘要)
- [1. 安全性审查](#1-安全性审查)
- [2. 架构设计审查](#2-架构设计审查)
- [3. 错误处理审查](#3-错误处理审查)
- [4. 性能审查](#4-性能审查)
- [5. 代码质量审查](#5-代码质量审查)
- [6. 测试覆盖审查](#6-测试覆盖审查)
- [7. 可维护性审查](#7-可维护性审查)
- [8. CI/CD 审查](#8-cicd-审查)
- [9. 问题汇总与优先级](#9-问题汇总与优先级)

---

## 审查摘要

### 整体评价

项目整体质量**良好**，代码组织清晰，模块划分合理，安全意识较强。作为一款个人/小团队项目，已达到较高的工程化水平。以下从生产级标准逐项审查。

### 统计概览

| 类别     | 🔴 严重 | 🟠 中等 | 🟡 轻微 | 🔵 建议 |
| -------- | ------- | ------- | ------- | ------- |
| 安全性   | 1       | 2       | 1       | 1       |
| 架构设计 | 0       | 2       | 1       | 2       |
| 错误处理 | 1       | 2       | 2       | 1       |
| 性能     | 0       | 2       | 2       | 1       |
| 代码质量 | 0       | 1       | 3       | 2       |
| 测试覆盖 | 0       | 2       | 1       | 2       |
| 可维护性 | 0       | 1       | 1       | 2       |
| CI/CD    | 0       | 1       | 1       | 1       |
| **合计** | **2**   | **13**  | **12**  | **12**  |

---

## 1. 安全性审查

### 🔴 SEC-01: `escapeHtml` 实现存在性能与安全隐患

**文件：** [escape.js](file:///d:/calculate/renderer/utils/escape.js#L7-L11)

```javascript
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

**问题：** 每次调用都创建一个 DOM 元素，在高频调用场景（如历史记录列表渲染）中造成不必要的 DOM 操作开销。更严重的是，如果此函数在 Web Worker 或非浏览器环境（如 SSR 测试）中调用，`document` 不可用会直接崩溃。

**建议：** 改用纯字符串实现：

```javascript
export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

---

### 🟠 SEC-02: `history.js` 使用 `innerHTML` 渲染用户内容

**文件：** [history.js](file:///d:/calculate/renderer/history.js#L150-L161)

```javascript
listElement.innerHTML = items
  .map(
    item => `
  <div class="history-item" data-id="${escapeAttr(String(item.id))}">
    <button class="delete-btn" data-id="${escapeAttr(String(item.id))}" title="删除">×</button>
    <div class="expr">${escapeHtml(item.expression)}</div>
    <div class="result">= ${escapeHtml(item.result)}</div>
    <div class="time">${formatTime(item.timestamp)}</div>
  </div>
`
  )
  .join('');
```

**问题：** 虽然已使用 `escapeHtml` 转义，但 `innerHTML` 方式在生产环境中仍有 XSS 风险——如果 `escapeHtml` 实现有任何遗漏（如 SEC-01 中的 DOM 依赖），则存在注入可能。此外，每次历史更新都会完全替换整个列表 DOM，影响性能。

**建议：**

1. 优先使用 `textContent` + `createElement` 构建 DOM
2. 或使用 DocumentFragment 批量构建

---

### 🟠 SEC-03: 公式渲染器未对 LaTeX 输入做长度限制

**文件：** [formula-renderer.js](file:///d:/calculate/renderer/formula-renderer.js#L6-L126)

**问题：** `inputToLatex()` 函数没有输入长度限制。超长输入（如 500 字符的表达式）经过多次正则替换后，可能产生指数级膨胀的 LaTeX 字符串，导致 KaTeX 渲染性能问题或内存消耗。

**建议：** 在 `inputToLatex` 入口处增加长度检查：

```javascript
export function inputToLatex(input) {
  if (!input || input.trim() === '') return '';
  if (input.length > 1000) return '\\text{输入过长}';
  // ...
}
```

---

### 🟡 SEC-04: CSV 导出未正确处理包含引号的值

**文件：** [spreadsheet.js](file:///d:/calculate/renderer/spreadsheet.js#L382-L394)

```javascript
row.push(v.includes(',') ? '"' + v + '"' : v);
```

**问题：** 仅处理了逗号的情况，未处理值本身包含双引号的情况（应将 `"` 转义为 `""`）。

**建议：**

```javascript
const escaped = v.includes('"') ? v.replace(/"/g, '""') : v;
row.push(v.includes(',') || v.includes('"') ? `"${escaped}"` : escaped);
```

---

### 🔵 SEC-05: CSP 策略缺失

**问题：** 未配置 Content-Security-Policy。虽然 Electron 主进程设置了 `X-Frame-Options` 和 `X-Content-Type-Options`，但缺少 CSP 头部。

**建议：** 在 `main.cjs` 的 `onHeadersReceived` 中添加：

```javascript
'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"]
```

---

## 2. 架构设计审查

### 🟠 ARCH-01: `app.js` 职责过重（God Object 模式）

**文件：** [app.js](file:///d:/calculate/renderer/app.js)（620 行）

**问题：** `app.js` 承担了过多职责：初始化、事件绑定、计算逻辑、UI 更新、模式切换、历史导航等。这是典型的 God Object 反模式，导致：

- 难以独立测试各功能
- 修改一个功能可能影响其他功能
- 新开发者理解成本高

**建议：** 拆分为独立模块：

- `CalculatorController` — 计算逻辑编排
- `UIBindingManager` — DOM 事件绑定
- `ModeManager` — 模式切换逻辑
- `InputProcessor` — 输入处理管线

---

### 🟠 ARCH-02: 全局可变状态管理分散

**文件：** [calculator/state.js](file:///d:/calculate/renderer/calculator/state.js)

**问题：** 计算器状态使用模块级变量 + getter/setter 模式，存在以下问题：

1. **测试隔离困难**：全局状态在测试间共享，需要手动重置
2. **并发风险**：多个异步操作可能同时修改状态
3. **调试困难**：无法追踪状态变更历史

```javascript
let angleUnit = 'rad'; // 模块级可变状态
let ansValue = 0;
let precision = 12;
// ... 20+ 个模块级变量
```

**建议：**

1. 将所有状态封装为单一状态对象
2. 提供 `reset()` 方法用于测试
3. 考虑使用 `Object.freeze` 保护默认值

---

### 🟡 ARCH-03: `calculator.js` 和 `calculator/index.js` 存在重复导出

**文件：** [calculator.js](file:///d:/calculate/renderer/calculator.js) 和 [calculator/index.js](file:///d:/calculate/renderer/calculator/index.js)

**问题：** 两个文件都作为 calculator 模块的公共 API 入口，导出内容高度重叠。`calculator.js` 注释说"保持原有导入路径不变"，但这造成了维护负担。

**建议：** 统一为一个入口文件，通过 Vite alias 或 package.json exports 字段解决路径问题。

---

### 🔵 ARCH-04: 事件总线缺少类型约束

**文件：** [event-bus.js](file:///d:/calculate/renderer/core/event-bus.js)

**问题：** 事件名称和数据类型完全靠约定，没有类型检查。拼写错误不会被捕获。

**建议：** 定义事件类型常量：

```javascript
export const Events = Object.freeze({
  MODE_CHANGED: 'mode-changed',
  CALCULATED: 'calculated',
  ERROR: 'error'
});
```

---

### 🔵 ARCH-05: 存储适配器缺少接口定义

**文件：** [store.js](file:///d:/calculate/renderer/utils/store.js)

**问题：** 三种存储后端（Electron IPC、IndexedDB、LocalStorage）没有统一的接口定义，仅靠隐式约定保证一致性。

**建议：** 定义 StoreAdapter 接口或基类：

```javascript
class StoreAdapter {
  async get(key, defaultValue) {
    throw new Error('Not implemented');
  }
  async set(key, value) {
    throw new Error('Not implemented');
  }
  async delete(key) {
    throw new Error('Not implemented');
  }
}
```

---

## 3. 错误处理审查

### 🔴 ERR-01: `evaluateExpression` 中 `math.evaluate` 异常捕获范围过大

**文件：** [engine.js](file:///d:/calculate/renderer/calculator/engine.js#L88-L235)

```javascript
try {
  // 200+ 行代码
  expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
  // ... 大量预处理
  // ... 变量替换
  // ... 特殊函数处理
  let result;
  switch (mode) {
    case 'base':
      result = evaluateBaseExpression(expr);
      break;
    // ... 7 个 case
  }
  // ... 格式化
} catch (error) {
  return { success: false, error: getFriendlyError(error) };
}
```

**问题：** 单个 try-catch 包裹了 200+ 行代码，包括预处理、变量替换、特殊函数处理、模式分发和格式化。这导致：

1. **错误定位困难**：无法区分是预处理错误还是求值错误
2. **静默吞掉意外错误**：编程错误（如 TypeError）也会被捕获并显示为"计算错误"
3. **调试困难**：生产环境中错误堆栈丢失

**建议：** 分层捕获：

```javascript
try {
  // 预处理阶段
  expr = preprocess(expr);
} catch (error) {
  return { success: false, error: '表达式预处理失败: ' + error.message };
}

try {
  // 求值阶段
  result = evaluate(expr, mode);
} catch (error) {
  return { success: false, error: getFriendlyError(error) };
}
```

---

### 🟠 ERR-02: `special-functions.js` 中正则匹配失败时的静默忽略

**文件：** [special-functions.js](file:///d:/calculate/renderer/calculator/special-functions.js)

**问题：** `handleSpecialFunctions` 在所有正则都不匹配时返回 `null`，由调用方决定如何处理。但某些正则（如 `ineq5`、`ineq6`）的参数提取使用了 `.trim().replace(/['"]/g, '')`，如果用户输入格式略有偏差（如多余空格），会导致静默失败。

**建议：** 增加更精确的输入验证和错误提示。

---

### 🟠 ERR-03: `probability.js` 中 `factorial` 函数的溢出处理不一致

**文件：** [probability.js](file:///d:/calculate/renderer/probability.js#L112-L125)

```javascript
export function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('阶乘仅支持非负整数');
  }
  if (n > MAX_FACTORIAL_INPUT) {
    throw new Error(`阶乘输入不能超过 ${MAX_FACTORIAL_INPUT}`);
  }
  // ...
}
```

**问题：** `factorial` 在 `n=170` 时返回 `7.257415615307999e+306`，而 `n=171` 时抛出异常。但测试用例期望 `171!` 返回 `∞`，这与实际行为矛盾：

```javascript
it('171! returns Infinity (overflow)', () => {
  const result = evaluateExpression('171!');
  expect(result.result).toBe('∞'); // 实际会抛出错误
});
```

**建议：** 统一溢出行为——要么在 `factorial` 中检测到溢出时返回 `Infinity`，要么在 engine 层捕获异常后格式化为 `∞`。

---

### 🟡 ERR-04: `importJSON` 中的空 catch 块

**文件：** [spreadsheet.js](file:///d:/calculate/renderer/spreadsheet.js#L450-L452)

```javascript
} catch {
  /* ignore parse error */
}
```

**问题：** 静默忽略 JSON 解析错误，用户无法知道导入失败。

**建议：** 至少记录日志或显示错误提示。

---

### 🟡 ERR-05: `modal.js` 的 Promise 可能永远不被 resolve

**文件：** [modal.js](file:///d:/calculate/renderer/modules/modal.js#L43-L50)

```javascript
export function confirmAsync(message) {
  ensureModal();
  // ...
  return new Promise(resolve => {
    modalResolve = resolve;
  });
}
```

**问题：** 如果模态框打开后页面被导航或组件被销毁，Promise 将永远 pending，造成内存泄漏。

**建议：** 添加超时机制或在页面卸载时自动 resolve。

---

### 🔵 ERR-06: `generateTable` 中的浮点精度问题

**文件：** [engine.js](file:///d:/calculate/renderer/calculator/engine.js#L316-L336)

```javascript
const x = parseFloat((s + i * st).toPrecision(15));
```

**问题：** 使用 `toPrecision(15)` 处理浮点精度是正确的，但 `parseFloat` 后的值可能仍存在精度问题。例如 `0.1 + 0.2` 不等于 `0.3`。

**建议：** 考虑使用 Decimal.js 或 mathjs 的 BigNumber 模式处理精度敏感场景。

---

## 4. 性能审查

### 🟠 PERF-01: `formula-renderer.js` 中的正则表达式未预编译

**文件：** [formula-renderer.js](file:///d:/calculate/renderer/formula-renderer.js)

**问题：** `inputToLatex()` 函数中有 40+ 个正则表达式字面量，每次调用都会重新编译。在用户快速输入时（rAF 节流后仍有高频调用），这会造成不必要的 CPU 消耗。

```javascript
expr = expr.replace(/\bsin\(/g, '\\sin(');
expr = expr.replace(/\bcos\(/g, '\\cos(');
expr = expr.replace(/\btan\(/g, '\\tan(');
// ... 40+ 个 replace
```

**建议：** 将正则提升为模块级常量：

```javascript
const RE_SIN = /\bsin\(/g;
const RE_COS = /\bcos\(/g;
// ...
export function inputToLatex(input) {
  expr = expr.replace(RE_SIN, '\\sin(');
  // ...
}
```

---

### 🟠 PERF-02: `history.js` 使用 `debounce(300)` 保存但未节流渲染

**文件：** [history.js](file:///d:/calculate/renderer/history.js)

```javascript
const debouncedStoreSave = debounce(() => {
  store.set(STORAGE_KEY, historyItems);
}, 300);
```

**问题：** 存储写入已做防抖，但 `renderHistory()` 在每次 `addHistory` 后立即调用，且使用 `innerHTML` 完全重建列表。当用户快速连续计算时，会造成频繁的 DOM 操作。

**建议：**

1. 渲染也做防抖或节流
2. 使用增量更新而非全量重建

---

### 🟡 PERF-03: `special-functions.js` 的预编译正则对象过于庞大

**文件：** [special-functions.js](file:///d:/calculate/renderer/calculator/special-functions.js#L47-L88)

```javascript
const PATTERNS = Object.freeze({
  ratio: /^\s*ratio\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i
  // ... 30+ 个正则
});
```

**问题：** 预编译正则是正确的做法，但 `PATTERNS` 对象包含 30+ 个正则，且每个正则都有捕获组。当输入表达式不匹配任何特殊函数时（最常见情况），所有正则都会被尝试匹配，造成浪费。

**建议：**

1. 添加快速前置检查（如检查表达式是否包含已知函数名）
2. 按使用频率排序，优先匹配常见函数

---

### 🟡 PERF-04: `variables-panel.js` 的 `render()` 使用字符串拼接构建 HTML

**文件：** [variables-panel.js](file:///d:/calculate/renderer/modules/variables-panel.js#L53-L83)

```javascript
let html = '';
for (const name of varKeys.sort()) {
  html += `<div class="variable-item">...</div>`;
}
this.list.innerHTML = html;
```

**问题：** 使用 `escapeHtml` 函数（内部创建 DOM 元素）在循环中转义每个值，效率较低。

**建议：** 改用 `escapeAttr`（纯字符串实现）或使用 DOM API 直接构建。

---

### 🔵 PERF-05: `display.js` 的 rAF 节流实现

**文件：** [display.js](file:///d:/calculate/renderer/modules/display.js#L8-L21)

```javascript
let renderPending = false;
let pendingInput = null;
// ...
function flushRender() {
  renderPending = false;
  doUpdateDisplay(pendingInput, pendingResult, pendingCursor);
  // ...
}
```

**问题：** rAF 节流实现正确，但 `doUpdateDisplay` 内部调用 `katex.render()` 可能耗时较长（复杂公式），阻塞主线程。

**建议：** 对于超复杂公式（如大型矩阵），考虑使用 `requestIdleCallback` 或 Web Worker 预处理。

---

## 5. 代码质量审查

### 🟠 QUAL-01: `constants.js` 文件与 `shared/constants.js` 职责混淆

**文件：** [renderer/constants.js](file:///d:/calculate/renderer/constants.js)（未在代码中直接读取，但从 imports 可推断）

**问题：** 存在多个常量文件：

- `renderer/shared/constants.js` — ESM 格式，供渲染进程使用
- `shared/constants.cjs` — CJS 格式，供主进程使用
- `renderer/constants.js` — 看起来是常量库数据

命名容易混淆，且 `renderer/constants.js` 的存在与 `shared/constants.js` 可能造成导入路径混乱。

**建议：** 重命名为更具描述性的名称，如 `physics-constants.js` 或 `constants-library.js`。

---

### 🟡 QUAL-02: 注释语言混用

**问题：** 代码中混合使用中英文注释：

```javascript
// calculator/state.js
// 角度单位状态          ← 中文
let angleUnit = 'rad';

// calculator/engine.js
/**
 * Evaluate custom function call   ← 英文
 */
function evaluateCustomFunction(name, argValue) {
```

**建议：** 统一注释语言（建议中文，与目标用户一致）。

---

### 🟡 QUAL-03: `calculator.js` 中存在乱码注释

**文件：** [calculator.js](file:///d:/calculate/renderer/calculator.js#L1-L5)

```javascript
/**
 * 璁＄畻鍣ㄦā鍧?— 鍚戝悗鍏煎鍖呰灞?
 * 鎵€鏈夊姛鑳藉凡鎷嗗垎鍒?calculator/ 瀛愮洰褰曚笅鐨勭嫭绔绔嬫ā鍧?
 * 姝ゆ枃浠朵粎鍋?re-export锛屼繚鎸佸師鏈夊鍏ヨ矾寰勪笉鍙?
 */
```

**问题：** 文件头部注释为乱码（可能是编码问题导致的 UTF-8 乱码）。

**建议：** 修复为正确的中文注释。

---

### 🟡 QUAL-04: 未使用的导入

**问题：** 多个文件存在未使用的导入或变量。ESLint 已配置 `no-unused-vars` 规则，但使用了 `varsIgnorePattern: '^_'` 忽略前缀为 `_` 的变量。

**建议：** 定期清理未使用的导入，确保 ESLint 检查通过。

---

### 🔵 QUAL-05: `evalIneq` 函数的布尔逻辑不正确

**文件：** [number-theory.js](file:///d:/calculate/renderer/calculator/number-theory.js#L186-L199)

```javascript
export function evalIneq(polyPositive, op) {
  switch (op) {
    case '>=':
      return polyPositive || true; // ← 始终返回 true
    case '<=':
      return !polyPositive || true; // ← 始终返回 true
  }
}
```

**问题：** `>=` 和 `<=` 的实现逻辑错误。`polyPositive || true` 和 `!polyPositive || true` 始终返回 `true`，因为 `|| true` 短路求值的结果永远是 `true`。

**正确实现应为：**

- `>=`：`polyPositive || (value === 0)` — 需要额外检查值是否为零
- `<=`：`!polyPositive || (value === 0)`

这是一个**逻辑 Bug**，会导致不等式求解结果不准确。

---

### 🔵 QUAL-06: `download.js` 始终添加 BOM

**文件：** [download.js](file:///d:/calculate/renderer/utils/download.js#L12)

```javascript
const blob = new Blob(['\uFEFF' + content], { type: mime + ';charset=utf-8' });
```

**问题：** 无条件添加 UTF-8 BOM (`\uFEFF`)。虽然对 Excel 打开 CSV 有帮助，但对 JSON 文件来说是不必要的，且可能导致某些 JSON 解析器报错。

**建议：** 仅对 CSV 文件添加 BOM：

```javascript
const bom = mime === 'text/csv' ? '\uFEFF' : '';
const blob = new Blob([bom + content], { type: mime + ';charset=utf-8' });
```

---

## 6. 测试覆盖审查

### 🟠 TEST-01: 测试覆盖率阈值偏低

**文件：** [vitest.config.js](file:///d:/calculate/vitest.config.js#L8-L13)

```javascript
coverage: {
  thresholds: {
    lines: 60,
    branches: 50,
    functions: 60
  }
}
```

**问题：** 生产级项目通常要求 80%+ 的行覆盖率和 70%+ 的分支覆盖率。当前阈值（60%/50%/60%）偏低。

**建议：** 逐步提升至：

- Lines: 80%
- Branches: 70%
- Functions: 80%

---

### 🟠 TEST-02: 缺少 UI 模块的单元测试

**问题：** 测试目录中没有以下模块的测试：

- `modules/panel.js` — 面板管理器
- `modules/settings.js` — 设置管理器
- `modules/mode.js` — 模式切换
- `modules/display.js` — 显示更新
- `modules/plot.js` — 函数绘图
- `keyboard.js` — 键盘处理
- `formula-renderer.js` — 虽有测试文件，但覆盖有限

这些模块包含重要的业务逻辑和用户交互逻辑，缺少测试会增加回归风险。

**建议：** 优先为 `panel.js`、`settings.js`、`keyboard.js` 添加测试。

---

### 🟡 TEST-03: 测试中存在状态共享问题

**问题：** 多个测试使用 `afterAll` 重置状态，但如果测试失败，`afterAll` 可能不执行，导致后续测试受影响：

```javascript
describe('Angle mode', () => {
  afterAll(() => {
    setAngleUnit('rad'); // 如果前面的测试抛出异常，这行不会执行
  });
});
```

**建议：** 使用 `beforeEach` 而非 `afterAll` 来设置初始状态：

```javascript
describe('Angle mode', () => {
  beforeEach(() => {
    setAngleUnit('rad'); // 每个测试前重置
  });
});
```

---

### 🔵 TEST-04: 缺少集成测试和 E2E 测试

**问题：** 当前仅有单元测试，没有集成测试（验证模块间交互）和端到端测试（验证用户流程）。

**建议：**

1. 添加关键流程的集成测试（如：输入表达式 → 计算 → 显示结果 → 保存历史）
2. 考虑使用 Playwright 或 Cypress 添加 E2E 测试

---

### 🔵 TEST-05: 测试中的断言过于宽松

**问题：** 部分测试使用 `toContain` 而非精确匹配：

```javascript
it('adds matrices', () => {
  const result = evaluateExpression('[[1,2],[3,4]] + [[1,1],[1,1]]', 'matrix');
  expect(result.result).toContain('2'); // 过于宽松，"2" 可能出现在任何地方
});
```

**建议：** 使用更精确的断言：

```javascript
expect(result.result).toBe('[[2,3],[4,5]]');
```

---

## 7. 可维护性审查

### 🟠 MAINT-01: `app.js` 的 `bindEvents` 函数过长

**文件：** [app.js](file:///d:/calculate/renderer/app.js#L138-L432)

**问题：** `bindEvents` 函数有 294 行，包含 30+ 个事件绑定。这是典型的"长函数"反模式。

**建议：** 按功能区域拆分：

```javascript
function bindEvents() {
  bindKeypadEvents();
  bindHelperEvents();
  bindMemoryEvents();
  bindModeTabEvents();
  bindHeaderEvents();
  bindSettingsEvents();
}
```

---

### 🟡 MAINT-02: 缺少 CHANGELOG 自动化

**问题：** 项目有 `CHANGELOG.md` 文件，但没有自动化的版本管理和变更日志生成工具（如 conventional-changelog、semantic-release）。

**建议：** 集成 `standard-version` 或 `semantic-release` 自动生成变更日志。

---

### 🔵 MAINT-03: 缺少 TypeScript 类型定义

**问题：** 纯 JavaScript 项目，没有类型定义文件（`.d.ts`）或 JSDoc 类型注解。这降低了 IDE 的智能提示能力和代码可读性。

**建议：**

1. 为关键模块添加 JSDoc 类型注解
2. 或考虑逐步迁移到 TypeScript

---

### 🔵 MAINT-04: 文档与代码的同步问题

**问题：** `README.md` 和 `docs/` 目录中的文档描述了用户功能，但没有 API 文档或开发者文档。新开发者难以快速上手。

**建议：**

1. 为公共 API 添加 JSDoc 注释
2. 创建 `CONTRIBUTING.md` 指导贡献者

---

## 8. CI/CD 审查

### 🟠 CI-01: CI 中缺少安全扫描

**文件：** [.github/workflows/ci.yml](file:///d:/calculate/.github/workflows/ci.yml)

**问题：** CI 流程包含 lint、test、build，但缺少：

1. 依赖安全扫描（`npm audit` / `pnpm audit`）
2. 许可证合规检查
3. SAST（静态应用安全测试）

**建议：** 添加安全扫描步骤：

```yaml
- name: Security audit
  run: pnpm audit --audit-level=high
```

---

### 🟡 CI-02: 构建产物未签名

**问题：** Electron 构建产物（`.exe`、`.dmg`、`.AppImage`）未进行代码签名。在 macOS 和 Windows 上会触发安全警告。

**建议：** 配置 electron-builder 的代码签名选项。

---

### 🔵 CI-03: 未配置 Dependabot 或 Renovate

**问题：** 没有自动化的依赖更新机制，依赖可能逐渐过时并积累安全漏洞。

**建议：** 配置 Dependabot 或 Renovate 自动创建依赖更新 PR。

---

## 9. 问题汇总与优先级

### 🔴 严重问题（需立即修复）

| ID      | 问题                                    | 文件             | 建议                  |
| ------- | --------------------------------------- | ---------------- | --------------------- |
| SEC-01  | `escapeHtml` 实现依赖 DOM               | escape.js        | 改用纯字符串实现      |
| ERR-01  | `evaluateExpression` try-catch 范围过大 | engine.js        | 分层捕获              |
| QUAL-05 | `evalIneq` 布尔逻辑错误                 | number-theory.js | 修复 `\|\| true` 逻辑 |

### 🟠 中等问题（建议近期修复）

| ID       | 问题                     | 文件                 |
| -------- | ------------------------ | -------------------- |
| SEC-02   | `innerHTML` 渲染用户内容 | history.js           |
| SEC-03   | LaTeX 输入无长度限制     | formula-renderer.js  |
| ARCH-01  | `app.js` 职责过重        | app.js               |
| ARCH-02  | 全局可变状态管理分散     | calculator/state.js  |
| ERR-02   | 正则匹配失败静默忽略     | special-functions.js |
| ERR-03   | factorial 溢出处理不一致 | probability.js       |
| PERF-01  | 正则表达式未预编译       | formula-renderer.js  |
| PERF-02  | 历史渲染未节流           | history.js           |
| QUAL-01  | 常量文件命名混淆         | constants.js         |
| TEST-01  | 测试覆盖率阈值偏低       | vitest.config.js     |
| TEST-02  | 缺少 UI 模块测试         | test/                |
| MAINT-01 | `bindEvents` 函数过长    | app.js               |
| CI-01    | 缺少安全扫描             | ci.yml               |

### 🟡 轻微问题（可安排修复）

| ID      | 问题                     |
| ------- | ------------------------ |
| SEC-04  | CSV 导出引号转义不完整   |
| ARCH-03 | 重复的入口文件           |
| ERR-04  | 空 catch 块              |
| ERR-05  | Promise 可能永远 pending |
| PERF-03 | PATTERNS 对象过大        |
| PERF-04 | 字符串拼接构建 HTML      |
| QUAL-02 | 注释语言混用             |
| QUAL-03 | 乱码注释                 |
| QUAL-04 | 未使用的导入             |
| TEST-03 | 测试状态共享             |
| TEST-05 | 断言过于宽松             |
| CI-02   | 构建产物未签名           |

### 🔵 改进建议（长期优化）

| ID       | 问题                     |
| -------- | ------------------------ |
| SEC-05   | CSP 策略缺失             |
| ARCH-04  | 事件总线缺少类型约束     |
| ARCH-05  | 存储适配器缺少接口定义   |
| ERR-06   | 浮点精度问题             |
| PERF-05  | 复杂公式渲染阻塞主线程   |
| QUAL-06  | BOM 添加不区分文件类型   |
| TEST-04  | 缺少集成测试和 E2E 测试  |
| MAINT-02 | 缺少 CHANGELOG 自动化    |
| MAINT-03 | 缺少 TypeScript 类型定义 |
| MAINT-04 | 缺少开发者文档           |
| CI-03    | 未配置自动依赖更新       |

---

## 附录：值得肯定的设计

在指出问题的同时，以下设计值得肯定：

1. **安全意识良好**：Electron 主进程配置了 `contextIsolation`、`sandbox`、导航限制、权限拒绝等安全策略
2. **存储安全**：键白名单、值大小限制、主框架验证等安全措施到位
3. **电子表格安全性**：`spreadsheet.js` 使用自研的递归下降解析器替代 `eval()`，避免了代码注入
4. **输入验证**：表达式长度限制、多语句数量限制等防护措施
5. **错误友好化**：`getFriendlyError` 将技术错误转换为用户友好的中文提示
6. **性能优化意识**：rAF 节流、debounce、DocumentFragment 等优化手段
7. **模块化架构**：calculator/ 子目录的模块拆分清晰，职责单一
8. **CI/CD 完善**：多 Node 版本测试、多平台构建、自动化发布流程
9. **测试覆盖广泛**：1100+ 行测试代码，覆盖了主要计算功能和边界情况
10. **国际化支持**：i18n 模块支持中英文切换

---

> 审查结论：项目整体质量良好，主要问题集中在 `escapeHtml` 实现、错误处理粒度和测试覆盖率三个方面。建议按优先级逐步修复，优先处理 🔴 严重问题。
