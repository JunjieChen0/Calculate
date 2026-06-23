/**
 * 特殊函数模块
 * ratio/polar/rect/gcd/lcm/factorize/solveIneq/toDMS/toDecimal
 * 以及概率分布函数（uniform/exp/normal/binomial/poisson）
 * 以及回归分析（linear/quadratic/exponential）
 */
import { math } from './math-instance.js';
import { _getAngleUnit as getAngleUnit } from './state.js';
import { formatResult } from './formatter.js';
import { getAngleUnitSuffix } from './angle-utils.js';

import {
  uniformPDF,
  uniformCDF,
  exponentialPDF,
  exponentialCDF,
  normalCDF,
  binomialPMF,
  poissonPMF,
  binomialCDF,
  poissonCDF,
  invNormalCDF,
  chiSquaredCDF,
  tDistributionCDF,
  fDistributionCDF
} from './probability.js';
import {
  linearRegression,
  quadraticRegression,
  exponentialRegression,
  powerRegression,
  logarithmicRegression,
  logisticRegression
} from './regression.js';
import {
  gcd,
  lcm,
  factorize,
  solveQuadraticInequality,
  solveGeneralInequality,
  decimalToDMS,
  dmsToDecimal
} from './number-theory.js';
import { DICE_MAX_ROLLS, COIN_MAX_FLIPS } from '../shared/constants.js';

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
  expCDF: /^\s*expCDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  geoPMF: /^\s*geoPMF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  geoCDF: /^\s*geoCDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  chi2CDF: /^\s*chi2CDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  tCDF: /^\s*tCDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)\s*$/i,
  FCDF: /^\s*FCDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)\s*$/i
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
    const n = Math.min(Math.max(parseInt(diceMatch[1]), 1), DICE_MAX_ROLLS);
    const rolls = Array.from({ length: n }, () => Math.floor(Math.random() * 6) + 1);
    const counts = [0, 0, 0, 0, 0, 0];
    rolls.forEach(r => counts[r - 1]++);
    const summary = counts.map((c, i) => `${i + 1}:${c}`).join(' ');
    return n <= 20 ? `[${rolls.join(',')}] ${summary}` : `${summary}`;
  }

  // Coin simulation: coin(n) - flip n coins, show H/T results and counts
  const coinMatch = expr.match(PATTERNS.coin);
  if (coinMatch) {
    const n = Math.min(Math.max(parseInt(coinMatch[1]), 1), COIN_MAX_FLIPS);
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

  // Geometric distribution PMF: geoPMF(k, p)
  const geoPMFMatch = expr.match(PATTERNS.geoPMF);
  if (geoPMFMatch) {
    const k = Number(geoPMFMatch[1].trim());
    const p = Number(geoPMFMatch[2].trim());
    if (isNaN(k) || isNaN(p) || p <= 0 || p >= 1 || k < 0 || !Number.isInteger(k)) {
      throw new Error('geoPMF(k,p) 参数无效');
    }
    return Math.pow(1 - p, k) * p;
  }

  // Geometric distribution CDF: geoCDF(k, p)
  const geoCDFMatch = expr.match(PATTERNS.geoCDF);
  if (geoCDFMatch) {
    const k = Number(geoCDFMatch[1].trim());
    const p = Number(geoCDFMatch[2].trim());
    if (isNaN(k) || isNaN(p) || p <= 0 || p >= 1 || k < 0) {
      throw new Error('geoCDF(k,p) 参数无效');
    }
    return 1 - Math.pow(1 - p, Math.floor(k) + 1);
  }

  // Chi-squared CDF: chi2CDF(x, df)
  const chi2CDFMatch = expr.match(PATTERNS.chi2CDF);
  if (chi2CDFMatch) {
    const x = Number(chi2CDFMatch[1].trim());
    const df = Number(chi2CDFMatch[2].trim());
    if (isNaN(x) || isNaN(df) || df < 1 || x < 0) {
      throw new Error('chi2CDF(x,df) 参数无效');
    }
    return chiSquaredCDF(x, df);
  }

  // Student's t CDF: tCDF(x, df)
  const tCDFMatch = expr.match(PATTERNS.tCDF);
  if (tCDFMatch) {
    const x = Number(tCDFMatch[1].trim());
    const df = Number(tCDFMatch[2].trim());
    if (isNaN(x) || isNaN(df) || df < 1) {
      throw new Error('tCDF(x,df) 参数无效');
    }
    return tDistributionCDF(x, df);
  }

  // F distribution CDF: FCDF(x, df1, df2)
  const FCDFMatch = expr.match(PATTERNS.FCDF);
  if (FCDFMatch) {
    const x = Number(FCDFMatch[1].trim());
    const df1 = Number(FCDFMatch[2].trim());
    const df2 = Number(FCDFMatch[3].trim());
    if (isNaN(x) || isNaN(df1) || isNaN(df2) || df1 < 1 || df2 < 1 || x < 0) {
      throw new Error('FCDF(x,df1,df2) 参数无效');
    }
    return fDistributionCDF(x, df1, df2);
  }

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
