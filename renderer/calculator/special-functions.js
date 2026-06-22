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

/**
 * 处理特殊函数调用
 */
export function handleSpecialFunctions(expr) {
  // Ratio: ratio(a,b,c) solves a:b = c:x for x
  const ratioMatch = expr.match(/ratio\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (ratioMatch) {
    const a = Number(ratioMatch[1].trim());
    const b = Number(ratioMatch[2].trim());
    const c = Number(ratioMatch[3].trim());
    if ([a, b, c].some(isNaN) || a === 0) {
      throw new Error('ratio(a,b,c) 参数无效');
    }
    return (b * c) / a;
  }

  // Polar form: polar(re, im) => (r, θ)
  const polarMatch = expr.match(/polar\s*\(\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const rectMatch = expr.match(/rect\s*\(\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const derivMatch = expr.match(/d\/dx\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^)]+)\s*\)/i);
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
  const integralMatch = expr.match(
    /integrate\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^,]+),\s*([^)]+)\s*\)/i
  );
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
  const sumMatch = expr.match(/sum\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const prodMatch = expr.match(/product\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const gcdMatch = expr.match(/gcd\s*\(\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (gcdMatch) {
    const a = Number(gcdMatch[1].trim());
    const b = Number(gcdMatch[2].trim());
    if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('gcd参数必须为整数');
    }
    return gcd(Math.abs(a), Math.abs(b));
  }

  // LCM: lcm(a, b)
  const lcmMatch = expr.match(/lcm\s*\(\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (lcmMatch) {
    const a = Number(lcmMatch[1].trim());
    const b = Number(lcmMatch[2].trim());
    if (isNaN(a) || isNaN(b) || !Number.isInteger(a) || !Number.isInteger(b)) {
      throw new Error('lcm参数必须为整数');
    }
    return lcm(Math.abs(a), Math.abs(b));
  }

  // Factorize: factorize(n)
  const factorMatch = expr.match(/factorize\s*\(\s*([^)]+)\s*\)/i);
  if (factorMatch) {
    const n = Number(factorMatch[1].trim());
    if (isNaN(n) || !Number.isInteger(n) || n < 2) {
      throw new Error('factorize参数必须为大于1的整数');
    }
    return factorize(n);
  }

  // Linear regression: linReg([x1,x2,...], [y1,y2,...])
  const linRegMatch = expr.match(/linReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)/i);
  if (linRegMatch) {
    const xData = linRegMatch[1].split(',').map(Number);
    const yData = linRegMatch[2].split(',').map(Number);
    if (xData.some(isNaN) || yData.some(isNaN) || xData.length !== yData.length) {
      throw new Error('回归分析数据无效');
    }
    return linearRegression(xData, yData);
  }

  // Quadratic regression: quadReg([x1,x2,...], [y1,y2,...])
  const quadRegMatch = expr.match(/quadReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)/i);
  if (quadRegMatch) {
    const xData = quadRegMatch[1].split(',').map(Number);
    const yData = quadRegMatch[2].split(',').map(Number);
    if (xData.some(isNaN) || yData.some(isNaN) || xData.length !== yData.length) {
      throw new Error('回归分析数据无效');
    }
    return quadraticRegression(xData, yData);
  }

  // Exponential regression: expReg([x1,x2,...], [y1,y2,...])
  const expRegMatch = expr.match(/expReg\s*\(\s*\[([^\]]+)\]\s*,\s*\[([^\]]+)\]\s*\)/i);
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

  // Normal CDF: normCDF(x, mu, sigma)
  const normCDFMatch = expr.match(/normCDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const binomPMFMatch = expr.match(/binomPMF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const poissonPMFMatch = expr.match(/poissonPMF\s*\(\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (poissonPMFMatch) {
    const k = Number(poissonPMFMatch[1].trim());
    const lambda = Number(poissonPMFMatch[2].trim());
    if ([k, lambda].some(isNaN) || !Number.isInteger(k) || k < 0 || lambda <= 0) {
      throw new Error('泊松分布参数无效');
    }
    return poissonPMF(k, lambda);
  }

  // Inequality solving: solveIneq(a, b, c, op)
  const ineqMatch = expr.match(/solveIneq\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const dmsMatch = expr.match(/toDMS\s*\(\s*([^)]+)\s*\)/i);
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
  const uniformPDFMatch = expr.match(/uniformPDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const uniformCDFMatch = expr.match(/uniformCDF\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
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
  const expPDFMatch = expr.match(/expPDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (expPDFMatch) {
    const x = Number(expPDFMatch[1].trim());
    const lambda = Number(expPDFMatch[2].trim());
    if ([x, lambda].some(isNaN) || lambda <= 0 || x < 0) {
      throw new Error('指数分布参数无效');
    }
    return exponentialPDF(x, lambda);
  }

  // Exponential distribution CDF: expCDF(x, lambda)
  const expCDFMatch = expr.match(/expCDF\s*\(\s*([^,]+),\s*([^)]+)\s*\)/i);
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
    sumX2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += xData[i];
    sumY += yData[i];
    sumXY += xData[i] * yData[i];
    sumX2 += xData[i] * xData[i];
  }

  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - a * sumX) / n;

  return `y = ${parseFloat(a.toPrecision(6))}x + ${parseFloat(b.toPrecision(6))}`;
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

  return `y = ${parseFloat(a.toPrecision(6))}x² + ${parseFloat(b.toPrecision(6))}x + ${parseFloat(c.toPrecision(6))}`;
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

  return `y = ${parseFloat(a.toPrecision(6))} * e^(${parseFloat(b.toPrecision(6))}x)`;
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
