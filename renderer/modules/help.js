const HELP_CONTENT = {
  zh: `
<div class="help-toc">
<h3>目录</h3>
<ul>
<li><a href="#quick-start">新手快速入门</a></li>
<li><a href="#interface">界面详解</a></li>
<li><a href="#basic">基本计算</a></li>
<li><a href="#functions">函数计算</a></li>
<li><a href="#fraction">分数计算</a></li>
<li><a href="#equation">方程式计算</a></li>
<li><a href="#matrix">矩阵计算</a></li>
<li><a href="#vector">向量计算</a></li>
<li><a href="#complex">复数计算</a></li>
<li><a href="#statistics">统计计算</a></li>
<li><a href="#base">基数n计算</a></li>
<li><a href="#calculus">微积分计算</a></li>
<li><a href="#table">数值表格</a></li>
<li><a href="#spreadsheet">电子表格</a></li>
<li><a href="#memory">存储器功能</a></li>
<li><a href="#constants">科学常数</a></li>
<li><a href="#settings">配置设定</a></li>
<li><a href="#shortcuts">快捷键参考</a></li>
<li><a href="#errors">错误信息</a></li>
<li><a href="#faq">常见问题</a></li>
</ul>
</div>

<h3 id="quick-start">新手快速入门</h3>
<p>欢迎使用 calculate_JYY 科学计算器！本说明书将帮助您从零开始掌握所有功能。</p>

<h4>第一步：认识界面</h4>
<p>打开计算器后，您会看到：</p>
<ul>
<li><b>显示屏</b>：显示输入的表达式和计算结果</li>
<li><b>模式标签</b>：选择不同的计算模式（标准、复数、矩阵等）</li>
<li><b>数字键盘</b>：0-9 的数字和基本运算符</li>
<li><b>功能按钮</b>：各种数学函数和操作</li>
<li><b>工具栏</b>：历史记录、常量库、设置等功能</li>
</ul>

<h4>第二步：做第一个计算</h4>
<p>让我们计算 <code>3 + 4 × 2</code>：</p>
<ol>
<li>确认当前在「标准」模式（该标签高亮显示）</li>
<li>依次点击：【3】→【+】→【4】→【×】→【2】→【=】</li>
<li>显示屏将显示：
<pre>3 + 4 × 2
11</pre></li>
</ol>
<p><b>提示</b>：计算器自动遵循数学运算优先级（先乘除后加减）。</p>

<h4>第三步：清除并重新开始</h4>
<ul>
<li><b>清除当前输入</b>：点击【AC】按钮</li>
<li><b>删除最后一个字符</b>：点击【DEL】按钮</li>
</ul>

<h3 id="interface">界面详解</h3>

<h4>显示屏</h4>
<p>显示屏分为两个区域：</p>
<ul>
<li><b>输入行</b>（上方）：显示您正在输入或已输入的表达式</li>
<li><b>结果行</b>（下方）：显示计算结果</li>
</ul>

<h4>键盘布局</h4>
<table class="help-table"><thead><tr><th>区域</th><th>按键</th><th>功能</th></tr></thead><tbody>
<tr><td>数字区</td><td>0-9, .</td><td>输入数字和小数点</td></tr>
<tr><td>运算符</td><td>+ - × ÷</td><td>四则运算</td></tr>
<tr><td>功能键</td><td>AC, DEL</td><td>清除全部/删除一个字符</td></tr>
<tr><td>括号</td><td>( )</td><td>改变运算优先级</td></tr>
<tr><td>幂运算</td><td>^</td><td>计算乘方</td></tr>
<tr><td>百分比</td><td>%</td><td>百分比计算</td></tr>
<tr><td>答案</td><td>Ans</td><td>调用上一次计算结果</td></tr>
</tbody></table>

<h3 id="basic">基本计算</h3>

<h4>四则运算</h4>
<table class="help-table"><thead><tr><th>操作</th><th>按键顺序</th><th>结果</th></tr></thead><tbody>
<tr><td>23 + 45</td><td>【2】【3】【+】【4】【5】【=】</td><td>68</td></tr>
<tr><td>100 - 37</td><td>【1】【0】【0】【-】【3】【7】【=】</td><td>63</td></tr>
<tr><td>12 × 15</td><td>【1】【2】【×】【1】【5】【=】</td><td>180</td></tr>
<tr><td>144 ÷ 12</td><td>【1】【4】【4】【÷】【1】【2】【=】</td><td>12</td></tr>
</tbody></table>

<h4>混合运算</h4>
<table class="help-table"><thead><tr><th>表达式</th><th>结果</th><th>说明</th></tr></thead><tbody>
<tr><td>2 + 3 × 4</td><td>11</td><td>先乘除后加减</td></tr>
<tr><td>(2 + 3) × 4</td><td>20</td><td>括号改变优先级</td></tr>
<tr><td>3.14 × 2.5</td><td>7.85</td><td>小数运算</td></tr>
</tbody></table>

<h4>百分比计算</h4>
<table class="help-table"><thead><tr><th>表达式</th><th>结果</th></tr></thead><tbody>
<tr><td>200 × 15%</td><td>30</td></tr>
<tr><td>200 + 10%</td><td>220</td></tr>
</tbody></table>

<h4>使用上次结果 (Ans)</h4>
<p>先计算 3 + 4 = 7，然后点击【Ans】【×】【2】【=】得到 14。</p>

<h3 id="functions">函数计算</h3>

<h4>三角函数</h4>
<table class="help-table"><thead><tr><th>函数</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>sin</td><td>sin(30°)</td><td>0.5</td></tr>
<tr><td>cos</td><td>cos(60°)</td><td>0.5</td></tr>
<tr><td>tan</td><td>tan(45°)</td><td>1</td></tr>
<tr><td>sin⁻¹</td><td>sin⁻¹(0.5)</td><td>30°</td></tr>
<tr><td>cos⁻¹</td><td>cos⁻¹(0.5)</td><td>60°</td></tr>
<tr><td>tan⁻¹</td><td>tan⁻¹(1)</td><td>45°</td></tr>
</tbody></table>

<h4>双曲函数</h4>
<table class="help-table"><thead><tr><th>函数</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>sinh</td><td>sinh(1)</td><td>1.1752</td></tr>
<tr><td>cosh</td><td>cosh(1)</td><td>1.5431</td></tr>
<tr><td>tanh</td><td>tanh(1)</td><td>0.7616</td></tr>
</tbody></table>

<h4>对数函数</h4>
<table class="help-table"><thead><tr><th>函数</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>log</td><td>log(100)</td><td>2</td></tr>
<tr><td>ln</td><td>ln(e)</td><td>1</td></tr>
<tr><td>10^x</td><td>10^3</td><td>1000</td></tr>
<tr><td>e^x</td><td>e^2</td><td>7.3891</td></tr>
</tbody></table>

<h4>幂与根号</h4>
<table class="help-table"><thead><tr><th>函数</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>平方</td><td>5^2</td><td>25</td></tr>
<tr><td>立方</td><td>3^3</td><td>27</td></tr>
<tr><td>平方根</td><td>sqrt(16)</td><td>4</td></tr>
<tr><td>立方根</td><td>27^(1/3)</td><td>3</td></tr>
</tbody></table>

<h4>阶乘与排列组合</h4>
<table class="help-table"><thead><tr><th>函数</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>阶乘</td><td>5!</td><td>120</td></tr>
<tr><td>排列</td><td>5 nPr 3</td><td>60</td></tr>
<tr><td>组合</td><td>5 nCr 3</td><td>10</td></tr>
</tbody></table>

<h4>其他数学函数</h4>
<table class="help-table"><thead><tr><th>函数</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>绝对值</td><td>abs(-5)</td><td>5</td></tr>
<tr><td>取整</td><td>int(3.7)</td><td>3</td></tr>
<tr><td>取模</td><td>10 mod 3</td><td>1</td></tr>
<tr><td>最大公约数</td><td>gcd(12, 8)</td><td>4</td></tr>
<tr><td>最小公倍数</td><td>lcm(12, 8)</td><td>24</td></tr>
</tbody></table>

<h3 id="fraction">分数计算</h3>
<table class="help-table"><thead><tr><th>操作</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>分数输入</td><td>1⌟2</td><td>1/2</td></tr>
<tr><td>分数加法</td><td>1⌟2 + 1⌟3</td><td>5⌟6</td></tr>
<tr><td>分数乘法</td><td>2⌟3 × 3⌟4</td><td>1⌟2</td></tr>
<tr><td>分数转小数</td><td>1⌟3 → S⇔D</td><td>0.3333</td></tr>
</tbody></table>

<h3 id="equation">方程式计算</h3>

<h4>联立线性方程</h4>
<table class="help-table"><thead><tr><th>类型</th><th>示例</th></tr></thead><tbody>
<tr><td>二元一次</td><td>2x + y = 5<br>x - y = 1<br>解：x=2, y=1</td></tr>
<tr><td>三元一次</td><td>x + y + z = 6<br>2x - y + z = 3<br>x + 2y - z = 2<br>解：x=1, y=2, z=3</td></tr>
</tbody></table>

<h4>多项式方程</h4>
<table class="help-table"><thead><tr><th>类型</th><th>示例</th><th>解</th></tr></thead><tbody>
<tr><td>二次方程</td><td>x² + 2x - 2 = 0</td><td>x₁=0.732, x₂=-2.732</td></tr>
<tr><td>三次方程</td><td>x³ - 6x² + 11x - 6 = 0</td><td>x=1, 2, 3</td></tr>
</tbody></table>

<h3 id="matrix">矩阵计算</h3>
<table class="help-table"><thead><tr><th>运算</th><th>语法</th><th>说明</th></tr></thead><tbody>
<tr><td>加法</td><td>MatA + MatB</td><td>矩阵相加</td></tr>
<tr><td>乘法</td><td>MatA × MatB</td><td>矩阵相乘</td></tr>
<tr><td>转置</td><td>Trn(MatA)</td><td>矩阵转置</td></tr>
<tr><td>求逆</td><td>MatA^(-1)</td><td>矩阵求逆</td></tr>
<tr><td>行列式</td><td>Det(MatA)</td><td>计算行列式</td></tr>
</tbody></table>

<h3 id="vector">向量计算</h3>
<table class="help-table"><thead><tr><th>运算</th><th>语法</th><th>示例</th></tr></thead><tbody>
<tr><td>点积</td><td>VecA · VecB</td><td>(1,2,3)·(4,5,6)=32</td></tr>
<tr><td>叉积</td><td>VecA × VecB</td><td>(1,0,0)×(0,1,0)=(0,0,1)</td></tr>
<tr><td>模长</td><td>Abs(VecA)</td><td>(3,4,0)→5</td></tr>
</tbody></table>

<h3 id="complex">复数计算</h3>
<table class="help-table"><thead><tr><th>运算</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>加法</td><td>(3+4i)+(1+2i)</td><td>4+6i</td></tr>
<tr><td>乘法</td><td>(2+3i)×(1+4i)</td><td>-10+11i</td></tr>
<tr><td>模长</td><td>Abs(3+4i)</td><td>5</td></tr>
<tr><td>辐角</td><td>Arg(3+4i)</td><td>53.13°</td></tr>
<tr><td>共轭</td><td>Conj(3+4i)</td><td>3-4i</td></tr>
</tbody></table>

<h3 id="statistics">统计计算</h3>
<table class="help-table"><thead><tr><th>统计量</th><th>说明</th></tr></thead><tbody>
<tr><td>n</td><td>数据个数</td></tr>
<tr><td>Σx</td><td>总和</td></tr>
<tr><td>x̄</td><td>平均值</td></tr>
<tr><td>σx</td><td>总体标准差</td></tr>
<tr><td>sx</td><td>样本标准差</td></tr>
</tbody></table>
<p><b>回归类型</b>：线性、对数、指数、幂、逆、二次</p>

<h3 id="base">基数n计算</h3>
<table class="help-table"><thead><tr><th>进制</th><th>示例</th><th>结果</th></tr></thead><tbody>
<tr><td>十进制→十六进制</td><td>255</td><td>FF</td></tr>
<tr><td>十六进制→二进制</td><td>FF</td><td>11111111</td></tr>
<tr><td>二进制→十进制</td><td>1010</td><td>10</td></tr>
</tbody></table>
<p><b>逻辑运算</b>：AND、OR、XOR、NOT</p>

<h3 id="calculus">微积分计算</h3>
<table class="help-table"><thead><tr><th>运算</th><th>语法</th><th>示例</th></tr></thead><tbody>
<tr><td>数值导数</td><td>d/dx(f(x), a)</td><td>d/dx(x², 3)=6</td></tr>
<tr><td>定积分</td><td>∫(f(x), a, b)</td><td>∫(x², 0, 1)=0.3333</td></tr>
</tbody></table>

<h3 id="table">数值表格</h3>
<p>输入函数（如 x²+1），设置范围和步长，生成 (x, f(x)) 表格。</p>

<h3 id="spreadsheet">电子表格</h3>
<table class="help-table"><thead><tr><th>函数</th><th>说明</th><th>示例</th></tr></thead><tbody>
<tr><td>SUM</td><td>求和</td><td>=SUM(A1:A10)</td></tr>
<tr><td>AVERAGE</td><td>平均值</td><td>=AVERAGE(B1:B5)</td></tr>
<tr><td>MAX</td><td>最大值</td><td>=MAX(C1:C20)</td></tr>
<tr><td>MIN</td><td>最小值</td><td>=MIN(D1:D20)</td></tr>
<tr><td>COUNT</td><td>计数</td><td>=COUNT(E1:E15)</td></tr>
</tbody></table>

<h3 id="memory">存储器功能</h3>
<table class="help-table"><thead><tr><th>操作</th><th>说明</th></tr></thead><tbody>
<tr><td>STO</td><td>存储值到变量（A-Z）</td></tr>
<tr><td>RCL</td><td>读取变量的值</td></tr>
<tr><td>Ans</td><td>使用上次计算结果</td></tr>
<tr><td>M+</td><td>累加到独立存储器</td></tr>
<tr><td>M-</td><td>从独立存储器减去</td></tr>
<tr><td>MR</td><td>读取独立存储器</td></tr>
<tr><td>MC</td><td>清除独立存储器</td></tr>
</tbody></table>

<h3 id="constants">科学常数</h3>
<table class="help-table"><thead><tr><th>常数</th><th>符号</th><th>数值</th></tr></thead><tbody>
<tr><td>圆周率</td><td>π</td><td>3.141592653589793</td></tr>
<tr><td>自然对数底</td><td>e</td><td>2.718281828459045</td></tr>
<tr><td>光速</td><td>c</td><td>2.998×10⁸ m/s</td></tr>
<tr><td>普朗克常数</td><td>h</td><td>6.626×10⁻³⁴ J·s</td></tr>
<tr><td>玻尔兹曼常数</td><td>k</td><td>1.381×10⁻²³ J/K</td></tr>
</tbody></table>
<p>更多常数请点击工具栏的 📦 图标查看。</p>

<h3 id="settings">配置设定</h3>
<table class="help-table"><thead><tr><th>设置项</th><th>选项</th></tr></thead><tbody>
<tr><td>角度单位</td><td>DEG（度）、RAD（弧度）、GRAD（梯度）</td></tr>
<tr><td>显示格式</td><td>NORM（标准）、FIX（定点）、SCI（科学计数法）</td></tr>
<tr><td>小数位数</td><td>0-9 位</td></tr>
<tr><td>主题</td><td>暗色、亮色</td></tr>
<tr><td>语言</td><td>中文、English</td></tr>
</tbody></table>

<h3 id="shortcuts">键盘快捷键</h3>
<table class="help-table"><thead><tr><th>快捷键</th><th>功能</th></tr></thead><tbody>
<tr><td>Enter</td><td>执行计算</td></tr>
<tr><td>Escape</td><td>清除输入</td></tr>
<tr><td>Backspace</td><td>删除最后一个字符</td></tr>
<tr><td>Ctrl+H</td><td>打开/关闭历史记录</td></tr>
<tr><td>Ctrl+T</td><td>切换主题</td></tr>
<tr><td>↑ ↓</td><td>浏览历史记录</td></tr>
</tbody></table>

<h3 id="errors">错误信息</h3>
<table class="help-table"><thead><tr><th>错误</th><th>原因</th><th>解决方法</th></tr></thead><tbody>
<tr><td>Syntax Error</td><td>语法错误</td><td>检查括号配对和运算符</td></tr>
<tr><td>Math Error</td><td>数学错误</td><td>检查除以零、负数开方等</td></tr>
<tr><td>Overflow</td><td>溢出</td><td>结果超出计算范围</td></tr>
<tr><td>Singular Matrix</td><td>奇异矩阵</td><td>矩阵不可逆（行列式为0）</td></tr>
</tbody></table>

<h3 id="faq">常见问题</h3>
<p><b>Q: 为什么 sin(90) 不等于 1？</b></p>
<p>A: 默认使用弧度制。请点击设置切换到角度模式 (DEG)。</p>

<p><b>Q: 如何输入复数？</b></p>
<p>A: 切换到「复数」模式，使用 <code>i</code> 表示虚数单位，如 <code>3+4i</code>。</p>

<p><b>Q: 如何解方程？</b></p>
<p>A: 切换到「方程」模式，选择方程类型，输入系数后点击【=】。</p>

<p><b>Q: 计算结果会保存吗？</b></p>
<p>A: 是的，所有设置和计算历史都会自动保存。</p>

<p><b>Q: 矩阵最大支持多大？</b></p>
<p>A: 最大支持 4×4 矩阵。</p>

<p><b>Q: 如何切换显示格式？</b></p>
<p>A: 点击 ⚙️ 设置图标，选择显示格式（NORM/FIX/SCI）。</p>
`,

  en: `
<div class="help-toc">
<h3>Table of Contents</h3>
<ul>
<li><a href="#quick-start">Quick Start</a></li>
<li><a href="#interface">Interface Guide</a></li>
<li><a href="#basic">Basic Calculations</a></li>
<li><a href="#functions">Functions</a></li>
<li><a href="#fraction">Fractions</a></li>
<li><a href="#equation">Equations</a></li>
<li><a href="#matrix">Matrix</a></li>
<li><a href="#vector">Vectors</a></li>
<li><a href="#complex">Complex Numbers</a></li>
<li><a href="#statistics">Statistics</a></li>
<li><a href="#base">Base-n</a></li>
<li><a href="#calculus">Calculus</a></li>
<li><a href="#table">Table</a></li>
<li><a href="#spreadsheet">Spreadsheet</a></li>
<li><a href="#memory">Memory</a></li>
<li><a href="#constants">Constants</a></li>
<li><a href="#settings">Settings</a></li>
<li><a href="#shortcuts">Shortcuts</a></li>
<li><a href="#errors">Errors</a></li>
<li><a href="#faq">FAQ</a></li>
</ul>
</div>

<h3 id="quick-start">Quick Start</h3>
<p>Welcome to calculate_JYY scientific calculator! This manual will help you master all features from scratch.</p>

<h4>Step 1: Know Your Interface</h4>
<p>When you open the calculator, you'll see:</p>
<ul>
<li><b>Display</b>: Shows your input expression and calculation result</li>
<li><b>Mode Tabs</b>: Select different calculation modes</li>
<li><b>Number Pad</b>: 0-9 digits and basic operators</li>
<li><b>Function Buttons</b>: Various mathematical functions</li>
<li><b>Toolbar</b>: History, constants, settings, etc.</li>
</ul>

<h4>Step 2: First Calculation</h4>
<p>Let's calculate <code>3 + 4 × 2</code>:</p>
<ol>
<li>Confirm you're in "Standard" mode (tab is highlighted)</li>
<li>Click: [3] → [+] → [4] → [×] → [2] → [=]</li>
<li>Display shows:
<pre>3 + 4 × 2
11</pre></li>
</ol>
<p><b>Tip</b>: The calculator follows mathematical order of operations.</p>

<h4>Step 3: Clear and Start Over</h4>
<ul>
<li><b>Clear all</b>: Click [AC] button</li>
<li><b>Delete last character</b>: Click [DEL] button</li>
</ul>

<h3 id="interface">Interface Guide</h3>

<h4>Display</h4>
<p>The display has two areas:</p>
<ul>
<li><b>Input line</b> (top): Shows the expression you're entering</li>
<li><b>Result line</b> (bottom): Shows the calculation result</li>
</ul>

<h4>Keyboard Layout</h4>
<table class="help-table"><thead><tr><th>Area</th><th>Keys</th><th>Function</th></tr></thead><tbody>
<tr><td>Numbers</td><td>0-9, .</td><td>Enter digits and decimal point</td></tr>
<tr><td>Operators</td><td>+ - × ÷</td><td>Basic arithmetic</td></tr>
<tr><td>Function</td><td>AC, DEL</td><td>Clear all / Delete one character</td></tr>
<tr><td>Parentheses</td><td>( )</td><td>Change operation order</td></tr>
<tr><td>Power</td><td>^</td><td>Exponentiation</td></tr>
<tr><td>Percent</td><td>%</td><td>Percentage calculation</td></tr>
<tr><td>Answer</td><td>Ans</td><td>Use last calculation result</td></tr>
</tbody></table>

<h3 id="basic">Basic Calculations</h3>

<h4>Arithmetic</h4>
<table class="help-table"><thead><tr><th>Operation</th><th>Key Sequence</th><th>Result</th></tr></thead><tbody>
<tr><td>23 + 45</td><td>[2][3][+][4][5][=]</td><td>68</td></tr>
<tr><td>100 - 37</td><td>[1][0][0][-][3][7][=]</td><td>63</td></tr>
<tr><td>12 × 15</td><td>[1][2][×][1][5][=]</td><td>180</td></tr>
<tr><td>144 ÷ 12</td><td>[1][4][4][÷][1][2][=]</td><td>12</td></tr>
</tbody></table>

<h4>Mixed Operations</h4>
<table class="help-table"><thead><tr><th>Expression</th><th>Result</th><th>Note</th></tr></thead><tbody>
<tr><td>2 + 3 × 4</td><td>11</td><td>Multiplication first</td></tr>
<tr><td>(2 + 3) × 4</td><td>20</td><td>Parentheses change order</td></tr>
<tr><td>3.14 × 2.5</td><td>7.85</td><td>Decimal arithmetic</td></tr>
</tbody></table>

<h4>Percentage</h4>
<table class="help-table"><thead><tr><th>Expression</th><th>Result</th></tr></thead><tbody>
<tr><td>200 × 15%</td><td>30</td></tr>
<tr><td>200 + 10%</td><td>220</td></tr>
</tbody></table>

<h4>Using Last Result (Ans)</h4>
<p>Calculate 3 + 4 = 7, then click [Ans][×][2][=] to get 14.</p>

<h3 id="functions">Functions</h3>

<h4>Trigonometric Functions</h4>
<table class="help-table"><thead><tr><th>Function</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>sin</td><td>sin(30°)</td><td>0.5</td></tr>
<tr><td>cos</td><td>cos(60°)</td><td>0.5</td></tr>
<tr><td>tan</td><td>tan(45°)</td><td>1</td></tr>
<tr><td>sin⁻¹</td><td>sin⁻¹(0.5)</td><td>30°</td></tr>
<tr><td>cos⁻¹</td><td>cos⁻¹(0.5)</td><td>60°</td></tr>
<tr><td>tan⁻¹</td><td>tan⁻¹(1)</td><td>45°</td></tr>
</tbody></table>

<h4>Hyperbolic Functions</h4>
<table class="help-table"><thead><tr><th>Function</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>sinh</td><td>sinh(1)</td><td>1.1752</td></tr>
<tr><td>cosh</td><td>cosh(1)</td><td>1.5431</td></tr>
<tr><td>tanh</td><td>tanh(1)</td><td>0.7616</td></tr>
</tbody></table>

<h4>Logarithmic Functions</h4>
<table class="help-table"><thead><tr><th>Function</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>log</td><td>log(100)</td><td>2</td></tr>
<tr><td>ln</td><td>ln(e)</td><td>1</td></tr>
<tr><td>10^x</td><td>10^3</td><td>1000</td></tr>
<tr><td>e^x</td><td>e^2</td><td>7.3891</td></tr>
</tbody></table>

<h4>Powers and Roots</h4>
<table class="help-table"><thead><tr><th>Function</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Square</td><td>5^2</td><td>25</td></tr>
<tr><td>Cube</td><td>3^3</td><td>27</td></tr>
<tr><td>Square root</td><td>sqrt(16)</td><td>4</td></tr>
<tr><td>Cube root</td><td>27^(1/3)</td><td>3</td></tr>
</tbody></table>

<h4>Factorial and Combinatorics</h4>
<table class="help-table"><thead><tr><th>Function</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Factorial</td><td>5!</td><td>120</td></tr>
<tr><td>Permutation</td><td>5 nPr 3</td><td>60</td></tr>
<tr><td>Combination</td><td>5 nCr 3</td><td>10</td></tr>
</tbody></table>

<h4>Other Functions</h4>
<table class="help-table"><thead><tr><th>Function</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Absolute</td><td>abs(-5)</td><td>5</td></tr>
<tr><td>Floor</td><td>int(3.7)</td><td>3</td></tr>
<tr><td>Modulo</td><td>10 mod 3</td><td>1</td></tr>
<tr><td>GCD</td><td>gcd(12, 8)</td><td>4</td></tr>
<tr><td>LCM</td><td>lcm(12, 8)</td><td>24</td></tr>
</tbody></table>

<h3 id="fraction">Fractions</h3>
<table class="help-table"><thead><tr><th>Operation</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Input</td><td>1⌟2</td><td>1/2</td></tr>
<tr><td>Addition</td><td>1⌟2 + 1⌟3</td><td>5⌟6</td></tr>
<tr><td>Multiplication</td><td>2⌟3 × 3⌟4</td><td>1⌟2</td></tr>
<tr><td>To decimal</td><td>1⌟3 → S⇔D</td><td>0.3333</td></tr>
</tbody></table>

<h3 id="equation">Equations</h3>

<h4>Linear Systems</h4>
<table class="help-table"><thead><tr><th>Type</th><th>Example</th></tr></thead><tbody>
<tr><td>2 variables</td><td>2x + y = 5<br>x - y = 1<br>Solution: x=2, y=1</td></tr>
<tr><td>3 variables</td><td>x + y + z = 6<br>2x - y + z = 3<br>x + 2y - z = 2<br>Solution: x=1, y=2, z=3</td></tr>
</tbody></table>

<h4>Polynomial Equations</h4>
<table class="help-table"><thead><tr><th>Type</th><th>Example</th><th>Solution</th></tr></thead><tbody>
<tr><td>Quadratic</td><td>x² + 2x - 2 = 0</td><td>x₁=0.732, x₂=-2.732</td></tr>
<tr><td>Cubic</td><td>x³ - 6x² + 11x - 6 = 0</td><td>x=1, 2, 3</td></tr>
</tbody></table>

<h3 id="matrix">Matrix</h3>
<table class="help-table"><thead><tr><th>Operation</th><th>Syntax</th><th>Description</th></tr></thead><tbody>
<tr><td>Addition</td><td>MatA + MatB</td><td>Matrix addition</td></tr>
<tr><td>Multiplication</td><td>MatA × MatB</td><td>Matrix multiplication</td></tr>
<tr><td>Transpose</td><td>Trn(MatA)</td><td>Matrix transpose</td></tr>
<tr><td>Inverse</td><td>MatA^(-1)</td><td>Matrix inverse</td></tr>
<tr><td>Determinant</td><td>Det(MatA)</td><td>Calculate determinant</td></tr>
</tbody></table>

<h3 id="vector">Vectors</h3>
<table class="help-table"><thead><tr><th>Operation</th><th>Syntax</th><th>Example</th></tr></thead><tbody>
<tr><td>Dot product</td><td>VecA · VecB</td><td>(1,2,3)·(4,5,6)=32</td></tr>
<tr><td>Cross product</td><td>VecA × VecB</td><td>(1,0,0)×(0,1,0)=(0,0,1)</td></tr>
<tr><td>Magnitude</td><td>Abs(VecA)</td><td>(3,4,0)→5</td></tr>
</tbody></table>

<h3 id="complex">Complex Numbers</h3>
<table class="help-table"><thead><tr><th>Operation</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Addition</td><td>(3+4i)+(1+2i)</td><td>4+6i</td></tr>
<tr><td>Multiplication</td><td>(2+3i)×(1+4i)</td><td>-10+11i</td></tr>
<tr><td>Modulus</td><td>Abs(3+4i)</td><td>5</td></tr>
<tr><td>Argument</td><td>Arg(3+4i)</td><td>53.13°</td></tr>
<tr><td>Conjugate</td><td>Conj(3+4i)</td><td>3-4i</td></tr>
</tbody></table>

<h3 id="statistics">Statistics</h3>
<table class="help-table"><thead><tr><th>Statistic</th><th>Description</th></tr></thead><tbody>
<tr><td>n</td><td>Number of data points</td></tr>
<tr><td>Σx</td><td>Sum</td></tr>
<tr><td>x̄</td><td>Mean</td></tr>
<tr><td>σx</td><td>Population std dev</td></tr>
<tr><td>sx</td><td>Sample std dev</td></tr>
</tbody></table>
<p><b>Regression types</b>: Linear, Logarithmic, Exponential, Power, Inverse, Quadratic</p>

<h3 id="base">Base-n</h3>
<table class="help-table"><thead><tr><th>Conversion</th><th>Example</th><th>Result</th></tr></thead><tbody>
<tr><td>Decimal→Hex</td><td>255</td><td>FF</td></tr>
<tr><td>Hex→Binary</td><td>FF</td><td>11111111</td></tr>
<tr><td>Binary→Decimal</td><td>1010</td><td>10</td></tr>
</tbody></table>
<p><b>Logic</b>: AND, OR, XOR, NOT</p>

<h3 id="calculus">Calculus</h3>
<table class="help-table"><thead><tr><th>Operation</th><th>Syntax</th><th>Example</th></tr></thead><tbody>
<tr><td>Derivative</td><td>d/dx(f(x), a)</td><td>d/dx(x², 3)=6</td></tr>
<tr><td>Integral</td><td>∫(f(x), a, b)</td><td>∫(x², 0, 1)=0.3333</td></tr>
</tbody></table>

<h3 id="table">Table</h3>
<p>Enter a function (e.g. x²+1), set range and step, generate (x, f(x)) table.</p>

<h3 id="spreadsheet">Spreadsheet</h3>
<table class="help-table"><thead><tr><th>Function</th><th>Description</th><th>Example</th></tr></thead><tbody>
<tr><td>SUM</td><td>Sum</td><td>=SUM(A1:A10)</td></tr>
<tr><td>AVERAGE</td><td>Average</td><td>=AVERAGE(B1:B5)</td></tr>
<tr><td>MAX</td><td>Maximum</td><td>=MAX(C1:C20)</td></tr>
<tr><td>MIN</td><td>Minimum</td><td>=MIN(D1:D20)</td></tr>
<tr><td>COUNT</td><td>Count</td><td>=COUNT(E1:E15)</td></tr>
</tbody></table>

<h3 id="memory">Memory</h3>
<table class="help-table"><thead><tr><th>Operation</th><th>Description</th></tr></thead><tbody>
<tr><td>STO</td><td>Store value to variable (A-Z)</td></tr>
<tr><td>RCL</td><td>Recall variable value</td></tr>
<tr><td>Ans</td><td>Use last calculation result</td></tr>
<tr><td>M+</td><td>Add to memory</td></tr>
<tr><td>M-</td><td>Subtract from memory</td></tr>
<tr><td>MR</td><td>Recall memory</td></tr>
<tr><td>MC</td><td>Clear memory</td></tr>
</tbody></table>

<h3 id="constants">Constants</h3>
<table class="help-table"><thead><tr><th>Constant</th><th>Symbol</th><th>Value</th></tr></thead><tbody>
<tr><td>Pi</td><td>π</td><td>3.141592653589793</td></tr>
<tr><td>Euler's number</td><td>e</td><td>2.718281828459045</td></tr>
<tr><td>Speed of light</td><td>c</td><td>2.998×10⁸ m/s</td></tr>
<tr><td>Planck constant</td><td>h</td><td>6.626×10⁻³⁴ J·s</td></tr>
<tr><td>Boltzmann constant</td><td>k</td><td>1.381×10⁻²³ J/K</td></tr>
</tbody></table>
<p>Click 📦 in toolbar for more constants.</p>

<h3 id="settings">Settings</h3>
<table class="help-table"><thead><tr><th>Setting</th><th>Options</th></tr></thead><tbody>
<tr><td>Angle unit</td><td>DEG (degrees), RAD (radians), GRAD (gradians)</td></tr>
<tr><td>Display format</td><td>NORM (normal), FIX (fixed), SCI (scientific)</td></tr>
<tr><td>Decimal places</td><td>0-9</td></tr>
<tr><td>Theme</td><td>Dark, Light</td></tr>
<tr><td>Language</td><td>中文, English</td></tr>
</tbody></table>

<h3 id="shortcuts">Keyboard Shortcuts</h3>
<table class="help-table"><thead><tr><th>Shortcut</th><th>Function</th></tr></thead><tbody>
<tr><td>Enter</td><td>Calculate</td></tr>
<tr><td>Escape</td><td>Clear input</td></tr>
<tr><td>Backspace</td><td>Delete last character</td></tr>
<tr><td>Ctrl+H</td><td>Toggle history</td></tr>
<tr><td>Ctrl+T</td><td>Toggle theme</td></tr>
<tr><td>↑ ↓</td><td>Browse history</td></tr>
</tbody></table>

<h3 id="errors">Errors</h3>
<table class="help-table"><thead><tr><th>Error</th><th>Cause</th><th>Solution</th></tr></thead><tbody>
<tr><td>Syntax Error</td><td>Invalid syntax</td><td>Check parentheses and operators</td></tr>
<tr><td>Math Error</td><td>Math error</td><td>Check division by zero, negative roots</td></tr>
<tr><td>Overflow</td><td>Overflow</td><td>Result too large</td></tr>
<tr><td>Singular Matrix</td><td>Singular matrix</td><td>Matrix not invertible (det=0)</td></tr>
</tbody></table>

<h3 id="faq">FAQ</h3>
<p><b>Q: Why doesn't sin(90) = 1?</b></p>
<p>A: Default is radians. Switch to degrees (DEG) in settings.</p>

<p><b>Q: How to enter complex numbers?</b></p>
<p>A: Switch to "Complex" mode, use <code>i</code> for imaginary unit, e.g. <code>3+4i</code>.</p>

<p><b>Q: How to solve equations?</b></p>
<p>A: Switch to "Equation" mode, select type, enter coefficients, click [=].</p>

<p><b>Q: Are results saved?</b></p>
<p>A: Yes, all settings and history are automatically saved.</p>

<p><b>Q: Maximum matrix size?</b></p>
<p>A: Up to 4×4 matrices.</p>

<p><b>Q: How to change display format?</b></p>
<p>A: Click ⚙️ settings icon, select format (NORM/FIX/SCI).</p>
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
      // Safe: HELP_CONTENT is a compile-time static string, no user input
      this.content.innerHTML = HELP_CONTENT[this.currentLang] || HELP_CONTENT.zh;
    }
  }
}
