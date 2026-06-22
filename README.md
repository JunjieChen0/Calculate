# calculate_JYY — 科学计算器 / Scientific Calculator

<p align="center">
  <img src="assets/icons/icon.png" width="120" alt="calculate_JYY icon" />
</p>

<p align="center">
  <strong>中文</strong> · <a href="#english-manual">English</a>
</p>

---

# 中文说明书

## 概述

calculate_JYY 是一款基于 Electron 的图形化科学计算器，功能对标卡西欧 fx-991 系列。支持 8 种计算模式、LaTeX 实时公式渲染、深色/浅色主题、完整历史记录和内置常量库。

**技术栈**: Electron · mathjs · KaTeX · Chart.js · Vite · Vitest

---

## 安装与运行

```bash
# 安装依赖
pnpm install

# 开发模式（热更新）
pnpm electron:dev

# 直接启动
pnpm start

# 构建安装包
pnpm build:electron

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

---

## 界面布局

```
┌─────────────────────────────────────┐
│  ☰ 历史  │  calculate_JYY  │  📦 📊 S⇔D ⚙ 🌙  │  ← 顶栏
├─────────────────────────────────────┤
│                                     │
│         公式预览区 (LaTeX)           │  ← 实时渲染输入的公式
│                                     │
│           结果显示区                 │  ← 计算结果
│                                     │
├─────────────────────────────────────┤
│  标准 │ 复数 │ 矩阵 │ 向量 │ 求解 │ 进制 │ 换算 │ 统计  │  ← 模式标签
├─────────────────────────────────────┤
│  辅助面板 (根据模式动态变化)         │  ← 快捷插入按钮
├─────────────────────────────────────┤
│  MC │ MR │ M+ │ M- │ MS            │  ← 记忆按钮
├─────────────────────────────────────┤
│  sin⁻¹ cos⁻¹ tan⁻¹ |x| ⌊x⌋       │  ← 函数键
│  sin  cos  tan  √   ⌈x⌉           │
│  log  ln   ^   (   )               │
│  7   8   9   AC   ⌫                │  ← 数字键与清除
│  4   5   6   ×    ÷                │
│  1   2   3   +    −                │
│  0   .   00  ,    =                │  ← 等号键
└─────────────────────────────────────┘
```

---

## 8 种计算模式

### 1. 标准模式 (Standard)

基础四则运算、科学函数、括号、幂运算、阶乘。

| 输入                | 结果   | 说明     |
| ------------------- | ------ | -------- |
| `1+2*3`             | `7`    | 四则运算 |
| `(1+2)*3`           | `9`    | 括号     |
| `2^10`              | `1024` | 幂运算   |
| `5!`                | `120`  | 阶乘     |
| `sin(pi/2)`         | `1`    | 三角函数 |
| `sqrt(16)`          | `4`    | 平方根   |
| `log10(100)`        | `2`    | 常用对数 |
| `ln(e)`             | `1`    | 自然对数 |
| `abs(-5)`           | `5`    | 绝对值   |
| `floor(3.7)`        | `3`    | 向下取整 |
| `ceil(2.1)`         | `3`    | 向上取整 |
| `round(3.14159, 2)` | `3.14` | 四舍五入 |

**辅助面板快捷按钮**: `i` `e` `π` `!` `%` `nPr` `nCr` `Rand` `polar` `rect` `ratio` `Ans`

**特殊函数**:

- `ratio(a,b,c)` — 解比例 a:b = c:x，返回 x
- `polar(re,im)` — 直角坐标转极坐标
- `rect(r,θ)` — 极坐标转直角坐标
- `nPr(n,r)` — 排列数
- `nCr(n,r)` — 组合数
- `rand()` — 0~1 随机数

---

### 2. 复数模式 (Complex)

复数四则运算、模、辐角、共轭。

| 输入           | 结果     | 说明     |
| -------------- | -------- | -------- |
| `(2+3i)*(1-i)` | `5 + i`  | 复数乘法 |
| `abs(3+4i)`    | `5`      | 复数模   |
| `conj(2+3i)`   | `2 - 3i` | 共轭复数 |
| `sqrt(-1)`     | `i`      | 虚数单位 |

**辅助面板快捷按钮**: `i` `e` `π` `\|z\|` `√` `polar` `rect` `Arg` `Conj` `Ans`

---

### 3. 矩阵模式 (Matrix)

矩阵加减乘、行列式、逆矩阵、转置、迹、特征值。

**输入格式**: 使用 `[[a,b],[c,d]]` 表示矩阵

| 输入                            | 结果            | 说明             |
| ------------------------------- | --------------- | ---------------- |
| `[[1,2],[3,4]] + [[1,1],[1,1]]` | `[[2,3],[4,5]]` | 矩阵加法         |
| `[[1,2],[3,4]] * [[1,0],[0,1]]` | `[[1,2],[3,4]]` | 矩阵乘法         |
| `det([[1,2],[3,4]])`            | `-2`            | 行列式           |
| `inv([[1,2],[3,4]])`            | 逆矩阵          | 逆矩阵           |
| `transpose([[1,2],[3,4]])`      | `[[1,3],[2,4]]` | 转置             |
| `trace([[1,2],[3,4]])`          | `5`             | 迹（对角线之和） |
| `eig([[2,0],[0,3]])`            | 特征值          | 特征值           |

**辅助面板快捷按钮**: `[[` `]]` `,` `det` `inv` `T` `tr` `eig` `Ans`

---

### 4. 向量模式 (Vector)

点积、叉积、模长、单位化、投影。

**输入格式**: 使用 `[a,b,c]` 表示向量

| 输入                     | 结果      | 说明   |
| ------------------------ | --------- | ------ |
| `dot([1,2,3],[4,5,6])`   | `32`      | 点积   |
| `cross([1,0,0],[0,1,0])` | `[0,0,1]` | 叉积   |
| `norm([3,4])`            | `5`       | 模长   |
| `unit([3,4])`            | 单位向量  | 单位化 |
| `proj([1,2],[3,0])`      | 投影向量  | 投影   |

**辅助面板快捷按钮**: `[` `]` `,` `dot` `cross` `norm` `unit` `proj` `Ans`

---

### 5. 求解模式 (Solve)

方程求解与方程组求解。

#### 方程求解

| 输入          | 结果      | 说明         |
| ------------- | --------- | ------------ |
| `x^2 - 4 = 0` | `[-2, 2]` | 通用方程求解 |
| `x^2 = 4`     | `[-2, 2]` | 等号形式     |

> **注意**: 键盘 `=` 键在求解模式下插入等号（而非触发计算），按 `Enter` 触发计算。

#### 特定方程求解器

| 输入                                    | 结果            | 说明                    |
| --------------------------------------- | --------------- | ----------------------- |
| `solve2(1,-5,6)`                        | `[2, 3]`        | 一元二次 ax²+bx+c=0     |
| `solve3(1,-6,11,-6)`                    | `[1, 2, 3]`     | 一元三次 ax³+bx²+cx+d=0 |
| `solveLinear2(1,1,5,2,1,7)`             | `x=2, y=3`      | 二元一次方程组          |
| `solveLinear3(1,0,0,1,0,1,0,1,0,0,1,1)` | `x=1, y=1, z=1` | 三元一次方程组          |

**辅助面板快捷按钮**: `一元二次` `一元三次` `二元一次` `三元一次` `=` `x` `y` `z` `Ans`

---

### 6. 进制模式 (Base)

二进制、八进制、十进制、十六进制转换与整数运算。

#### 进制转换

| 输入          | 结果     | 说明     |
| ------------- | -------- | -------- |
| `bin(10)`     | `0b1010` | 十转二   |
| `oct(255)`    | `0o377`  | 十转八   |
| `hex(255)`    | `0xFF`   | 十转十六 |
| `dec(0b1010)` | `10`     | 二转十   |

#### 整数运算（在当前进制下）

| 输入（DEC 模式） | 结果 | 说明     |
| ---------------- | ---- | -------- |
| `5 & 3`          | `1`  | 按位 AND |
| `5 \| 3`         | `7`  | 按位 OR  |
| `5 ^^ 3`         | `6`  | 按位 XOR |
| `~5`             | `-6` | 按位 NOT |
| `5 << 1`         | `10` | 左移     |
| `5 >> 1`         | `2`  | 右移     |

**辅助面板快捷按钮**: `BIN` `OCT` `DEC` `HEX` `A-F`(HEX 模式) `AND` `OR` `XOR` `NOT` `<<` `>>` `Ans`

> 选择不同进制基数时，不可用的数字键会自动变暗。

---

### 7. 换算模式 (Convert)

单位换算，基于 mathjs 内置单位系统。

**格式**: `数值 单位 to 目标单位`

| 输入              | 结果        | 说明     |
| ----------------- | ----------- | -------- |
| `100 cm to m`     | `1 m`       | 厘米→米  |
| `1 km to m`       | `1000 m`    | 千米→米  |
| `1 kg to g`       | `1000 g`    | 千克→克  |
| `1 h to s`        | `3600 s`    | 小时→秒  |
| `100 km/h to m/s` | `27.78 m/s` | 速度换算 |

**辅助面板快捷按钮**: `→` `cm` `m` `km` `kg` `g` `s` `min` `h` `Ans`

---

### 8. 统计模式 (Stats)

统计计算函数。

| 输入                    | 结果   | 说明   |
| ----------------------- | ------ | ------ |
| `mean([1,2,3,4,5])`     | `3`    | 平均值 |
| `median([1,2,3,4,5])`   | `3`    | 中位数 |
| `std([1,2,3,4,5])`      | `1.58` | 标准差 |
| `variance([1,2,3,4,5])` | `2.5`  | 方差   |
| `sum([1,2,3,4,5])`      | `15`   | 总和   |
| `min([1,2,3,4,5])`      | `1`    | 最小值 |
| `max([1,2,3,4,5])`      | `5`    | 最大值 |

**辅助面板快捷按钮**: `mean` `median` `std` `var` `sum` `min` `max` `,` `Ans`

---

## 辅助功能

### 记忆功能 (Memory)

| 按钮   | 功能                     |
| ------ | ------------------------ |
| **MS** | 将当前结果存入记忆       |
| **MR** | 读取记忆值并插入表达式   |
| **M+** | 将当前结果加到记忆值     |
| **M-** | 将当前结果从记忆值中减去 |
| **MC** | 清除记忆                 |

> 记忆值跨会话持久化。复数/矩阵等非数值结果无法存入记忆，会提示"无法存储非数值结果"。

### 常量库

点击顶栏 📦 图标打开常量库面板，内置 24 个常用常量：

**数学**: π（圆周率）、e（自然常数）、φ（黄金比例）、i（虚数单位）、√2、√3、Ω（朗伯 W 函数）

**物理**: c（光速）、G（引力常数）、h（普朗克常数）、ℏ（约化普朗克常数）、k（玻尔兹曼常数）、Nₐ（阿伏伽德罗常数）、e⁻（元电荷）、mₑ（电子质量）、mₚ（质子质量）、mₙ（中子质量）、μ₀（真空磁导率）、ε₀（真空介电常数）、g（标准重力加速度）、R（气体常数）

**天文**: M⊕（地球质量）、M☉（太阳质量）、AU（天文单位）、pc（秒差距）

点击常量即可插入表达式。支持搜索（按名称、符号、类别）。

### 历史记录

点击顶栏 ☰ 图标或按 `Ctrl+H` 打开历史记录面板。

- **查看**: 显示所有历史记录（最多 100 条）
- **搜索**: 在搜索框中输入关键词过滤
- **回填**: 点击历史条目，表达式和结果回填到计算器
- **删除**: 点击条目右侧 × 按钮删除单条
- **清空**: 点击"清空"按钮清除所有历史
- **导出**: 点击"导出"按钮将历史记录保存为 JSON 文件
- **关闭**: 点击 ✕ 按钮或按 `Escape` 关闭面板

### 数值表格 (Table)

点击顶栏 📊 图标打开数值表格面板。

1. 输入函数表达式（如 `x^2`、`sin(x)`、`2x+1`）
2. 设置起始值、结束值、步长
3. 点击"生成表格"查看 (x, f(x)) 表格
4. 点击"绘制图像"查看函数图像

> 支持最多 1000 个数据点。

### 图像绘制 (Plot)

在数值表格面板中点击"绘制图像"或"图像"标签页。

- 自动采样 200 个点绘制函数曲线
- 支持缩放和悬停查看精确坐标
- 主题联动（深色/浅色主题自动切换图表配色）

### 设置面板

点击顶栏 ⚙ 图标打开设置面板。

| 设置项           | 说明                                         |
| ---------------- | -------------------------------------------- |
| **结果精度**     | 0-15 位小数可调（滑块）                      |
| **显示格式**     | NORM（标准）/ FIX（定点）/ SCI（科学计数法） |
| **角度模式**     | RAD（弧度）/ DEG（角度）/ GRAD（百分度）     |
| **工程符号**     | 开启后以 k、M、G、m、μ 等前缀显示            |
| **括号自动补全** | 开启后计算时自动补全未闭合括号               |
| **进制模式基数** | DEC / BIN / OCT / HEX                        |

所有设置自动持久化，重启后恢复。

### 主题切换

点击顶栏 🌙/☀ 图标或按 `Ctrl+T` 切换深色/浅色主题。

- **深色主题**: Catppuccin Mocha 配色
- **浅色主题**: Catppuccin Latte 配色
- 偏好自动记忆

### 分数/小数切换 (S⇔D)

点击顶栏 `S⇔D` 按钮，在小数和分数显示之间切换。

- `0.5` ↔ `1/2`
- `0.75` ↔ `3/4`
- `0.333...` ↔ `1/3`

### 结果复制

鼠标悬停在结果区域，点击右上角复制图标即可复制结果到剪贴板。

### 括号自动补全

- 输入 `sin(90` 后按 `Tab` 或 `=`，自动补全为 `sin(90)`
- 支持嵌套括号：`((1+2` → `((1+2))`
- 可在设置中关闭

---

## 角度单位

| 模式     | 说明         | sin(90)             | sin(100)              |
| -------- | ------------ | ------------------- | --------------------- |
| **RAD**  | 弧度（默认） | sin(90 rad) ≈ 0.894 | sin(100 rad) ≈ -0.506 |
| **DEG**  | 角度         | sin(90°) = 1        | sin(100°) ≈ 0.985     |
| **GRAD** | 百分度       | sin(100 grad) = 1   | sin(111.11 grad) = 1  |

切换方式：

- 点击辅助面板中的 `RAD`/`DEG`/`GRAD` 按钮
- 在设置面板中点击角度模式按钮

反三角函数（asin、acos、atan）的输出会自动转换为当前角度单位。

---

## 显示格式

| 格式     | 说明       | 示例 (π)             |
| -------- | ---------- | -------------------- |
| **NORM** | 标准显示   | `3.14159265359`      |
| **FIX**  | 定点小数   | `3.1416`（FIX 4）    |
| **SCI**  | 科学计数法 | `3.1416e+0`（SCI 4） |

---

## LaTeX 公式渲染

所有输入实时以 LaTeX 数学排版显示：

| 输入            | 渲染效果   |
| --------------- | ---------- |
| `sin(pi/2)`     | sin(π/2)   |
| `sqrt(16)`      | √16        |
| `abs(x+3)`      | \|x+3\|    |
| `2^10`          | 2¹⁰        |
| `log10(100)`    | log₁₀(100) |
| `[[1,2],[3,4]]` | 矩阵排版   |
| `floor(3.7)`    | ⌊3.7⌋      |
| `ceil(2.1)`     | ⌈2.1⌉      |

---

## 键盘快捷键

| 快捷键              | 功能                           |
| ------------------- | ------------------------------ |
| `0-9` `. `          | 数字输入                       |
| `+` `-` `*` `/` `^` | 运算符                         |
| `(` `)`             | 括号                           |
| `=`                 | 计算结果（求解模式下插入等号） |
| `Enter`             | 计算结果                       |
| `Backspace`         | 退格删除                       |
| `Escape`            | 关闭面板 / 清空输入            |
| `Tab`               | 自动补全括号                   |
| `←` `→`             | 光标移动                       |
| `Space`             | 插入空格                       |
| `Ctrl+H`            | 打开/关闭历史记录              |
| `Ctrl+T`            | 切换主题                       |
| `Ctrl+L`            | 清空历史记录                   |

---

## 常见问题

**Q: 为什么 `sin(90)` 不等于 1？**
A: 默认角度模式是弧度（RAD）。切换到角度模式（DEG）后 `sin(90)` = 1。

**Q: 如何输入复数？**
A: 切换到复数模式，使用 `i` 表示虚数单位，如 `2+3i`。

**Q: 如何输入矩阵？**
A: 切换到矩阵模式，使用 `[[1,2],[3,4]]` 格式，行间用 `],[` 分隔。

**Q: 历史记录最多保存多少条？**
A: 最多 100 条，自动去重（连续相同表达式不重复记录）。

**Q: 设置会丢失吗？**
A: 不会。所有设置（精度、格式、角度单位、主题等）自动持久化到本地存储。

---

# English Manual

## Overview

calculate_JYY is a modern graphical scientific calculator built with Electron, comparable to the Casio fx-991 series. It supports 8 calculation modes, real-time LaTeX formula rendering, dark/light themes, full history management, and a built-in constants library.

**Tech Stack**: Electron · mathjs · KaTeX · Chart.js · Vite · Vitest

---

## Installation & Running

```bash
# Install dependencies
pnpm install

# Development mode (hot reload)
pnpm electron:dev

# Launch directly
pnpm start

# Build installer
pnpm build:electron

# Run tests
pnpm test

# Lint check
pnpm lint
```

---

## Interface Layout

```
┌─────────────────────────────────────┐
│  ☰ History │ calculate_JYY │ 📦 📊 S⇔D ⚙ 🌙  │  ← Header
├─────────────────────────────────────┤
│                                     │
│        Formula Preview (LaTeX)      │  ← Real-time rendered formula
│                                     │
│           Result Display            │  ← Calculation result
│                                     │
├─────────────────────────────────────┤
│ Standard │ Complex │ Matrix │ Vector │ Solve │ Base │ Convert │ Stats │  ← Mode Tabs
├─────────────────────────────────────┤
│  Helper Panel (changes per mode)    │  ← Quick insert buttons
├─────────────────────────────────────┤
│  MC │ MR │ M+ │ M- │ MS            │  ← Memory buttons
├─────────────────────────────────────┤
│  sin⁻¹ cos⁻¹ tan⁻¹ |x| ⌊x⌋       │  ← Function keys
│  sin  cos  tan  √   ⌈x⌉           │
│  log  ln   ^   (   )               │
│  7   8   9   AC   ⌫                │  ← Number keys & clear
│  4   5   6   ×    ÷                │
│  1   2   3   +    −                │
│  0   .   00  ,    =                │  ← Equals key
└─────────────────────────────────────┘
```

---

## 8 Calculation Modes

### 1. Standard Mode

Basic arithmetic, scientific functions, parentheses, powers, and factorials.

| Input               | Result | Description            |
| ------------------- | ------ | ---------------------- |
| `1+2*3`             | `7`    | Basic arithmetic       |
| `(1+2)*3`           | `9`    | Parentheses            |
| `2^10`              | `1024` | Power                  |
| `5!`                | `120`  | Factorial              |
| `sin(pi/2)`         | `1`    | Trigonometric function |
| `sqrt(16)`          | `4`    | Square root            |
| `log10(100)`        | `2`    | Common logarithm       |
| `ln(e)`             | `1`    | Natural logarithm      |
| `abs(-5)`           | `5`    | Absolute value         |
| `floor(3.7)`        | `3`    | Floor                  |
| `ceil(2.1)`         | `3`    | Ceiling                |
| `round(3.14159, 2)` | `3.14` | Round                  |

**Helper Panel**: `i` `e` `π` `!` `%` `nPr` `nCr` `Rand` `polar` `rect` `ratio` `Ans`

**Special Functions**:

- `ratio(a,b,c)` — Solve proportion a:b = c:x, returns x
- `polar(re,im)` — Convert rectangular to polar coordinates
- `rect(r,θ)` — Convert polar to rectangular coordinates
- `nPr(n,r)` — Permutations
- `nCr(n,r)` — Combinations
- `rand()` — Random number between 0 and 1

---

### 2. Complex Mode

Complex arithmetic, modulus, argument, conjugate.

| Input          | Result   | Description            |
| -------------- | -------- | ---------------------- |
| `(2+3i)*(1-i)` | `5 + i`  | Complex multiplication |
| `abs(3+4i)`    | `5`      | Complex modulus        |
| `conj(2+3i)`   | `2 - 3i` | Complex conjugate      |
| `sqrt(-1)`     | `i`      | Imaginary unit         |

**Helper Panel**: `i` `e` `π` `\|z\|` `√` `polar` `rect` `Arg` `Conj` `Ans`

---

### 3. Matrix Mode

Matrix addition, subtraction, multiplication, determinant, inverse, transpose, trace, eigenvalues.

**Input format**: Use `[[a,b],[c,d]]` for matrices

| Input                           | Result          | Description             |
| ------------------------------- | --------------- | ----------------------- |
| `[[1,2],[3,4]] + [[1,1],[1,1]]` | `[[2,3],[4,5]]` | Matrix addition         |
| `[[1,2],[3,4]] * [[1,0],[0,1]]` | `[[1,2],[3,4]]` | Matrix multiplication   |
| `det([[1,2],[3,4]])`            | `-2`            | Determinant             |
| `inv([[1,2],[3,4]])`            | Inverse matrix  | Matrix inverse          |
| `transpose([[1,2],[3,4]])`      | `[[1,3],[2,4]]` | Transpose               |
| `trace([[1,2],[3,4]])`          | `5`             | Trace (sum of diagonal) |
| `eig([[2,0],[0,3]])`            | Eigenvalues     | Eigenvalues             |

**Helper Panel**: `[[` `]]` `,` `det` `inv` `T` `tr` `eig` `Ans`

---

### 4. Vector Mode

Dot product, cross product, magnitude, unit vector, projection.

**Input format**: Use `[a,b,c]` for vectors

| Input                    | Result            | Description   |
| ------------------------ | ----------------- | ------------- |
| `dot([1,2,3],[4,5,6])`   | `32`              | Dot product   |
| `cross([1,0,0],[0,1,0])` | `[0,0,1]`         | Cross product |
| `norm([3,4])`            | `5`               | Magnitude     |
| `unit([3,4])`            | Unit vector       | Normalize     |
| `proj([1,2],[3,0])`      | Projection vector | Projection    |

**Helper Panel**: `[` `]` `,` `dot` `cross` `norm` `unit` `proj` `Ans`

---

### 5. Solve Mode

Equation and system of equations solving.

#### General Equation Solving

| Input         | Result    | Description             |
| ------------- | --------- | ----------------------- |
| `x^2 - 4 = 0` | `[-2, 2]` | General equation solver |
| `x^2 = 4`     | `[-2, 2]` | Equals sign format      |

> **Note**: The `=` key inserts an equals sign in Solve mode (instead of triggering calculation). Press `Enter` to calculate.

#### Specific Equation Solvers

| Input                                   | Result          | Description          |
| --------------------------------------- | --------------- | -------------------- |
| `solve2(1,-5,6)`                        | `[2, 3]`        | Quadratic ax²+bx+c=0 |
| `solve3(1,-6,11,-6)`                    | `[1, 2, 3]`     | Cubic ax³+bx²+cx+d=0 |
| `solveLinear2(1,1,5,2,1,7)`             | `x=2, y=3`      | 2×2 linear system    |
| `solveLinear3(1,0,0,1,0,1,0,1,0,0,1,1)` | `x=1, y=1, z=1` | 3×3 linear system    |

**Helper Panel**: `Quadratic` `Cubic` `2-var` `3-var` `=` `x` `y` `z` `Ans`

---

### 6. Base Mode

Binary, octal, decimal, hexadecimal conversion and integer arithmetic.

#### Base Conversion

| Input         | Result   | Description |
| ------------- | -------- | ----------- |
| `bin(10)`     | `0b1010` | Dec → Bin   |
| `oct(255)`    | `0o377`  | Dec → Oct   |
| `hex(255)`    | `0xFF`   | Dec → Hex   |
| `dec(0b1010)` | `10`     | Bin → Dec   |

#### Integer Arithmetic (in current base)

| Input (DEC mode) | Result | Description |
| ---------------- | ------ | ----------- |
| `5 & 3`          | `1`    | Bitwise AND |
| `5 \| 3`         | `7`    | Bitwise OR  |
| `5 ^^ 3`         | `6`    | Bitwise XOR |
| `~5`             | `-6`   | Bitwise NOT |
| `5 << 1`         | `10`   | Left shift  |
| `5 >> 1`         | `2`    | Right shift |

**Helper Panel**: `BIN` `OCT` `DEC` `HEX` `A-F`(HEX mode) `AND` `OR` `XOR` `NOT` `<<` `>>` `Ans`

> When selecting a different base, unavailable digit keys automatically dim.

---

### 7. Convert Mode

Unit conversion powered by mathjs built-in unit system.

**Format**: `value unit to target unit`

| Input             | Result      | Description          |
| ----------------- | ----------- | -------------------- |
| `100 cm to m`     | `1 m`       | Centimeters → Meters |
| `1 km to m`       | `1000 m`    | Kilometers → Meters  |
| `1 kg to g`       | `1000 g`    | Kilograms → Grams    |
| `1 h to s`        | `3600 s`    | Hours → Seconds      |
| `100 km/h to m/s` | `27.78 m/s` | Speed conversion     |

**Helper Panel**: `→` `cm` `m` `km` `kg` `g` `s` `min` `h` `Ans`

---

### 8. Stats Mode

Statistical functions.

| Input                   | Result | Description        |
| ----------------------- | ------ | ------------------ |
| `mean([1,2,3,4,5])`     | `3`    | Mean               |
| `median([1,2,3,4,5])`   | `3`    | Median             |
| `std([1,2,3,4,5])`      | `1.58` | Standard deviation |
| `variance([1,2,3,4,5])` | `2.5`  | Variance           |
| `sum([1,2,3,4,5])`      | `15`   | Sum                |
| `min([1,2,3,4,5])`      | `1`    | Minimum            |
| `max([1,2,3,4,5])`      | `5`    | Maximum            |

**Helper Panel**: `mean` `median` `std` `var` `sum` `min` `max` `,` `Ans`

---

## Auxiliary Features

### Memory

| Button | Function                                       |
| ------ | ---------------------------------------------- |
| **MS** | Store current result in memory                 |
| **MR** | Recall memory value and insert into expression |
| **M+** | Add current result to memory                   |
| **M-** | Subtract current result from memory            |
| **MC** | Clear memory                                   |

> Memory persists across sessions. Non-numeric results (complex/matrix) cannot be stored.

### Constants Library

Click the 📦 icon in the header to open the constants panel. 24 built-in constants:

**Math**: π, e (Euler's number), φ (golden ratio), i (imaginary unit), √2, √3, Ω (Lambert W)

**Physics**: c (speed of light), G (gravitational constant), h (Planck constant), ℏ (reduced Planck), k (Boltzmann), Nₐ (Avogadro), e⁻ (elementary charge), mₑ (electron mass), mₚ (proton mass), mₙ (neutron mass), μ₀ (vacuum permeability), ε₀ (vacuum permittivity), g (standard gravity), R (gas constant)

**Astronomy**: M⊕ (Earth mass), M☉ (Solar mass), AU (astronomical unit), pc (parsec)

Click a constant to insert it into the expression. Supports search by name, symbol, or category.

### History

Click the ☰ icon or press `Ctrl+H` to open the history panel.

- **View**: Displays all history entries (up to 100)
- **Search**: Filter by keyword in the search box
- **Recall**: Click an entry to fill the expression and result back into the calculator
- **Delete**: Click the × button on an entry to delete it
- **Clear All**: Click "Clear" to remove all history
- **Export**: Click "Export" to save history as a JSON file
- **Close**: Click ✕ or press `Escape`

### Numerical Table (Table)

Click the 📊 icon to open the table panel.

1. Enter a function expression (e.g., `x^2`, `sin(x)`, `2x+1`)
2. Set start value, end value, and step size
3. Click "Generate Table" to view the (x, f(x)) table
4. Click "Plot" to view the function graph

> Supports up to 1000 data points.

### Plot / Chart

In the table panel, click "Plot" or the "Plot" tab.

- Automatically samples 200 points to draw the function curve
- Supports zoom and hover for precise coordinates
- Theme-aware (dark/light themes automatically switch chart colors)

### Settings Panel

Click the ⚙ icon to open the settings panel.

| Setting                  | Description                                                     |
| ------------------------ | --------------------------------------------------------------- |
| **Precision**            | 0–15 decimal places (slider)                                    |
| **Display Format**       | NORM (standard) / FIX (fixed-point) / SCI (scientific notation) |
| **Angle Mode**           | RAD (radians) / DEG (degrees) / GRAD (gradians)                 |
| **Engineering Notation** | Display with k, M, G, m, μ prefixes                             |
| **Auto-Bracket**         | Auto-complete unclosed brackets on calculation                  |
| **Base Mode Radix**      | DEC / BIN / OCT / HEX                                           |

All settings are automatically persisted and restored on restart.

### Theme Toggle

Click the 🌙/☀ icon or press `Ctrl+T` to switch between dark and light themes.

- **Dark Theme**: Catppuccin Mocha color scheme
- **Light Theme**: Catppuccin Latte color scheme
- Preference is automatically saved

### Fraction/Decimal Toggle (S⇔D)

Click the `S⇔D` button in the header to toggle between decimal and fraction display.

- `0.5` ↔ `1/2`
- `0.75` ↔ `3/4`
- `0.333...` ↔ `1/3`

### Copy Result

Hover over the result area and click the copy icon (top-right) to copy the result to clipboard.

### Auto-Bracket Completion

- Type `sin(90` then press `Tab` or `=` to auto-complete to `sin(90)`
- Supports nested brackets: `((1+2` → `((1+2))`
- Can be disabled in settings

---

## Angle Units

| Mode     | Description       | sin(90)             | sin(100)              |
| -------- | ----------------- | ------------------- | --------------------- |
| **RAD**  | Radians (default) | sin(90 rad) ≈ 0.894 | sin(100 rad) ≈ -0.506 |
| **DEG**  | Degrees           | sin(90°) = 1        | sin(100°) ≈ 0.985     |
| **GRAD** | Gradians          | sin(100 grad) = 1   | sin(111.11 grad) = 1  |

Switch by:

- Clicking the `RAD`/`DEG`/`GRAD` button in the helper panel
- Clicking the angle mode button in the settings panel

Inverse trig functions (asin, acos, atan) output is automatically converted to the current angle unit.

---

## Display Formats

| Format   | Description          | Example (π)         |
| -------- | -------------------- | ------------------- |
| **NORM** | Standard display     | `3.14159265359`     |
| **FIX**  | Fixed-point decimals | `3.1416` (FIX 4)    |
| **SCI**  | Scientific notation  | `3.1416e+0` (SCI 4) |

---

## LaTeX Formula Rendering

All input is rendered in real-time with LaTeX mathematical typesetting:

| Input           | Rendered      |
| --------------- | ------------- |
| `sin(pi/2)`     | sin(π/2)      |
| `sqrt(16)`      | √16           |
| `abs(x+3)`      | \|x+3\|       |
| `2^10`          | 2¹⁰           |
| `log10(100)`    | log₁₀(100)    |
| `[[1,2],[3,4]]` | Matrix layout |
| `floor(3.7)`    | ⌊3.7⌋         |
| `ceil(2.1)`     | ⌈2.1⌉         |

---

## Keyboard Shortcuts

| Shortcut            | Function                                 |
| ------------------- | ---------------------------------------- |
| `0-9` `. `          | Digit input                              |
| `+` `-` `*` `/` `^` | Operators                                |
| `(` `)`             | Parentheses                              |
| `=`                 | Calculate (inserts equals in Solve mode) |
| `Enter`             | Calculate                                |
| `Backspace`         | Delete character                         |
| `Escape`            | Close panel / Clear input                |
| `Tab`               | Auto-complete brackets                   |
| `←` `→`             | Cursor movement                          |
| `Space`             | Insert space                             |
| `Ctrl+H`            | Toggle history                           |
| `Ctrl+T`            | Toggle theme                             |
| `Ctrl+L`            | Clear history                            |

---

## FAQ

**Q: Why doesn't `sin(90)` equal 1?**
A: The default angle mode is radians (RAD). Switch to degree mode (DEG) and `sin(90)` = 1.

**Q: How do I enter complex numbers?**
A: Switch to Complex mode and use `i` for the imaginary unit, e.g., `2+3i`.

**Q: How do I enter matrices?**
A: Switch to Matrix mode and use the `[[a,b],[c,d]]` format, with `],[` separating rows.

**Q: How many history entries are saved?**
A: Up to 100 entries, with automatic deduplication (consecutive identical expressions are not recorded twice).

**Q: Will my settings be lost?**
A: No. All settings (precision, format, angle unit, theme, etc.) are automatically persisted to local storage.

---

## License

MIT License
