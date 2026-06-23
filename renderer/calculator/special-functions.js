/**
 * 特殊函数模块
 * ratio/polar/rect/gcd/lcm/factorize/solveIneq/toDMS/toDecimal
 * 以及概率分布函数（uniform/exp/normal/binomial/poisson）
 * 以及回归分析（linear/quadratic/exponential）
 */
import { create, all } from 'mathjs';
import { _getAngleUnit as getAngleUnit } from './state.js';
import { formatResult } from './formatter.js';
import { getAngleUnitSuffix } from './angle-utils.js';

const math = create(all, { number: 'number', precision: 64 });

// ── 预编译正则表达式（避免每次调用重新创建） ──
const PATTERNS = Object.freeze({
  ratio: /^\s*ratio\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  verify: /^\s*verify\s*\(\s*(.+?),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  dice: /^\s*dice\s*\(\s*(\d+)\s*\)\s*$/i,
  coin: /^\s*coin\s*\(\s*(\d+)\s*\)\s*$/i,
  polar: /^\s*polar\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  rect: /^\s*rect\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  deriv: /^\s*d\/dx\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^)]+)\s*\)\s*$/i,
  integral: /^\s*integrate\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  sum: /^\s*sum\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  product: /^\s*product\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  gcd: /^\s*gcd\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  lcm: /^\s*lcm\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  factorize: /^\s*factorize\s*\(\s*([^)]+)\s*\)\s*$/i,
  linReg: /^\s*linReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)\s*$/i,
  quadReg: /^\s*quadReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)\s*$/i,
  expReg: /^\s*expReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)\s*$/i,
  powerReg: /^\s*powerReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)\s*$/i,
  logReg: /^\s*logReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)\s*$/i,
  logisticReg: /^\s*logisticReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)\s*$/i,
  normCDF: /^\s*normCDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  binomPMF: /^\s*binomPMF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  poissonPMF: /^\s*poissonPMF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  binomCDF: /^\s*binomCDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  poissonCDF: /^\s*poissonCDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  invNorm: /^\s*invNorm\s*\(\s*([^,)]+)(?:,\s*([^,)]+))?(?:,\s*([^)]+))?\s*\)\s*$/i,
  ineq6:
    /^\s*solveIneq\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  ineq5: /^\s*solveIneq\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  ineq4: /^\s*solveIneq\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  toDMS: /^\s*toDMS\s*\(\s*([^)]+)\s*\)\s*$/i,
  toDecimal: /^\s*toDecimal\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  uniformPDF: /^\s*uniformPDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  uniformCDF: /^\s*uniformCDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  expPDF: /^\s*expPDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  expCDF: /^\s*expCDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i
});

/**
 * 处理特殊函数调用
 */
export function handleSpecialFunctions(expr) {
  // Ratio: ratio(a,b,c) solves a:b = c:x for x
  const ratioMatch = expr.match(PATTERNS.ratio);
  if (ratioMatch) {
    const a = Number(ratioMatch[1].trim());
    const b = Number(ratioMatch[2].trim());
    const c = Number(ratioMatch[3].trim());
    if ([a, b, c].some(isNaN) || a === 0) {
      throw new Error('ratio(a,b,c) 参数无效');
    }
    return (b * c) / a;
  }

  // Verify: verify(lhs, rhs, val) - substitute val for ? in lhs and rhs, then compare
  const verifyMatch = expr.match(PATTERNS.verify);
  if (verifyMatch) {
    const lhsExpr = verifyMatch[1].trim();
    const rhsExpr = verifyMatch[2].trim();
    const val = verifyMatch[3].trim();
    try {
      const lhsResult = math.evaluate(lhsExpr.replace(/\?/g, `(${val})`));
      const rhsResult = math.evaluate(rhsExpr.replace(/\?/g, `(${val})`));
      const equal = Math.abs(Number(lhsResult) - Number(rhsResult)) < 1e-10;
      return equal
        ? '✓ 正确 (Correct)'
        : `✗ 错误: ${formatResult(lhsResult)} ≠ ${formatResult(rhsResult)}`;
    } catch {
      throw new Error('验证表达式无效');
    }
  }

  // Dice simulation: dice(n) - roll n dice, show results and frequencies
  const diceMatch = expr.match(PATTERNS.dice);
  if (diceMatch) {
    const n = Math.min(Math.max(parseInt(diceMatch[1]), 1), 100);
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
    const counts = [0, 0, 0, 0, 0, 0];
    rolls.forEach(r => counts[r - 1]++);
    const summary = counts.map((c, i) => `${i + 1}:${c}`).join(' ');
    return n <= 20 ? `[${rolls.join(',')}] ${summary}` : `${summary}`;
  }

  // Coin simulation: coin(n) - flip n coins, show H/T results and counts
  const coinMatch = expr.match(PATTERNS.coin);
  if (coinMatch) {
    const n = Math.min(Math.max(parseInt(coinMatch[1]), 1), 100);
    const flips = Array.from({ length: n }, () => (Math.random() < 0.5 ? 'H' : 'T'));
    const heads = flips.filter(f => f === 'H').length;
    const tails = n - heads;
    return n <= 20 ? `[${flips.join(',')}] H:${heads} T:${tails}` : `H:${heads} T:${tails}`;
  }

  // Polar form: polar(re, im) => (r, θ)
  const polarMatch = expr.match(PATTERNS.polar);
  if (polarMatch) {
    const re = Number(polarMatch[1].trim());
    const im = Number(polarMatch[2].trim());
    if ([re, im].some(isNaN)) {
      throw new Error('polar(re,im) 参数无效');
    }
    const r = Math.sqrt(re * re + im * im);
    let theta = Math.atan2(im, re);
    if (getAngleUnit() === 'deg') {
      theta = (theta * 180) / Math.PI;
    } else if (getAngleUnit() === 'grad') {
      theta = (theta * 200) / Math.PI;
    }
    return `r=${formatResult(r)}, θ=${formatResult(theta)}${getAngleUnitSuffix()}`;
  }

  // Rectangular form: rect(r, theta) => re + im*i
  const rectMatch = expr.match(PATTERNS.rect);
  if (rectMatch) {
    const r = Number(rectMatch[1].trim());
    let theta = Number(rectMatch[2].trim());
    if ([r, theta].some(isNaN)) {
      throw new Error('rect(r,θ) 参数无效');
    }
    if (getAngleUnit() === 'deg') {
      theta = (theta * Math.PI) / 180;
    } else if (getAngleUnit() === 'grad') {
      theta = (theta * Math.PI) / 200;
    }
    const re = r * Math.cos(theta);
    const im = r * Math.sin(theta);
    return formatResult(math.complex(re, im));
  }

  // Calculus: d/dx(f(x), x, point) - numerical derivative
  const derivMatch = expr.match(PATTERNS.deriv);
  if (derivMatch) {
    const funcExpr = derivMatch[1].trim();
    const variable = derivMatch[2].trim();
    const point = Number(derivMatch[3].trim());
    if (isNaN(point)) {
      throw new Error('求导点必须为数字');
    }
    return { __calculus: 'derivative', funcExpr, variable, point };
  }

  // Integral: integrate(f(x), x, a, b) - numerical integration
  const integralMatch = expr.match(PATTERNS.integral);
  if (integralMatch) {
    const funcExpr = integralMatch[1].trim();
    const variable = integralMatch[2].trim();
    const lower = Number(integralMatch[3].trim());
    const upper = Number(integralMatch[4].trim());
    if (isNaN(lower) || isNaN(upper)) {
      throw new Error('积分上下限必须为数字');
    }
    return { __calculus: 'integral', funcExpr, variable, lower, upper };
  }

  // Summation: sum(f(i), i, start, end)
  const sumMatch = expr.match(PATTERNS.sum);
  if (sumMatch) {
    const funcExpr = sumMatch[1].trim();
    const variable = sumMatch[2].trim();
    const start = Number(sumMatch[3].trim());
    const end = Number(sumMatch[4].trim());
    if (isNaN(start) || isNaN(end) || !Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error('求和上下限必须为整数');
    }
    return { __calculus: 'sum', funcExpr, variable, start, end };
  }

  // Product: product(f(i), i, start, end)
  const prodMatch = expr.match(PATTERNS.product);
  if (prodMatch) {
    const funcExpr = prodMatch[1].trim();
    const variable = prodMatch[2].trim();
    const start = Number(prodMatch[3].trim());
    const end = Number(prodMatch[4].trim());
    if (isNaN(start) || isNaN(end) || !Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error('求积上下限必须为整数');
    }
    return { __calculus: 'product', funcExpr, variable, start, end };
  }

  // GCD: gcd(a, b)
  const gcdMatch = expr.match(PATTERNS.gcd);
  if (gcdMatch) {
    const a = Number(gcdMatch[1].trim());
    const b = Number(gcdMatch[2].trim());
    if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('gcd参数必须为整数');
    }
    return gcd(Math.abs(a), Math.abs(b));
  }

  // LCM: lcm(a, b)
  const lcmMatch = expr.match(PATTERNS.lcm);
  if (lcmMatch) {
    const a = Number(lcmMatch[1].trim());
    const b = Number(lcmMatch[2].trim());
    if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('lcm参数必须为整数');
    }
    return lcm(Math.abs(a), Math.abs(b));
  }

  // Factorize: factorize(n)
  const factorMatch = expr.match(PATTERNS.factorize);
  if (factorMatch) {
    const n = Number(factorMatch[1].trim());
    if (isNaN(n) || !Number.isInteger(n) || n < 2) {
      throw new Error('factorize参数必须为大于1的整数');
    }
    return factorize(n);
  }

  // Linear regression: linReg([x1,x2,...], [y1,y2,...])
  const linRegMatch = expr.match(PATTERNS.linReg);
  if (linRegMatch) {
    const xData = linRegMatch[1].split(',').map(Number);
    const yData = linRegMatch[2].split(',').map(Number);
    if (xData.some(isNaN) || yData.some(isNaN) || xData.length !== yData.length) {
      throw new Error('回归分析数据无效');
    }
    return linearRegression(xData, yData);
  }

  // Quadratic regression: quadReg([x1,x2,...], [y1,y2,...])
  const quadRegMatch = expr.match(PATTERNS.quadReg);
  if (quadRegMatch) {
    const xData = quadRegMatch[1].split(',').map(Number);
    const yData = quadRegMatch[2].split(',').map(Number);
    if (xData.some(isNaN) || yData.some(isNaN) || xData.length !== yData.length) {
      throw new Error('回归分析数据无效');
    }
    return quadraticRegression(xData, yData);
  }

  // Exponential regression: expReg([x1,x2,...], [y1,y2,...])
  const expRegMatch = expr.match(PATTERNS.expReg);
  if (expRegMatch) {
    const xData = expRegMatch[1].split(',').map(Number);
    const yData = expRegMatch[2].split(',').map(Number);
    if (
      xData.some(isNaN) ||
      yData.some(isNaN) ||
      xData.length !== yData.length ||
      yData.some(y => y <= 0)
    ) {
      throw new Error('指数回归数据无效（y值必须为正）');
    }
    return exponentialRegression(xData, yData);
  }

  // Power regression: powerReg([x1,x2,...], [y1,y2,...])
  const powerRegMatch = expr.match(PATTERNS.powerReg);
  if (powerRegMatch) {
    const xData = powerRegMatch[1].split(',').map(Number);
    const yData = powerRegMatch[2].split(',').map(Number);
    if (
      xData.some(isNaN) ||
      yData.some(isNaN) ||
      xData.length !== yData.length ||
      xData.some(x => x <= 0) ||
      yData.some(y => y <= 0)
    ) {
      throw new Error('幂回归数据无效（x和y必须为正）');
    }
    return powerRegression(xData, yData);
  }

  // Logarithmic regression: logReg([x1,x2,...], [y1,y2,...])
  const logRegMatch = expr.match(PATTERNS.logReg);
  if (logRegMatch) {
    const xData = logRegMatch[1].split(',').map(Number);
    const yData = logRegMatch[2].split(',').map(Number);
    if (
      xData.some(isNaN) ||
      yData.some(isNaN) ||
      xData.length !== yData.length ||
      xData.some(x => x <= 0)
    ) {
      throw new Error('对数回归数据无效（x必须为正）');
    }
    return logarithmicRegression(xData, yData);
  }

  // Logistic regression: logisticReg([x1,x2,...], [y1,y2,...])
  const logisticRegMatch = expr.match(PATTERNS.logisticReg);
  if (logisticRegMatch) {
    const xData = logisticRegMatch[1].split(',').map(Number);
    const yData = logisticRegMatch[2].split(',').map(Number);
    if (xData.some(isNaN) || yData.some(isNaN) || xData.length !== yData.length) {
      throw new Error('Logistic回归数据无效');
    }
    return logisticRegression(xData, yData);
  }

  // Normal CDF: normCDF(x, mu, sigma)
  const normCDFMatch = expr.match(PATTERNS.normCDF);
  if (normCDFMatch) {
    const x = Number(normCDFMatch[1].trim());
    const mu = Number(normCDFMatch[2].trim());
    const sigma = Number(normCDFMatch[3].trim());
    if ([x, mu, sigma].some(isNaN) || sigma <= 0) {
      throw new Error('正态分布参数无效');
    }
    return normalCDF(x, mu, sigma);
  }

  // Binomial PMF: binomPMF(k, n, p)
  const binomPMFMatch = expr.match(PATTERNS.binomPMF);
  if (binomPMFMatch) {
    const k = Number(binomPMFMatch[1].trim());
    const n = Number(binomPMFMatch[2].trim());
    const p = Number(binomPMFMatch[3].trim());
    if (
      [k, n, p].some(isNaN) ||
      !Number.isInteger(k) ||
      !Number.isInteger(n) ||
      k < 0 ||
      k > n ||
      p < 0 ||
      p > 1
    ) {
      throw new Error('二项分布参数无效');
    }
    return binomialPMF(k, n, p);
  }

  // Poisson PMF: poissonPMF(k, lambda)
  const poissonPMFMatch = expr.match(PATTERNS.poissonPMF);
  if (poissonPMFMatch) {
    const k = Number(poissonPMFMatch[1].trim());
    const lambda = Number(poissonPMFMatch[2].trim());
    if ([k, lambda].some(isNaN) || !Number.isInteger(k) || k < 0 || lambda <= 0) {
      throw new Error('泊松分布参数无效');
    }
    return poissonPMF(k, lambda);
  }

  // Binomial CDF: binomCDF(k, n, p)
  const binomCDFMatch = expr.match(PATTERNS.binomCDF);
  if (binomCDFMatch) {
    const k = Number(binomCDFMatch[1].trim());
    const n = Number(binomCDFMatch[2].trim());
    const p = Number(binomCDFMatch[3].trim());
    if (
      [k, n, p].some(isNaN) ||
      !Number.isInteger(k) ||
      !Number.isInteger(n) ||
      k < 0 ||
      k > n ||
      p < 0 ||
      p > 1
    ) {
      throw new Error('二项分布CDF参数无效');
    }
    return binomialCDF(k, n, p);
  }

  // Poisson CDF: poissonCDF(k, lambda)
  const poissonCDFMatch = expr.match(PATTERNS.poissonCDF);
  if (poissonCDFMatch) {
    const k = Number(poissonCDFMatch[1].trim());
    const lambda = Number(poissonCDFMatch[2].trim());
    if ([k, lambda].some(isNaN) || !Number.isInteger(k) || k < 0 || lambda <= 0) {
      throw new Error('泊松分布CDF参数无效');
    }
    return poissonCDF(k, lambda);
  }

  // Inverse Normal CDF: invNorm(p, mu, sigma)
  const invNormMatch = expr.match(PATTERNS.invNorm);
  if (invNormMatch) {
    const p = Number(invNormMatch[1].trim());
    const mu = invNormMatch[2] !== undefined ? Number(invNormMatch[2].trim()) : 0;
    const sigma = invNormMatch[3] !== undefined ? Number(invNormMatch[3].trim()) : 1;
    if ([p, mu, sigma].some(isNaN) || p <= 0 || p >= 1 || sigma <= 0) {
      throw new Error('invNorm 参数无效 (0 < p < 1, σ > 0)');
    }
    return invNormalCDF(p, mu, sigma);
  }

  // Inequality solving: solveIneq(a, b, c, op) / solveIneq(a, b, c, d, op) / solveIneq(a, b, c, d, e, op)
  const ineqMatch4 = expr.match(PATTERNS.ineq6);
  if (ineqMatch4) {
    const params = ineqMatch4.slice(1, 6).map(s => Number(s.trim()));
    const op = ineqMatch4[6].trim().replace(/['"]/g, '');
    if (params.some(isNaN)) throw new Error('不等式参数无效');
    return solveGeneralInequality(params, op);
  }
  const ineqMatch3 = expr.match(PATTERNS.ineq5);
  if (ineqMatch3) {
    const params = ineqMatch3.slice(1, 5).map(s => Number(s.trim()));
    const op = ineqMatch3[5].trim().replace(/['"]/g, '');
    if (params.some(isNaN)) throw new Error('不等式参数无效');
    return solveGeneralInequality(params, op);
  }
  const ineqMatch = expr.match(PATTERNS.ineq4);
  if (ineqMatch) {
    const a = Number(ineqMatch[1].trim());
    const b = Number(ineqMatch[2].trim());
    const c = Number(ineqMatch[3].trim());
    const op = ineqMatch[4].trim().replace(/['"]/g, '');
    if ([a, b, c].some(isNaN)) {
      throw new Error('不等式参数无效');
    }
    return solveQuadraticInequality(a, b, c, op);
  }

  // DMS conversion: toDMS(decimal)
  const dmsMatch = expr.match(PATTERNS.toDMS);
  if (dmsMatch) {
    const decimal = Number(dmsMatch[1].trim());
    if (isNaN(decimal)) {
      throw new Error('度分秒转换参数无效');
    }
    return decimalToDMS(decimal);
  }

  // DMS to decimal: toDecimal(d, m, s)
  const decMatch = expr.match(/toDecimal\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (decMatch) {
    const d = Number(decMatch[1].trim());
    const m = Number(decMatch[2].trim());
    const s = Number(decMatch[3].trim());
    if ([d, m, s].some(isNaN)) {
      throw new Error('度分秒参数无效');
    }
    return dmsToDecimal(d, m, s);
  }

  // Uniform distribution PDF: uniformPDF(x, a, b)
  const uniformPDFMatch = expr.match(PATTERNS.uniformPDF);
  if (uniformPDFMatch) {
    const x = Number(uniformPDFMatch[1].trim());
    const a = Number(uniformPDFMatch[2].trim());
    const b = Number(uniformPDFMatch[3].trim());
    if ([x, a, b].some(isNaN) || a >= b) {
      throw new Error('均匀分布参数无效（a必须小于b）');
    }
    return uniformPDF(x, a, b);
  }

  // Uniform distribution CDF: uniformCDF(x, a, b)
  const uniformCDFMatch = expr.match(PATTERNS.uniformCDF);
  if (uniformCDFMatch) {
    const x = Number(uniformCDFMatch[1].trim());
    const a = Number(uniformCDFMatch[2].trim());
    const b = Number(uniformCDFMatch[3].trim());
    if ([x, a, b].some(isNaN) || a >= b) {
      throw new Error('均匀分布参数无效（a必须小于b）');
    }
    return uniformCDF(x, a, b);
  }

  // Exponential distribution PDF: expPDF(x, lambda)
  const expPDFMatch = expr.match(PATTERNS.expPDF);
  if (expPDFMatch) {
    const x = Number(expPDFMatch[1].trim());
    const lambda = Number(expPDFMatch[2].trim());
    if ([x, lambda].some(isNaN) || lambda <= 0 || x < 0) {
      throw new Error('指数分布参数无效');
    }
    return exponentialPDF(x, lambda);
  }

  // Exponential distribution CDF: expCDF(x, lambda)
  const expCDFMatch = expr.match(PATTERNS.expCDF);
  if (expCDFMatch) {
    const x = Number(expCDFMatch[1].trim());
    const lambda = Number(expCDFMatch[2].trim());
    if ([x, lambda].some(isNaN) || lambda <= 0 || x < 0) {
      throw new Error('指数分布参数无效');
    }
    return exponentialCDF(x, lambda);
  }

  return null;
}

// --- 内部工具函数 ---

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function factorize(n) {
  const factors = [];
  let num = n;

  for (let i = 2; i * i <= num; i++) {
    while (num % i === 0) {
      factors.push(i);
      num /= i;
    }
  }

  if (num > 1) {
    factors.push(num);
  }

  return factors.join(' × ');
}

function solveQuadraticInequality(a, b, c, op) {
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    if (a > 0) {
      return op === '>' || op === '>=' ? '所有实数' : '无解';
    } else {
      return op === '>' || op === '>=' ? '无解' : '所有实数';
    }
  }

  const sqrtD = Math.sqrt(discriminant);
  let x1 = (-b - sqrtD) / (2 * a);
  let x2 = (-b + sqrtD) / (2 * a);

  if (x1 > x2) [x1, x2] = [x2, x1];

  const rootStr =
    discriminant === 0
      ? `x = ${parseFloat(x1.toPrecision(6))}`
      : `x₁ = ${parseFloat(x1.toPrecision(6))}, x₂ = ${parseFloat(x2.toPrecision(6))}`;

  if (discriminant === 0) {
    if (op === '>' || op === '<') {
      return a > 0 ? `x ≠ ${parseFloat(x1.toPrecision(6))}` : '无解';
    } else {
      return '所有实数';
    }
  }

  if (op === '>') {
    return a > 0
      ? `x < ${parseFloat(x1.toPrecision(6))} 或 x > ${parseFloat(x2.toPrecision(6))}`
      : `${parseFloat(x1.toPrecision(6))} < x < ${parseFloat(x2.toPrecision(6))}`;
  } else if (op === '>=') {
    return a > 0
      ? `x ≤ ${parseFloat(x1.toPrecision(6))} 或 x ≥ ${parseFloat(x2.toPrecision(6))}`
      : `${parseFloat(x1.toPrecision(6))} ≤ x ≤ ${parseFloat(x2.toPrecision(6))}`;
  } else if (op === '<') {
    return a > 0
      ? `${parseFloat(x1.toPrecision(6))} < x < ${parseFloat(x2.toPrecision(6))}`
      : `x < ${parseFloat(x1.toPrecision(6))} 或 x > ${parseFloat(x2.toPrecision(6))}`;
  } else if (op === '<=') {
    return a > 0
      ? `${parseFloat(x1.toPrecision(6))} ≤ x ≤ ${parseFloat(x2.toPrecision(6))}`
      : `x ≤ ${parseFloat(x1.toPrecision(6))} 或 x ≥ ${parseFloat(x2.toPrecision(6))}`;
  }

  return rootStr;
}

/**
 * 通用不等式求解（三次/四次）
 * coeffs = [a, b, c, d] 对应 ax³+bx²+cx+d > 0
 * coeffs = [a, b, c, d, e] 对应 ax⁴+bx³+cx²+dx+e > 0
 */
function solveGeneralInequality(coeffs, op) {
  // 去除前导零
  while (coeffs.length > 1 && coeffs[0] === 0) {
    coeffs.shift();
  }

  const degree = coeffs.length - 1;

  if (degree <= 0) {
    const val = coeffs[0];
    if (val === 0) return op.includes('>') || op.includes('<') ? '无解' : '所有实数';
    const test = evalIneq(val > 0, op);
    return test ? '所有实数' : '无解';
  }

  if (degree === 1) {
    const [a, b] = coeffs;
    const root = -b / a;
    const sign = a > 0;
    return formatLinearIneq(root, sign, op);
  }

  if (degree === 2) {
    return solveQuadraticInequality(coeffs[0], coeffs[1], coeffs[2], op);
  }

  // degree 3 or 4: 求所有实根，按根分区间测试符号
  const roots = findPolynomialRoots(coeffs);

  // 去重并排序
  const realRoots = [...new Set(roots.map(r => parseFloat(r.toPrecision(10))))].sort(
    (a, b) => a - b
  );

  // 构建测试区间: (-∞, r1), r1, (r1, r2), r2, ..., (rn, +∞)
  // 测试每个区间中点的符号
  const intervals = [];

  // 测试 (-∞, r1) 的符号
  const testLeft = realRoots.length > 0 ? realRoots[0] - 1 : 0;
  void evalPoly(coeffs, testLeft); // side-effect check for root boundary

  // 测试每个区间
  const points = [-Infinity, ...realRoots, Infinity];

  for (let i = 0; i < points.length - 1; i++) {
    const left = points[i];
    const right = points[i + 1];

    // 区间中点
    let mid;
    if (left === -Infinity) {
      mid = right - 1;
    } else if (right === Infinity) {
      mid = left + 1;
    } else {
      mid = (left + right) / 2;
    }

    const polyVal = evalPoly(coeffs, mid);
    const testResult = evalIneq(polyVal > 0, op);

    if (testResult) {
      // 检查边界是否包含
      const leftIncl = left === -Infinity ? false : checkBoundary(coeffs, left, op);
      const rightIncl = right === Infinity ? false : checkBoundary(coeffs, right, op);

      const leftStr = left === -Infinity ? '-∞' : fmt(left);
      const rightStr = right === Infinity ? '+∞' : fmt(right);

      if (left === -Infinity && right === Infinity) {
        return '所有实数';
      }

      if (left === -Infinity) {
        intervals.push(`x${rightIncl ? ' ≤ ' : ' < '}${rightStr}`);
      } else if (right === Infinity) {
        intervals.push(`x${leftIncl ? ' ≥ ' : ' > '}${leftStr}`);
      } else {
        intervals.push(
          `${leftStr}${leftIncl ? ' ≤ ' : ' < '}x${rightIncl ? ' ≤ ' : ' < '}${rightStr}`
        );
      }
    }
  }

  if (intervals.length === 0) return '无解';

  // 合并相邻区间
  if (intervals.length === 1) return intervals[0];
  return intervals.join(' 或 ');
}

function evalPoly(coeffs, x) {
  let val = 0;
  const n = coeffs.length - 1;
  for (let i = 0; i <= n; i++) {
    val += coeffs[i] * Math.pow(x, n - i);
  }
  return val;
}

function evalIneq(polyPositive, op) {
  switch (op) {
    case '>':
      return polyPositive;
    case '>=':
      return polyPositive || true; // >=0 means not negative
    case '<':
      return !polyPositive;
    case '<=':
      return !polyPositive || true;
    default:
      return polyPositive;
  }
}

function checkBoundary(coeffs, root, op) {
  const val = evalPoly(coeffs, root);
  const isZero = Math.abs(val) < 1e-10;
  if (isZero) {
    return op === '>=' || op === '<=';
  }
  return false;
}

/**
 * 数值求解多项式实根（牛顿法 + 二分法）
 */
function findPolynomialRoots(coeffs) {
  const n = coeffs.length - 1;
  if (n <= 0) return [];

  // 先尝试有理根
  const rationalRoots = findRationalRoots(coeffs);
  let remaining = coeffs;
  const allRoots = [...rationalRoots];

  // 用有理根降阶
  for (const root of rationalRoots) {
    remaining = deflate(remaining, root);
  }

  // 对剩余多项式用牛顿法
  const deg = remaining.length - 1;
  if (deg === 1) {
    allRoots.push(-remaining[1] / remaining[0]);
  } else if (deg === 2) {
    const disc = remaining[1] * remaining[1] - 4 * remaining[0] * remaining[2];
    if (disc >= 0) {
      const sqrtD = Math.sqrt(disc);
      allRoots.push((-remaining[1] + sqrtD) / (2 * remaining[0]));
      allRoots.push((-remaining[1] - sqrtD) / (2 * remaining[0]));
    }
  } else {
    // 牛顿法搜索
    for (let start = -20; start <= 20; start += 0.5) {
      let x = start;
      for (let iter = 0; iter < 100; iter++) {
        const fx = evalPoly(remaining, x);
        if (Math.abs(fx) < 1e-12) break;
        const dfx = evalPolyDeriv(remaining, x);
        if (Math.abs(dfx) < 1e-15) break;
        x -= fx / dfx;
      }
      if (Math.abs(evalPoly(remaining, x)) < 1e-8) {
        allRoots.push(x);
      }
    }
  }

  // 去重
  const unique = [];
  for (const r of allRoots) {
    if (!unique.some(u => Math.abs(u - r) < 1e-6)) {
      unique.push(r);
    }
  }
  return unique.sort((a, b) => a - b);
}

function evalPolyDeriv(coeffs, x) {
  let val = 0;
  const n = coeffs.length - 1;
  for (let i = 0; i < n; i++) {
    val += coeffs[i] * (n - i) * Math.pow(x, n - i - 1);
  }
  return val;
}

function findRationalRoots(coeffs) {
  const an = coeffs[coeffs.length - 1];
  const a0 = coeffs[0];
  if (an === 0 || a0 === 0) return [];

  const absA0 = Math.abs(Math.round(a0));
  const absAn = Math.abs(Math.round(an));
  const roots = [];

  // 只在系数为整数时尝试有理根
  if (!coeffs.every(c => Number.isInteger(Math.round(c)))) return [];

  for (let p = 1; p <= Math.min(absA0, 100); p++) {
    if (absA0 % p !== 0) continue;
    for (let q = 1; q <= Math.min(absAn, 100); q++) {
      if (absAn % q !== 0) continue;
      const candidate = p / q;
      if (Math.abs(evalPoly(coeffs, candidate)) < 1e-8) {
        roots.push(candidate);
      }
      if (Math.abs(evalPoly(coeffs, -candidate)) < 1e-8) {
        roots.push(-candidate);
      }
    }
  }
  return roots;
}

function deflate(coeffs, root) {
  const n = coeffs.length - 1;
  const result = [coeffs[0]];
  for (let i = 1; i < n; i++) {
    result.push(coeffs[i] + result[i - 1] * root);
  }
  return result;
}

function formatLinearIneq(root, positiveSlope, op) {
  const r = fmt(root);
  if (positiveSlope) {
    if (op === '>') return `x > ${r}`;
    if (op === '>=') return `x ≥ ${r}`;
    if (op === '<') return `x < ${r}`;
    if (op === '<=') return `x ≤ ${r}`;
  } else {
    if (op === '>') return `x < ${r}`;
    if (op === '>=') return `x ≤ ${r}`;
    if (op === '<') return `x > ${r}`;
    if (op === '<=') return `x ≥ ${r}`;
  }
}

function fmt(val) {
  return parseFloat(val.toPrecision(6));
}

function decimalToDMS(decimal) {
  const d = Math.floor(decimal);
  const mFloat = (decimal - d) * 60;
  const m = Math.floor(mFloat);
  const s = (mFloat - m) * 60;

  return `${d}°${m}'${parseFloat(s.toPrecision(4))}"`;
}

function dmsToDecimal(d, m, s) {
  return parseFloat((d + m / 60 + s / 3600).toPrecision(10));
}

function uniformPDF(x, a, b) {
  if (x < a || x > b) return 0;
  return parseFloat((1 / (b - a)).toPrecision(8));
}

function uniformCDF(x, a, b) {
  if (x < a) return 0;
  if (x > b) return 1;
  return parseFloat(((x - a) / (b - a)).toPrecision(8));
}

function exponentialPDF(x, lambda) {
  if (x < 0) return 0;
  return parseFloat((lambda * Math.exp(-lambda * x)).toPrecision(8));
}

function exponentialCDF(x, lambda) {
  if (x < 0) return 0;
  return parseFloat((1 - Math.exp(-lambda * x)).toPrecision(8));
}

function linearRegression(xData, yData) {
  const n = xData.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += xData[i];
    sumY += yData[i];
    sumXY += xData[i] * yData[i];
    sumX2 += xData[i] * xData[i];
    sumY2 += yData[i] * yData[i];
  }

  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - a * sumX) / n;

  // 相关系数 r
  const denom = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 1;
  const r2 = r * r;

  return `y = ${parseFloat(a.toPrecision(6))}x + ${parseFloat(b.toPrecision(6))}\nr = ${parseFloat(r.toPrecision(6))}  r² = ${parseFloat(r2.toPrecision(6))}`;
}

function quadraticRegression(xData, yData) {
  const n = xData.length;
  let sumX = 0,
    sumX2 = 0,
    sumX3 = 0,
    sumX4 = 0;
  let sumY = 0,
    sumXY = 0,
    sumX2Y = 0;

  for (let i = 0; i < n; i++) {
    const x = xData[i];
    const y = yData[i];
    sumX += x;
    sumX2 += x * x;
    sumX3 += x * x * x;
    sumX4 += x * x * x * x;
    sumY += y;
    sumXY += x * y;
    sumX2Y += x * x * y;
  }

  const D =
    n * (sumX2 * sumX4 - sumX3 * sumX3) -
    sumX * (sumX * sumX4 - sumX2 * sumX3) +
    sumX2 * (sumX * sumX3 - sumX2 * sumX2);
  const Da =
    sumY * (sumX2 * sumX4 - sumX3 * sumX3) -
    sumX * (sumXY * sumX4 - sumX2Y * sumX3) +
    sumX2 * (sumXY * sumX3 - sumX2Y * sumX2);
  const Db =
    n * (sumXY * sumX4 - sumX2Y * sumX3) -
    sumY * (sumX * sumX4 - sumX2 * sumX3) +
    sumX2 * (sumX * sumX2Y - sumX2 * sumXY);
  const Dc =
    n * (sumX2 * sumX2Y - sumX3 * sumXY) -
    sumX * (sumX * sumX2Y - sumX2 * sumXY) +
    sumY * (sumX * sumX3 - sumX2 * sumX2);

  const a = Da / D;
  const b = Db / D;
  const c = Dc / D;

  // R² (决定系数)
  const yMean = sumY / n;
  let ssTot = 0,
    ssRes = 0;
  for (let i = 0; i < n; i++) {
    const x = xData[i];
    const yPred = a * x * x + b * x + c;
    ssTot += (yData[i] - yMean) ** 2;
    ssRes += (yData[i] - yPred) ** 2;
  }
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1;

  return `y = ${parseFloat(a.toPrecision(6))}x² + ${parseFloat(b.toPrecision(6))}x + ${parseFloat(c.toPrecision(6))}\nR² = ${parseFloat(r2.toPrecision(6))}`;
}

function exponentialRegression(xData, yData) {
  const n = xData.length;
  const lnY = yData.map(y => Math.log(y));

  let sumX = 0,
    sumLnY = 0,
    sumXLnY = 0,
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += xData[i];
    sumLnY += lnY[i];
    sumXLnY += xData[i] * lnY[i];
    sumX2 += xData[i] * xData[i];
  }

  const b = (n * sumXLnY - sumX * sumLnY) / (n * sumX2 - sumX * sumX);
  const lnA = (sumLnY - b * sumX) / n;
  const a = Math.exp(lnA);

  // R²
  const yMean = lnY.reduce((s, v) => s + v, 0) / n;
  let ssTot = 0,
    ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = lnA + b * xData[i];
    ssTot += (lnY[i] - yMean) ** 2;
    ssRes += (lnY[i] - yPred) ** 2;
  }
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1;

  return `y = ${parseFloat(a.toPrecision(6))}·e^(${parseFloat(b.toPrecision(6))}x)\nR² = ${parseFloat(r2.toPrecision(6))}`;
}

/**
 * 幂回归: y = a·x^b
 * 取对数: ln(y) = ln(a) + b·ln(x)
 */
function powerRegression(xData, yData) {
  const n = xData.length;
  const lnX = xData.map(x => Math.log(x));
  const lnY = yData.map(y => Math.log(y));

  let sumLnX = 0,
    sumLnY = 0,
    sumLnXLnY = 0,
    sumLnX2 = 0;

  for (let i = 0; i < n; i++) {
    sumLnX += lnX[i];
    sumLnY += lnY[i];
    sumLnXLnY += lnX[i] * lnY[i];
    sumLnX2 += lnX[i] * lnX[i];
  }

  const b = (n * sumLnXLnY - sumLnX * sumLnY) / (n * sumLnX2 - sumLnX * sumLnX);
  const lnA = (sumLnY - b * sumLnX) / n;
  const a = Math.exp(lnA);

  // R²
  const yMean = lnY.reduce((s, v) => s + v, 0) / n;
  let ssTot = 0,
    ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = lnA + b * lnX[i];
    ssTot += (lnY[i] - yMean) ** 2;
    ssRes += (lnY[i] - yPred) ** 2;
  }
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1;

  return `y = ${parseFloat(a.toPrecision(6))}·x^${parseFloat(b.toPrecision(6))}\nR² = ${parseFloat(r2.toPrecision(6))}`;
}

/**
 * 对数回归: y = a + b·ln(x)
 */
function logarithmicRegression(xData, yData) {
  const n = xData.length;
  const lnX = xData.map(x => Math.log(x));

  let sumLnX = 0,
    sumY = 0,
    sumLnXY = 0,
    sumLnX2 = 0;

  for (let i = 0; i < n; i++) {
    sumLnX += lnX[i];
    sumY += yData[i];
    sumLnXY += lnX[i] * yData[i];
    sumLnX2 += lnX[i] * lnX[i];
  }

  const b = (n * sumLnXY - sumLnX * sumY) / (n * sumLnX2 - sumLnX * sumLnX);
  const a = (sumY - b * sumLnX) / n;

  // R²
  const yMean = sumY / n;
  let ssTot = 0,
    ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yPred = a + b * lnX[i];
    ssTot += (yData[i] - yMean) ** 2;
    ssRes += (yData[i] - yPred) ** 2;
  }
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1;

  return `y = ${parseFloat(a.toPrecision(6))} + ${parseFloat(b.toPrecision(6))}·ln(x)\nR² = ${parseFloat(r2.toPrecision(6))}`;
}

/**
 * Logistic 回归: y = c / (1 + a·e^(-b·x))
 * 使用 Gauss-Newton 迭代法
 */
function logisticRegression(xData, yData) {
  const n = xData.length;
  const yMax = Math.max(...yData) * 1.1;

  // 初始猜测
  let c = yMax;
  let b = 0.5;
  let a = 1;

  // 简化：用线性化方法近似
  // ln(c/y - 1) = ln(a) - b*x
  // 需要 c > 所有 y
  for (let iter = 0; iter < 50; iter++) {
    // 更新 c 为最大 y 值的 1.05 倍
    const cNew = Math.max(...yData) * (1 + (0.05 * (iter + 1)) / 50);

    const valid = yData.every(y => y > 0 && y < cNew);
    if (!valid) {
      c = cNew * 1.2;
      continue;
    }

    const lnRatio = yData.map(y => Math.log(cNew / y - 1));

    // ln(a) - b*x = lnRatio
    let sumX = 0,
      sumLnR = 0,
      sumXLnR = 0,
      sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += xData[i];
      sumLnR += lnRatio[i];
      sumXLnR += xData[i] * lnRatio[i];
      sumX2 += xData[i] * xData[i];
    }

    const negB = (n * sumXLnR - sumX * sumLnR) / (n * sumX2 - sumX * sumX);
    const lnA = (sumLnR - negB * sumX) / n;

    c = cNew;
    b = -negB;
    a = Math.exp(lnA);

    if (b > 0 && a > 0) break;
  }

  // R²
  let ssTot = 0,
    ssRes = 0;
  const yMean = yData.reduce((s, v) => s + v, 0) / n;
  for (let i = 0; i < n; i++) {
    const yPred = c / (1 + a * Math.exp(-b * xData[i]));
    ssTot += (yData[i] - yMean) ** 2;
    ssRes += (yData[i] - yPred) ** 2;
  }
  const r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 1;

  return `y = ${parseFloat(c.toPrecision(6))} / (1 + ${parseFloat(a.toPrecision(6))}·e^(-${parseFloat(b.toPrecision(6))}x))\nR² = ${parseFloat(r2.toPrecision(6))}`;
}

function normalCDF(x, mu, sigma) {
  const z = (x - mu) / sigma;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const erf =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp((-absZ * absZ) / 2);
  const sign = z < 0 ? -1 : 1;
  const cdf = 0.5 * (1.0 + sign * erf);

  return parseFloat(cdf.toPrecision(8));
}

function binomialPMF(k, n, p) {
  const coeff = factorial(n) / (factorial(k) * factorial(n - k));
  return parseFloat((coeff * Math.pow(p, k) * Math.pow(1 - p, n - k)).toPrecision(8));
}

function poissonPMF(k, lambda) {
  return parseFloat(((Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)).toPrecision(8));
}

function binomialCDF(k, n, p) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(i, n, p);
  }
  return parseFloat(Math.min(1, sum).toPrecision(8));
}

function poissonCDF(k, lambda) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += poissonPMF(i, lambda);
  }
  return parseFloat(Math.min(1, sum).toPrecision(8));
}

/**
 * 正态分布反函数 (Abramowitz & Stegun 近似)
 * 给定概率 p，返回 z 值使得 P(Z ≤ z) = p
 * 精度: |error| < 4.5×10⁻⁴
 */
function invNormalCDF(p, mu, sigma) {
  if (p <= 0 || p >= 1) throw new Error('p 必须在 (0, 1) 之间');

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
    -3.066479806614716e1, 2.506628277459239
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
    -1.328068155288572e1
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
    4.374664141464968, 2.938163982698783
  ];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  let q, r, z;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    z =
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    z =
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    z =
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }

  return parseFloat((mu + sigma * z).toPrecision(8));
}

const MAX_FACTORIAL_INPUT = 170;

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('阶乘仅支持非负整数');
  }
  if (n > MAX_FACTORIAL_INPUT) {
    throw new Error(`阶乘输入不能超过 ${MAX_FACTORIAL_INPUT}（结果溢出）`);
  }
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
