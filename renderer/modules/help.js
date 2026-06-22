const HELP_CONTENT = {
  zh: `
<h3>快速入门</h3>
<p>欢迎使用 calculate_JYY 科学计算器！这是一个功能强大的计算器，但请不要担心，我们会一步步教你如何使用。</p>

<h4>第一步：认识界面</h4>
<p>打开计算器后，你会看到：</p>
<ul>
<li><b>顶部显示区</b>：显示你输入的内容和计算结果</li>
<li><b>模式标签</b>：选择不同的计算模式（标准、复数、矩阵等）</li>
<li><b>数字键盘</b>：0-9 的数字和基本运算符</li>
<li><b>功能按钮</b>：各种数学函数和操作</li>
</ul>

<h4>第二步：基础计算</h4>
<p>让我们从最简单的开始：</p>
<ol>
<li><b>加减乘除</b>：直接输入数字和运算符
  <br>例如：<code>2+3</code> 然后按 <code>=</code> 或 <code>Enter</code>，结果会显示 <code>5</code></li>
<li><b>括号运算</b>：使用 <code>(</code> 和 <code>)</code> 改变运算顺序
  <br>例如：<code>(2+3)*4</code> 结果是 <code>20</code></li>
<li><b>清除输入</b>：按 <code>AC</code> 按钮清除所有内容</li>
<li><b>删除字符</b>：按 <code>⌫</code> 按钮删除最后一个字符</li>
</ol>

<h4>第三步：使用科学函数</h4>
<p>计算器提供了许多科学函数，你可以在辅助面板中找到它们：</p>
<ul>
<li><b>三角函数</b>：<code>sin</code>、<code>cos</code>、<code>tan</code>（注意：默认使用弧度制）</li>
<li><b>对数函数</b>：<code>log</code>（常用对数）、<code>ln</code>（自然对数）</li>
<li><b>幂函数</b>：<code>^</code>（例如 <code>2^3</code> 表示 2 的 3 次方）</li>
<li><b>其他函数</b>：<code>sqrt</code>（平方根）、<code>abs</code>（绝对值）等</li>
</ul>

<h4>第四步：切换计算模式</h4>
<p>点击顶部的模式标签可以切换到不同的计算模式：</p>
<ul>
<li><b>标准模式</b>：日常计算</li>
<li><b>复数模式</b>：处理复数（如 <code>2+3i</code>）</li>
<li><b>矩阵模式</b>：矩阵运算</li>
<li><b>向量模式</b>：向量运算</li>
<li><b>求解模式</b>：解方程</li>
<li><b>进制模式</b>：进制转换</li>
<li><b>换算模式</b>：单位换算</li>
<li><b>统计模式</b>：统计计算</li>
</ul>

<h4>第五步：使用辅助功能</h4>
<ul>
<li><b>历史记录</b>：点击顶部的 <code>☰</code> 按钮查看之前的计算</li>
<li><b>常量库</b>：点击 <code>📦</code> 按钮使用预定义的常量（如 π、e）</li>
<li><b>主题切换</b>：点击 <code>🌙</code>/<code>☀</code> 按钮切换深色/浅色主题</li>
<li><b>设置</b>：点击 <code>⚙</code> 按钮调整计算精度等设置</li>
</ul>

<h3>常见问题解答</h3>
<p><b>Q: 为什么 sin(90) 不等于 1？</b></p>
<p>A: 默认情况下，计算器使用弧度制。要使用角度制，请点击辅助面板中的 <code>RAD</code> 按钮切换到 <code>DEG</code> 模式。</p>

<p><b>Q: 如何输入复数？</b></p>
<p>A: 切换到"复数模式"，然后使用 <code>i</code> 表示虚数单位。例如：<code>2+3i</code>。</p>

<p><b>Q: 如何解方程？</b></p>
<p>A: 切换到"求解模式"，输入方程如 <code>x^2-4=0</code>，然后按 <code>Enter</code>。</p>

<p><b>Q: 计算结果会保存吗？</b></p>
<p>A: 是的，所有设置和计算历史都会自动保存，下次打开时会恢复。</p>

<h3>8 种计算模式</h3>

<h4>1. 标准模式</h4>
<p>基础四则运算、科学函数、括号、幂运算、阶乘。</p>
<table class="help-table"><thead><tr><th>输入</th><th>结果</th><th>说明</th></tr></thead><tbody>
<tr><td>1+2*3</td><td>7</td><td>四则运算</td></tr>
<tr><td>2^10</td><td>1024</td><td>幂运算</td></tr>
<tr><td>5!</td><td>120</td><td>阶乘</td></tr>
<tr><td>sin(pi/2)</td><td>1</td><td>三角函数</td></tr>
<tr><td>sinh(1)</td><td>1.1752</td><td>双曲正弦</td></tr>
<tr><td>cosh(0)</td><td>1</td><td>双曲余弦</td></tr>
<tr><td>tanh(1)</td><td>0.7616</td><td>双曲正切</td></tr>
<tr><td>sqrt(16)</td><td>4</td><td>平方根</td></tr>
<tr><td>log10(100)</td><td>2</td><td>常用对数</td></tr>
<tr><td>abs(-5)</td><td>5</td><td>绝对值</td></tr>
<tr><td>floor(3.7)</td><td>3</td><td>向下取整</td></tr>
<tr><td>nPr(5,2)</td><td>20</td><td>排列数</td></tr>
<tr><td>nCr(5,2)</td><td>10</td><td>组合数</td></tr>
<tr><td>gcd(12,18)</td><td>6</td><td>最大公约数</td></tr>
<tr><td>lcm(4,6)</td><td>12</td><td>最小公倍数</td></tr>
<tr><td>factorize(12)</td><td>2 × 2 × 3</td><td>质因数分解</td></tr>
<tr><td>ratio(2,3,4)</td><td>6</td><td>解比例 a:b=c:x</td></tr>
<tr><td>polar(3,4)</td><td>r=5, θ=...</td><td>直角→极坐标</td></tr>
<tr><td>rect(5,90)</td><td>复数</td><td>极→直角坐标(DEG)</td></tr>
</tbody></table>

<h4>2. 复数模式</h4>
<p>复数四则运算、模、辐角、共轭。</p>
<table class="help-table"><thead><tr><th>输入</th><th>结果</th></tr></thead><tbody>
<tr><td>(2+3i)*(1-i)</td><td>5 + i</td></tr>
<tr><td>abs(3+4i)</td><td>5</td></tr>
<tr><td>conj(2+3i)</td><td>2 - 3i</td></tr>
</tbody></table>

<h4>3. 矩阵模式</h4>
<p>输入格式：<code>[[a,b],[c,d]]</code></p>
<table class="help-table"><thead><tr><th>函数</th><th>说明</th></tr></thead><tbody>
<tr><td>det([[1,2],[3,4]])</td><td>行列式</td></tr>
<tr><td>inv([[1,2],[3,4]])</td><td>逆矩阵</td></tr>
<tr><td>transpose(...)</td><td>转置</td></tr>
<tr><td>trace(...)</td><td>迹</td></tr>
<tr><td>eig(...)</td><td>特征值</td></tr>
</tbody></table>

<h4>4. 向量模式</h4>
<p>输入格式：<code>[a,b,c]</code></p>
<table class="help-table"><thead><tr><th>函数</th><th>说明</th></tr></thead><tbody>
<tr><td>dot([1,2,3],[4,5,6])</td><td>点积 = 32</td></tr>
<tr><td>cross([1,0,0],[0,1,0])</td><td>叉积 = [0,0,1]</td></tr>
<tr><td>norm([3,4])</td><td>模长 = 5</td></tr>
<tr><td>unit([3,4])</td><td>单位向量</td></tr>
<tr><td>proj([1,2],[3,0])</td><td>投影</td></tr>
</tbody></table>

<h4>5. 求解模式</h4>
<p><b>通用方程</b>：输入 <code>x^2 - 4 = 0</code> 或 <code>x^2 = 4</code>，按 Enter 求解。</p>
<table class="help-table"><thead><tr><th>函数</th><th>说明</th></tr></thead><tbody>
<tr><td>solve2(1,-5,6)</td><td>一元二次 ax²+bx+c=0 → [2,3]</td></tr>
<tr><td>solve3(1,-6,11,-6)</td><td>一元三次 → [1,2,3]</td></tr>
<tr><td>solveLinear2(1,1,5,2,1,7)</td><td>二元一次方程组 → x=2,y=3</td></tr>
<tr><td>solveLinear3(...)</td><td>三元一次方程组</td></tr>
</tbody></table>
<p><b>注意</b>：键盘 <code>=</code> 键在此模式下插入等号，按 <code>Enter</code> 触发计算。</p>

<h4>6. 进制模式</h4>
<p>支持 BIN/OCT/DEC/HEX 转换与位运算。</p>
<table class="help-table"><thead><tr><th>输入</th><th>结果</th></tr></thead><tbody>
<tr><td>bin(10)</td><td>0b1010</td></tr>
<tr><td>hex(255)</td><td>0xFF</td></tr>
<tr><td>5 & 3</td><td>1 (AND)</td></tr>
<tr><td>5 | 3</td><td>7 (OR)</td></tr>
<tr><td>5 << 1</td><td>10 (左移)</td></tr>
</tbody></table>

<h4>7. 换算模式</h4>
<p>格式：<code>数值 单位 to 目标单位</code></p>
<table class="help-table"><thead><tr><th>输入</th><th>结果</th></tr></thead><tbody>
<tr><td>100 cm to m</td><td>1 m</td></tr>
<tr><td>1 kg to g</td><td>1000 g</td></tr>
<tr><td>1 h to s</td><td>3600 s</td></tr>
</tbody></table>

<h4>8. 统计模式</h4>
<table class="help-table"><thead><tr><th>函数</th><th>说明</th></tr></thead><tbody>
<tr><td>mean([1,2,3,4,5])</td><td>平均值 = 3</td></tr>
<tr><td>median(...)</td><td>中位数</td></tr>
<tr><td>std(...)</td><td>标准差</td></tr>
<tr><td>variance(...)</td><td>方差</td></tr>
<tr><td>sum([...])</td><td>总和</td></tr>
<tr><td>linReg([1,2,3],[2,4,6])</td><td>线性回归: y=2x</td></tr>
<tr><td>quadReg([1,2,3],[1,4,9])</td><td>二次回归: y=x²</td></tr>
<tr><td>expReg([0,1,2],[1,2.7,7.4])</td><td>指数回归</td></tr>
<tr><td>normCDF(0,0,1)</td><td>标准正态CDF=0.5</td></tr>
<tr><td>binomPMF(2,5,0.5)</td><td>二项分布PMF</td></tr>
<tr><td>poissonPMF(2,3)</td><td>泊松分布PMF</td></tr>
<tr><td>uniformPDF(0.5,0,1)</td><td>均匀分布PDF</td></tr>
<tr><td>uniformCDF(0.5,0,1)</td><td>均匀分布CDF</td></tr>
<tr><td>expPDF(1,2)</td><td>指数分布PDF</td></tr>
<tr><td>expCDF(1,2)</td><td>指数分布CDF</td></tr>
</tbody></table>

<h4>9. 微积分模式</h4>
<p>求导数、定积分、求和、求积运算。</p>
<table class="help-table"><thead><tr><th>输入</th><th>结果</th><th>说明</th></tr></thead><tbody>
<tr><td>d/dx(x^2, x, 3)</td><td>6</td><td>求导数：x²在x=3处的导数</td></tr>
<tr><td>d/dx(sin(x), x, 0)</td><td>1</td><td>求导数：sin(x)在x=0处的导数</td></tr>
<tr><td>integrate(x^2, x, 0, 1)</td><td>0.3333</td><td>定积分：∫₀¹ x² dx</td></tr>
<tr><td>integrate(sin(x), x, 0, pi)</td><td>2</td><td>定积分：∫₀π sin(x) dx</td></tr>
<tr><td>sum(i^2, i, 1, 5)</td><td>55</td><td>求和：Σᵢ₌₁⁵ i² = 1+4+9+16+25</td></tr>
<tr><td>product(i, i, 1, 5)</td><td>120</td><td>求积：Πᵢ₌₁⁵ i = 5! = 120</td></tr>
</tbody></table>

<h3>辅助功能</h3>

<h4>变量存储 (A-Z)</h4>
<p>支持存储9个变量（A-Z），可在表达式中使用。</p>
<table class="help-table"><thead><tr><th>输入</th><th>说明</th></tr></thead><tbody>
<tr><td>A=5</td><td>将5存入变量A</td></tr>
<tr><td>B=10</td><td>将10存入变量B</td></tr>
<tr><td>A+B</td><td>计算A+B=15</td></tr>
<tr><td>A^2</td><td>计算A²=25</td></tr>
</tbody></table>

<h4>度分秒转换</h4>
<p>角度单位转换功能。</p>
<table class="help-table"><thead><tr><th>输入</th><th>结果</th><th>说明</th></tr></thead><tbody>
<tr><td>toDMS(30.5)</td><td>30°30'0"</td><td>十进制转度分秒</td></tr>
<tr><td>toDecimal(30,30,0)</td><td>30.5</td><td>度分秒转十进制</td></tr>
</tbody></table>

<h4>自定义函数</h4>
<p>支持定义和调用自定义函数（f、g、h）。</p>
<table class="help-table"><thead><tr><th>输入</th><th>说明</th></tr></thead><tbody>
<tr><td>f(x)=x^2</td><td>定义函数 f(x) = x²</td></tr>
<tr><td>g(t)=sin(t)+1</td><td>定义函数 g(t) = sin(t) + 1</td></tr>
<tr><td>f(3)</td><td>调用 f(3) = 9</td></tr>
<tr><td>g(pi/2)</td><td>调用 g(π/2) = 2</td></tr>
</tbody></table>

<h4>多语句表达式</h4>
<p>使用冒号分隔多个表达式，按顺序执行。</p>
<table class="help-table"><thead><tr><th>输入</th><th>说明</th></tr></thead><tbody>
<tr><td>A=5:B=10:A+B</td><td>先A=5，再B=10，最后计算A+B=15</td></tr>
<tr><td>f(x)=x^2:f(3)</td><td>先定义f(x)，再调用f(3)=9</td></tr>
</tbody></table>

<h4>记忆功能 (MC / MR / M+ / M- / MS)</h4>
<p><b>MS</b> 存入记忆 · <b>MR</b> 读取记忆 · <b>M+</b> 加到记忆 · <b>M-</b> 从记忆减 · <b>MC</b> 清除记忆</p>
<p>记忆值跨会话持久化。复数/矩阵等非数值结果无法存入。</p>

<h4>常量库 (📦)</h4>
<p>内置 24 个常用常量（数学/物理/天文），点击即可插入。支持搜索。</p>

<h4>历史记录 (☰ / Ctrl+H)</h4>
<p>最多保存 100 条，支持搜索、回填、删除、导出 JSON。自动去重。</p>

<h4>数值表格 (📊)</h4>
<p>输入函数（如 x^2），设置范围和步长，生成 (x, f(x)) 表格或绘制图像。最多 1000 个数据点。</p>

<h4>设置 (⚙)</h4>
<p>结果精度 (0-15 位) · 显示格式 (NORM/FIX/SCI) · 角度模式 (RAD/DEG/GRAD) · 工程符号 · 括号自动补全 · 进制基数</p>

<h4>主题 (🌙/☀)</h4>
<p>深色 (Catppuccin Mocha) / 浅色 (Catppuccin Latte)，Ctrl+T 切换。</p>

<h4>分数/小数 (S⇔D)</h4>
<p>点击切换：0.5 ↔ 1/2，0.75 ↔ 3/4</p>

<h3>角度单位</h3>
<table class="help-table"><thead><tr><th>模式</th><th>说明</th><th>sin(90)</th></tr></thead><tbody>
<tr><td>RAD</td><td>弧度（默认）</td><td>≈ 0.894</td></tr>
<tr><td>DEG</td><td>角度</td><td>= 1</td></tr>
<tr><td>GRAD</td><td>百分度</td><td>sin(100)=1</td></tr>
</tbody></table>

<h3>键盘快捷键</h3>
<table class="help-table"><thead><tr><th>快捷键</th><th>功能</th></tr></thead><tbody>
<tr><td>Enter</td><td>计算结果</td></tr>
<tr><td>=</td><td>计算（求解模式下插入等号）</td></tr>
<tr><td>Escape</td><td>关闭面板 / 清空输入</td></tr>
<tr><td>Backspace</td><td>退格</td></tr>
<tr><td>Tab</td><td>自动补全括号</td></tr>
<tr><td>← →</td><td>光标移动</td></tr>
<tr><td>Ctrl+H</td><td>历史记录</td></tr>
<tr><td>Ctrl+T</td><td>切换主题</td></tr>
<tr><td>Ctrl+L</td><td>清空历史</td></tr>
<tr><td>?</td><td>打开帮助</td></tr>
</tbody></table>

<h3>LaTeX 实时渲染</h3>
<p>所有输入实时以数学排版显示：sin(π/2)、√16、⌊3.7⌋、矩阵排版等。</p>

<h3>常见问题</h3>
<p><b>Q: 为什么 sin(90) ≠ 1？</b><br>A: 默认弧度模式，切换到角度模式 (DEG) 即可。</p>
<p><b>Q: 如何输入复数/矩阵？</b><br>A: 切换到对应模式。复数用 <code>i</code>，矩阵用 <code>[[a,b],[c,d]]</code>。</p>
<p><b>Q: 设置会丢失吗？</b><br>A: 不会。所有设置自动持久化。</p>
`,

  en: `
<h3>Quick Start Guide</h3>
<p>Welcome to calculate_JYY scientific calculator! This is a powerful calculator, but don't worry - we'll guide you step by step.</p>

<h4>Step 1: Know Your Interface</h4>
<p>When you open the calculator, you'll see:</p>
<ul>
<li><b>Top Display Area</b>: Shows your input and calculation results</li>
<li><b>Mode Tabs</b>: Select different calculation modes (Standard, Complex, Matrix, etc.)</li>
<li><b>Number Pad</b>: 0-9 digits and basic operators</li>
<li><b>Function Buttons</b>: Various mathematical functions and operations</li>
</ul>

<h4>Step 2: Basic Calculations</h4>
<p>Let's start with the simplest operations:</p>
<ol>
<li><b>Addition, Subtraction, Multiplication, Division</b>: Just type numbers and operators
  <br>Example: <code>2+3</code> then press <code>=</code> or <code>Enter</code>, result shows <code>5</code></li>
<li><b>Parentheses</b>: Use <code>(</code> and <code>)</code> to change operation order
  <br>Example: <code>(2+3)*4</code> result is <code>20</code></li>
<li><b>Clear Input</b>: Press <code>AC</code> button to clear everything</li>
<li><b>Delete Character</b>: Press <code>⌫</code> button to delete the last character</li>
</ol>

<h4>Step 3: Using Scientific Functions</h4>
<p>The calculator provides many scientific functions, you can find them in the helper panel:</p>
<ul>
<li><b>Trigonometric Functions</b>: <code>sin</code>, <code>cos</code>, <code>tan</code> (Note: uses radians by default)</li>
<li><b>Logarithmic Functions</b>: <code>log</code> (common logarithm), <code>ln</code> (natural logarithm)</li>
<li><b>Power Functions</b>: <code>^</code> (e.g., <code>2^3</code> means 2 to the power of 3)</li>
<li><b>Other Functions</b>: <code>sqrt</code> (square root), <code>abs</code> (absolute value), etc.</li>
</ul>

<h4>Step 4: Switching Calculation Modes</h4>
<p>Click the mode tabs at the top to switch to different calculation modes:</p>
<ul>
<li><b>Standard Mode</b>: Daily calculations</li>
<li><b>Complex Mode</b>: Handle complex numbers (like <code>2+3i</code>)</li>
<li><b>Matrix Mode</b>: Matrix operations</li>
<li><b>Vector Mode</b>: Vector operations</li>
<li><b>Solve Mode</b>: Solve equations</li>
<li><b>Base Mode</b>: Base conversion</li>
<li><b>Convert Mode</b>: Unit conversion</li>
<li><b>Stats Mode</b>: Statistical calculations</li>
</ul>

<h4>Step 5: Using Helper Features</h4>
<ul>
<li><b>History</b>: Click the <code>☰</code> button at the top to view previous calculations</li>
<li><b>Constants Library</b>: Click the <code>📦</code> button to use predefined constants (like π, e)</li>
<li><b>Theme Switch</b>: Click the <code>🌙</code>/<code>☀</code> button to switch between dark/light themes</li>
<li><b>Settings</b>: Click the <code>⚙</code> button to adjust calculation precision and other settings</li>
</ul>

<h3>Frequently Asked Questions</h3>
<p><b>Q: Why doesn't sin(90) equal 1?</b></p>
<p>A: By default, the calculator uses radians. To use degrees, click the <code>RAD</code> button in the helper panel to switch to <code>DEG</code> mode.</p>

<p><b>Q: How do I enter complex numbers?</b></p>
<p>A: Switch to "Complex Mode" and use <code>i</code> for the imaginary unit. Example: <code>2+3i</code>.</p>

<p><b>Q: How do I solve equations?</b></p>
<p>A: Switch to "Solve Mode", enter an equation like <code>x^2-4=0</code>, then press <code>Enter</code>.</p>

<p><b>Q: Are calculation results saved?</b></p>
<p>A: Yes, all settings and calculation history are automatically saved and will be restored next time you open the calculator.</p>

<h3>8 Calculation Modes</h3>

<h4>1. Standard Mode</h4>
<p>Basic arithmetic, scientific functions, parentheses, powers, and factorials.</p>
<table class="help-table"><thead><tr><th>Input</th><th>Result</th><th>Description</th></tr></thead><tbody>
<tr><td>1+2*3</td><td>7</td><td>Arithmetic</td></tr>
<tr><td>2^10</td><td>1024</td><td>Power</td></tr>
<tr><td>5!</td><td>120</td><td>Factorial</td></tr>
<tr><td>sin(pi/2)</td><td>1</td><td>Trig function</td></tr>
<tr><td>sinh(1)</td><td>1.1752</td><td>Hyperbolic sine</td></tr>
<tr><td>cosh(0)</td><td>1</td><td>Hyperbolic cosine</td></tr>
<tr><td>tanh(1)</td><td>0.7616</td><td>Hyperbolic tangent</td></tr>
<tr><td>sqrt(16)</td><td>4</td><td>Square root</td></tr>
<tr><td>log10(100)</td><td>2</td><td>Common log</td></tr>
<tr><td>abs(-5)</td><td>5</td><td>Absolute value</td></tr>
<tr><td>floor(3.7)</td><td>3</td><td>Floor</td></tr>
<tr><td>nPr(5,2)</td><td>20</td><td>Permutations</td></tr>
<tr><td>nCr(5,2)</td><td>10</td><td>Combinations</td></tr>
<tr><td>gcd(12,18)</td><td>6</td><td>Greatest common divisor</td></tr>
<tr><td>lcm(4,6)</td><td>12</td><td>Least common multiple</td></tr>
<tr><td>factorize(12)</td><td>2 × 2 × 3</td><td>Prime factorization</td></tr>
<tr><td>ratio(2,3,4)</td><td>6</td><td>Solve proportion</td></tr>
<tr><td>polar(3,4)</td><td>r=5, θ=...</td><td>Rect→Polar</td></tr>
<tr><td>rect(5,90)</td><td>Complex</td><td>Polar→Rect (DEG)</td></tr>
</tbody></table>

<h4>2. Complex Mode</h4>
<p>Complex arithmetic, modulus, argument, conjugate.</p>
<table class="help-table"><thead><tr><th>Input</th><th>Result</th></tr></thead><tbody>
<tr><td>(2+3i)*(1-i)</td><td>5 + i</td></tr>
<tr><td>abs(3+4i)</td><td>5</td></tr>
<tr><td>conj(2+3i)</td><td>2 - 3i</td></tr>
</tbody></table>

<h4>3. Matrix Mode</h4>
<p>Format: <code>[[a,b],[c,d]]</code></p>
<table class="help-table"><thead><tr><th>Function</th><th>Description</th></tr></thead><tbody>
<tr><td>det([[1,2],[3,4]])</td><td>Determinant</td></tr>
<tr><td>inv([[1,2],[3,4]])</td><td>Inverse</td></tr>
<tr><td>transpose(...)</td><td>Transpose</td></tr>
<tr><td>trace(...)</td><td>Trace</td></tr>
<tr><td>eig(...)</td><td>Eigenvalues</td></tr>
</tbody></table>

<h4>4. Vector Mode</h4>
<p>Format: <code>[a,b,c]</code></p>
<table class="help-table"><thead><tr><th>Function</th><th>Description</th></tr></thead><tbody>
<tr><td>dot([1,2,3],[4,5,6])</td><td>Dot product = 32</td></tr>
<tr><td>cross([1,0,0],[0,1,0])</td><td>Cross product = [0,0,1]</td></tr>
<tr><td>norm([3,4])</td><td>Magnitude = 5</td></tr>
<tr><td>unit([3,4])</td><td>Unit vector</td></tr>
<tr><td>proj([1,2],[3,0])</td><td>Projection</td></tr>
</tbody></table>

<h4>5. Solve Mode</h4>
<p><b>General equations</b>: Type <code>x^2 - 4 = 0</code> or <code>x^2 = 4</code>, press Enter.</p>
<table class="help-table"><thead><tr><th>Function</th><th>Description</th></tr></thead><tbody>
<tr><td>solve2(1,-5,6)</td><td>Quadratic ax²+bx+c=0 → [2,3]</td></tr>
<tr><td>solve3(1,-6,11,-6)</td><td>Cubic → [1,2,3]</td></tr>
<tr><td>solveLinear2(...)</td><td>2×2 linear system</td></tr>
<tr><td>solveLinear3(...)</td><td>3×3 linear system</td></tr>
</tbody></table>
<p><b>Note</b>: The <code>=</code> key inserts an equals sign in Solve mode. Press <code>Enter</code> to calculate.</p>

<h4>6. Base Mode</h4>
<p>BIN/OCT/DEC/HEX conversion and bitwise operations.</p>
<table class="help-table"><thead><tr><th>Input</th><th>Result</th></tr></thead><tbody>
<tr><td>bin(10)</td><td>0b1010</td></tr>
<tr><td>hex(255)</td><td>0xFF</td></tr>
<tr><td>5 & 3</td><td>1 (AND)</td></tr>
<tr><td>5 | 3</td><td>7 (OR)</td></tr>
<tr><td>5 << 1</td><td>10 (left shift)</td></tr>
</tbody></table>

<h4>7. Convert Mode</h4>
<p>Format: <code>value unit to target unit</code></p>
<table class="help-table"><thead><tr><th>Input</th><th>Result</th></tr></thead><tbody>
<tr><td>100 cm to m</td><td>1 m</td></tr>
<tr><td>1 kg to g</td><td>1000 g</td></tr>
<tr><td>1 h to s</td><td>3600 s</td></tr>
</tbody></table>

<h4>8. Stats Mode</h4>
<table class="help-table"><thead><tr><th>Function</th><th>Description</th></tr></thead><tbody>
<tr><td>mean([1,2,3,4,5])</td><td>Mean = 3</td></tr>
<tr><td>median(...)</td><td>Median</td></tr>
<tr><td>std(...)</td><td>Std deviation</td></tr>
<tr><td>variance(...)</td><td>Variance</td></tr>
<tr><td>sum([...])</td><td>Sum</td></tr>
<tr><td>linReg([1,2,3],[2,4,6])</td><td>Linear regression: y=2x</td></tr>
<tr><td>quadReg([1,2,3],[1,4,9])</td><td>Quadratic regression: y=x²</td></tr>
<tr><td>expReg([0,1,2],[1,2.7,7.4])</td><td>Exponential regression</td></tr>
<tr><td>normCDF(0,0,1)</td><td>Standard normal CDF=0.5</td></tr>
<tr><td>binomPMF(2,5,0.5)</td><td>Binomial PMF</td></tr>
<tr><td>poissonPMF(2,3)</td><td>Poisson PMF</td></tr>
<tr><td>uniformPDF(0.5,0,1)</td><td>Uniform PDF</td></tr>
<tr><td>uniformCDF(0.5,0,1)</td><td>Uniform CDF</td></tr>
<tr><td>expPDF(1,2)</td><td>Exponential PDF</td></tr>
<tr><td>expCDF(1,2)</td><td>Exponential CDF</td></tr>
</tbody></table>

<h4>9. Calculus Mode</h4>
<p>Numerical derivatives, definite integrals, summation, and product operations.</p>
<table class="help-table"><thead><tr><th>Input</th><th>Result</th><th>Description</th></tr></thead><tbody>
<tr><td>d/dx(x^2, x, 3)</td><td>6</td><td>Derivative: x² at x=3</td></tr>
<tr><td>d/dx(sin(x), x, 0)</td><td>1</td><td>Derivative: sin(x) at x=0</td></tr>
<tr><td>integrate(x^2, x, 0, 1)</td><td>0.3333</td><td>Definite integral: ∫₀¹ x² dx</td></tr>
<tr><td>integrate(sin(x), x, 0, pi)</td><td>2</td><td>Definite integral: ∫₀π sin(x) dx</td></tr>
<tr><td>sum(i^2, i, 1, 5)</td><td>55</td><td>Summation: Σᵢ₌₁⁵ i² = 1+4+9+16+25</td></tr>
<tr><td>product(i, i, 1, 5)</td><td>120</td><td>Product: Πᵢ₌₁⁵ i = 5! = 120</td></tr>
</tbody></table>

<h3>Features</h3>

<h4>Variable Storage (A-Z)</h4>
<p>Supports storing up to 9 variables (A-Z) for use in expressions.</p>
<table class="help-table"><thead><tr><th>Input</th><th>Description</th></tr></thead><tbody>
<tr><td>A=5</td><td>Store 5 in variable A</td></tr>
<tr><td>B=10</td><td>Store 10 in variable B</td></tr>
<tr><td>A+B</td><td>Calculate A+B=15</td></tr>
<tr><td>A^2</td><td>Calculate A²=25</td></tr>
</tbody></table>

<h4>DMS Conversion</h4>
<p>Angle unit conversion functions.</p>
<table class="help-table"><thead><tr><th>Input</th><th>Result</th><th>Description</th></tr></thead><tbody>
<tr><td>toDMS(30.5)</td><td>30°30'0"</td><td>Decimal to DMS</td></tr>
<tr><td>toDecimal(30,30,0)</td><td>30.5</td><td>DMS to decimal</td></tr>
</tbody></table>

<h4>Custom Functions</h4>
<p>Supports defining and calling custom functions (f, g, h).</p>
<table class="help-table"><thead><tr><th>Input</th><th>Description</th></tr></thead><tbody>
<tr><td>f(x)=x^2</td><td>Define function f(x) = x²</td></tr>
<tr><td>g(t)=sin(t)+1</td><td>Define function g(t) = sin(t) + 1</td></tr>
<tr><td>f(3)</td><td>Call f(3) = 9</td></tr>
<tr><td>g(pi/2)</td><td>Call g(π/2) = 2</td></tr>
</tbody></table>

<h4>Multiple Statements</h4>
<p>Use colon to separate multiple expressions, executed sequentially.</p>
<table class="help-table"><thead><tr><th>Input</th><th>Description</th></tr></thead><tbody>
<tr><td>A=5:B=10:A+B</td><td>First A=5, then B=10, finally A+B=15</td></tr>
<tr><td>f(x)=x^2:f(3)</td><td>First define f(x), then call f(3)=9</td></tr>
</tbody></table>

<h4>Memory (MC / MR / M+ / M- / MS)</h4>
<p><b>MS</b> Store · <b>MR</b> Recall · <b>M+</b> Add · <b>M-</b> Subtract · <b>MC</b> Clear</p>
<p>Persists across sessions. Non-numeric results (complex/matrix) cannot be stored.</p>

<h4>Constants Library (📦)</h4>
<p>24 built-in constants (Math/Physics/Astronomy). Click to insert. Supports search.</p>

<h4>History (☰ / Ctrl+H)</h4>
<p>Up to 100 entries. Search, recall, delete, export JSON. Auto-dedup.</p>

<h4>Table (📊)</h4>
<p>Enter a function (e.g. x^2), set range and step, generate (x, f(x)) table or plot. Max 1000 points.</p>

<h4>Settings (⚙)</h4>
<p>Precision (0-15) · Format (NORM/FIX/SCI) · Angle (RAD/DEG/GRAD) · Engineering notation · Auto-bracket · Base radix</p>

<h4>Theme (🌙/☀)</h4>
<p>Dark (Catppuccin Mocha) / Light (Catppuccin Latte). Ctrl+T to toggle.</p>

<h4>Fraction/Decimal (S⇔D)</h4>
<p>Toggle: 0.5 ↔ 1/2, 0.75 ↔ 3/4</p>

<h3>Angle Units</h3>
<table class="help-table"><thead><tr><th>Mode</th><th>Description</th><th>sin(90)</th></tr></thead><tbody>
<tr><td>RAD</td><td>Radians (default)</td><td>≈ 0.894</td></tr>
<tr><td>DEG</td><td>Degrees</td><td>= 1</td></tr>
<tr><td>GRAD</td><td>Gradians</td><td>sin(100)=1</td></tr>
</tbody></table>

<h3>Keyboard Shortcuts</h3>
<table class="help-table"><thead><tr><th>Shortcut</th><th>Function</th></tr></thead><tbody>
<tr><td>Enter</td><td>Calculate</td></tr>
<tr><td>=</td><td>Calculate (inserts = in Solve mode)</td></tr>
<tr><td>Escape</td><td>Close panel / Clear input</td></tr>
<tr><td>Backspace</td><td>Delete</td></tr>
<tr><td>Tab</td><td>Auto-complete brackets</td></tr>
<tr><td>← →</td><td>Cursor movement</td></tr>
<tr><td>Ctrl+H</td><td>History</td></tr>
<tr><td>Ctrl+T</td><td>Toggle theme</td></tr>
<tr><td>Ctrl+L</td><td>Clear history</td></tr>
<tr><td>?</td><td>Open help</td></tr>
</tbody></table>

<h3>LaTeX Rendering</h3>
<p>All input is rendered in real-time with mathematical typesetting: sin(π/2), √16, ⌊3.7⌋, matrix layout, etc.</p>

<h3>FAQ</h3>
<p><b>Q: Why doesn't sin(90) = 1?</b><br>A: Default is radians (RAD). Switch to degrees (DEG).</p>
<p><b>Q: How to enter complex/matrix?</b><br>A: Switch to the corresponding mode. Complex uses <code>i</code>, matrix uses <code>[[a,b],[c,d]]</code>.</p>
<p><b>Q: Will settings be lost?</b><br>A: No. All settings are automatically persisted.</p>
`
};

export class HelpPanelManager {
  constructor() {
    this.sidebar = document.getElementById('help-sidebar');
    this.content = document.getElementById('help-content');
    this.langZhBtn = document.getElementById('help-lang-zh');
    this.langEnBtn = document.getElementById('help-lang-en');
    this.currentLang = 'zh';

    this.langZhBtn?.addEventListener('click', () => this.setLang('zh'));
    this.langEnBtn?.addEventListener('click', () => this.setLang('en'));

    this.render();
  }

  setLang(lang) {
    this.currentLang = lang;
    this.langZhBtn?.classList.toggle('active', lang === 'zh');
    this.langEnBtn?.classList.toggle('active', lang === 'en');
    this.render();
  }

  render() {
    if (this.content) {
      this.content.innerHTML = HELP_CONTENT[this.currentLang] || HELP_CONTENT.zh;
    }
  }
}
