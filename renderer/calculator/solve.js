/**
 * 求解模式模块
 * 方程求解：数值求解、二次/三次方程、线性方程组
 */
import { create, all } from 'mathjs';
import {
  ROOT_FINDING_TOLERANCE,
  ROOT_EQUALITY_TOLERANCE,
  BISECTION_MAX_ITERATIONS
} from '../shared/constants.js';
import { formatResult } from './formatter.js';

const math = create(all, { number: 'number', precision: 64 });

/**
 * 求解表达式
 */
export function handleSolve(expr) {
  if (expr.includes('=')) {
    const [left, right] = expr.split('=').map(s => s.trim());
    const vars = extractVariables(left + ' ' + right);
    if (vars.length === 0) {
      throw new Error('未找到未知数，例如输入 x^2 - 4 = 0');
    }
    const variable = vars[0];
    const equationExpr = `(${left}) - (${right})`;
    return solveNumerically(equationExpr, variable);
  }

  const specialResult = solveSpecialEquation(expr);
  if (specialResult !== null) {
    return specialResult;
  }

  return math.evaluate(expr);
}

/**
 * 数值求解（二分法）
 */
function solveNumerically(equationExpr, variable) {
  const evalAt = val => {
    const substituted = equationExpr.replace(new RegExp(`\\b${variable}\\b`, 'g'), `(${val})`);
    const result = math.evaluate(substituted);
    return typeof result === 'number' ? result : Number(result);
  };

  const f0 = evalAt(0);
  if (Math.abs(f0) < ROOT_FINDING_TOLERANCE) {
    return [0];
  }

  const roots = [];
  const searchRanges = [-100, -10, -1, -0.1, 0, 0.1, 1, 10, 100];

  for (let ri = 0; ri < searchRanges.length - 1; ri++) {
    const a = searchRanges[ri];
    const b = searchRanges[ri + 1];
    let fa, fb;
    try {
      fa = evalAt(a);
      fb = evalAt(b);
    } catch {
      continue;
    }
    if (!Number.isFinite(fa) || !Number.isFinite(fb)) continue;

    if (Math.abs(fa) < ROOT_FINDING_TOLERANCE) {
      if (!roots.some(r => Math.abs(r - a) < ROOT_EQUALITY_TOLERANCE)) {
        roots.push(parseFloat(a.toPrecision(12)));
      }
      continue;
    }

    if (fa * fb < 0) {
      let lo = a;
      let hi = b;
      for (let iter = 0; iter < BISECTION_MAX_ITERATIONS; iter++) {
        const mid = (lo + hi) / 2;
        let fmid;
        try {
          fmid = evalAt(mid);
        } catch {
          break;
        }
        if (!Number.isFinite(fmid)) break;
        if (Math.abs(fmid) < ROOT_FINDING_TOLERANCE) {
          lo = mid;
          hi = mid;
          break;
        }
        if (fmid * fa < 0) {
          hi = mid;
        } else {
          lo = mid;
          fa = fmid;
        }
      }
      const root = parseFloat(((lo + hi) / 2).toPrecision(12));
      if (!roots.some(r => Math.abs(r - root) < ROOT_EQUALITY_TOLERANCE)) {
        roots.push(root);
      }
    }
  }

  if (roots.length === 0) {
    throw new Error('在搜索范围内未找到方程的解');
  }

  return roots.sort((a, b) => a - b);
}

/**
 * 特殊方程求解
 */
function solveSpecialEquation(expr) {
  // Quadratic equation: solve2(a,b,c)
  const quadMatch = expr.match(/solve2\s*\(\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (quadMatch) {
    const a = Number(quadMatch[1].trim());
    const b = Number(quadMatch[2].trim());
    const c = Number(quadMatch[3].trim());

    if ([a, b, c].some(isNaN)) {
      throw new Error('solve2(a,b,c) 参数必须为数字');
    }

    if (a === 0) {
      if (b === 0) {
        if (c === 0) throw new Error('方程有无穷多解');
        throw new Error('方程无解');
      }
      return [-c / b];
    }

    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
      const sqrtD = Math.sqrt(discriminant);
      if (Number.isInteger(sqrtD)) {
        // Exact rational roots
        return [(-b + sqrtD) / (2 * a), (-b - sqrtD) / (2 * a)];
      }
      // Exact radical form: (-b +/- sqrt(D)) / (2a)
      // Simplify: factor out GCD from b and D, and factor from sqrt(D)
      const sqFree = simplifySqrt(discriminant);
      // Result: (-b +/- sqFree.a*sqrt(sqFree.b)) / (2a)
      // Try to simplify the overall fraction
      const denom = 2 * a;
      const g1 = gcdInt(Math.abs(Math.round(b)), Math.abs(Math.round(denom)));
      const g2 = gcdInt(sqFree.a, Math.abs(Math.round(denom)));
      const commonG = gcdInt(g1, g2);
      const sB = -b / commonG;
      const sA = sqFree.a / commonG;
      const sDenom = denom / commonG;
      if (sDenom === 1) {
        if (sA === 1) {
          return [sB + '+' + '√' + sqFree.b, sB + '-' + '√' + sqFree.b];
        }
        return [sB + '+' + sA + '√' + sqFree.b, sB + '-' + sA + '√' + sqFree.b];
      }
      if (sB === 0) {
        if (sA === 1) {
          return ['√' + sqFree.b + '/' + sDenom, '-√' + sqFree.b + '/' + sDenom];
        }
        return [sA + '√' + sqFree.b + '/' + sDenom, '-' + sA + '√' + sqFree.b + '/' + sDenom];
      }
      const num1 = sA === 1 ? sB + '+√' + sqFree.b : sB + '+' + sA + '√' + sqFree.b;
      const num2 = sA === 1 ? sB + '-√' + sqFree.b : sB + '-' + sA + '√' + sqFree.b;
      return ['(' + num1 + ')/' + sDenom, '(' + num2 + ')/' + sDenom];
    } else {
      const real = -b / (2 * a);
      const imag = Math.sqrt(-discriminant) / (2 * a);
      return [
        `${formatResult(real)} + ${formatResult(imag)}i`,
        `${formatResult(real)} - ${formatResult(imag)}i`
      ];
    }
  }

  // Cubic equation: solve3(a,b,c,d)
  const cubicMatch = expr.match(/solve3\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (cubicMatch) {
    const a = Number(cubicMatch[1].trim());
    const b = Number(cubicMatch[2].trim());
    const c = Number(cubicMatch[3].trim());
    const d = Number(cubicMatch[4].trim());

    if ([a, b, c, d].some(isNaN)) {
      throw new Error('solve3(a,b,c,d) 参数必须为数字');
    }

    return solveCubic(a, b, c, d);
  }

  // Quartic equation: solve4(a,b,c,d,e)
  const quarticMatch = expr.match(
    /solve4\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i
  );
  if (quarticMatch) {
    const params = quarticMatch.slice(1, 6).map(s => Number(s.trim()));
    if (params.some(isNaN)) {
      throw new Error('solve4 参数必须为数字');
    }
    return solveQuartic(...params);
  }

  // Linear system 2x2
  const linear2Match = expr.match(
    /solveLinear2\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i
  );
  if (linear2Match) {
    const params = linear2Match.slice(1, 7).map(s => Number(s.trim()));
    if (params.some(isNaN)) {
      throw new Error('solveLinear2 参数必须为数字');
    }
    const [a1, b1, c1, a2, b2, c2] = params;
    const det = a1 * b2 - a2 * b1;
    if (Math.abs(det) < 1e-14) {
      throw new Error('方程组无解或有无穷多解');
    }
    const x = (c1 * b2 - c2 * b1) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    return { x, y };
  }

  // Linear system 3x3
  const linear3Match = expr.match(
    /solveLinear3\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i
  );
  if (linear3Match) {
    const params = linear3Match.slice(1, 13).map(s => Number(s.trim()));
    if (params.some(isNaN)) {
      throw new Error('solveLinear3 参数必须为数字');
    }
    const [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3] = params;
    const det = a1 * (b2 * c3 - b3 * c2) - b1 * (a2 * c3 - a3 * c2) + c1 * (a2 * b3 - a3 * b2);
    if (Math.abs(det) < 1e-14) {
      throw new Error('方程组无解或有无穷多解');
    }
    const A = [
      [a1, b1, c1],
      [a2, b2, c2],
      [a3, b3, c3]
    ];
    const B = [d1, d2, d3];
    try {
      const solution = math.lusolve(A, B);
      const arr = Array.isArray(solution) ? solution : solution.toArray();
      return arr.flat();
    } catch {
      throw new Error('方程组求解失败，系数矩阵可能接近奇异');
    }
  }

  // Linear system 4x4
  const linear4Pattern =
    /solveLinear4\s*\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\s*\)/i;
  const linear4Match = expr.match(linear4Pattern);
  if (linear4Match) {
    const params = linear4Match.slice(1, 21).map(s => Number(s.trim()));
    if (params.some(isNaN)) {
      throw new Error('solveLinear4 参数必须为数字');
    }
    return solveLinear4System(params);
  }

  return null;
}

/**
 * 三次方程求解
 */
function solveCubic(a, b, c, d) {
  if (a === 0) {
    if (b === 0) {
      if (c === 0) {
        if (d === 0) throw new Error('方程有无穷多解');
        throw new Error('方程无解');
      }
      return [-d / c];
    }
    const disc = c * c - 4 * b * d;
    if (disc >= 0) {
      return [(-c + Math.sqrt(disc)) / (2 * b), (-c - Math.sqrt(disc)) / (2 * b)];
    }
    const re = -c / (2 * b);
    const im = Math.sqrt(-disc) / (2 * b);
    return [
      `${formatResult(re)} + ${formatResult(im)}i`,
      `${formatResult(re)} - ${formatResult(im)}i`
    ];
  }

  const p = (3 * a * c - b * b) / (3 * a * a);
  const q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  const offset = -b / (3 * a);

  const discriminant = (q / 2) * (q / 2) + (p / 3) * (p / 3) * (p / 3);

  const roots = [];

  if (discriminant >= 0) {
    const u = Math.cbrt(-q / 2 + Math.sqrt(discriminant));
    const v = Math.cbrt(-q / 2 - Math.sqrt(discriminant));
    roots.push(u + v + offset);

    const realPart = -(u + v) / 2 + offset;
    const imagPart = (Math.sqrt(3) / 2) * (u - v);

    if (Math.abs(imagPart) < 1e-14) {
      roots.push(realPart);
      roots.push(realPart);
    } else {
      roots.push(`${formatResult(realPart)} + ${formatResult(Math.abs(imagPart))}i`);
      roots.push(`${formatResult(realPart)} - ${formatResult(Math.abs(imagPart))}i`);
    }
  } else {
    const r = Math.sqrt(-p / 3);
    const acosArg = Math.max(-1, Math.min(1, -q / (2 * r * r * r)));
    const theta = Math.acos(acosArg);
    for (let k = 0; k < 3; k++) {
      roots.push(2 * r * Math.cos((theta + 2 * k * Math.PI) / 3) + offset);
    }
  }

  return roots;
}

/**
 * 四次方程求解（Durand-Kerner 数值法）
 * ax⁴ + bx³ + cx² + dx + e = 0
 */
function solveQuartic(a, b, c, d, e) {
  if (a === 0) {
    return solveCubic(b, c, d, e);
  }

  // 使用 Durand-Kerner 方法求全部根
  const coeffs = [a, b, c, d, e];
  const n = 4;

  // 初始化4个根（等角度分布在单位圆上）
  const roots = [];
  for (let k = 0; k < n; k++) {
    const angle = (2 * Math.PI * k) / n + 0.4; // 偏移避免对称性
    roots.push({
      re: 0.4 * Math.cos(angle),
      im: 0.4 * Math.sin(angle)
    });
  }

  const MAX_ITER = 500;
  const TOLERANCE = 1e-14;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    let maxDelta = 0;
    for (let i = 0; i < n; i++) {
      // 计算 P(roots[i])
      let pVal = { re: coeffs[0], im: 0 };
      for (let j = 1; j <= n; j++) {
        const temp = {
          re: pVal.re * roots[i].re - pVal.im * roots[i].im + coeffs[j],
          im: pVal.re * roots[i].im + pVal.im * roots[i].re
        };
        pVal = temp;
      }

      // 计算分母 Π(roots[i] - roots[j]) for j != i
      let denom = { re: 1, im: 0 };
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const diff = {
          re: roots[i].re - roots[j].re,
          im: roots[i].im - roots[j].im
        };
        const temp = {
          re: denom.re * diff.re - denom.im * diff.im,
          im: denom.re * diff.im + denom.im * diff.re
        };
        denom = temp;
      }

      // 除法: pVal / denom
      const denomMag2 = denom.re * denom.re + denom.im * denom.im;
      if (denomMag2 < 1e-30) continue;
      const delta = {
        re: (pVal.re * denom.re + pVal.im * denom.im) / denomMag2,
        im: (pVal.im * denom.re - pVal.re * denom.im) / denomMag2
      };

      roots[i].re -= delta.re;
      roots[i].im -= delta.im;
      const deltaMag = Math.sqrt(delta.re * delta.re + delta.im * delta.im);
      if (deltaMag > maxDelta) maxDelta = deltaMag;
    }

    if (maxDelta < TOLERANCE) break;
  }

  // 格式化结果
  const result = [];
  for (const root of roots) {
    const re = Math.abs(root.re) < 1e-12 ? 0 : root.re;
    const im = Math.abs(root.im) < 1e-12 ? 0 : root.im;

    if (Math.abs(im) < 1e-10) {
      result.push(parseFloat(re.toPrecision(12)));
    } else {
      const imSign = im >= 0 ? '+' : '-';
      result.push(`${formatResult(re)} ${imSign} ${formatResult(Math.abs(im))}i`);
    }
  }

  // 按实部排序
  return result.sort((x, y) => {
    const rx = typeof x === 'number' ? x : parseFloat(x);
    const ry = typeof y === 'number' ? y : parseFloat(y);
    return rx - ry;
  });
}

/**
 * 四元一次方程组求解
 */
function solveLinear4System(params) {
  const [a1, b1, c1, d1, e1, a2, b2, c2, d2, e2, a3, b3, c3, d3, e3, a4, b4, c4, d4, e4] = params;

  // 高斯消元法
  const A = [
    [a1, b1, c1, d1],
    [a2, b2, c2, d2],
    [a3, b3, c3, d3],
    [a4, b4, c4, d4]
  ];
  const B = [e1, e2, e3, e4];
  const n = 4;

  // 前向消元（部分主元选取）
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(A[row][col]) > Math.abs(A[maxRow][col])) {
        maxRow = row;
      }
    }
    [A[col], A[maxRow]] = [A[maxRow], A[col]];
    [B[col], B[maxRow]] = [B[maxRow], B[col]];

    if (Math.abs(A[col][col]) < 1e-14) {
      throw new Error('方程组无解或有无穷多解');
    }

    for (let row = col + 1; row < n; row++) {
      const factor = A[row][col] / A[col][col];
      for (let j = col; j < n; j++) {
        A[row][j] -= factor * A[col][j];
      }
      B[row] -= factor * B[col];
    }
  }

  // 回代
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let sum = B[i];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * x[j];
    }
    x[i] = sum / A[i][i];
  }

  return x;
}

/**
 * 提取表达式中的变量名
 */
function extractVariables(expr) {
  const varPattern = /\b[a-zA-Z_][a-zA-Z0-9_]*\b/g;
  const matches = expr.match(varPattern) || [];
  const exclude = new Set([
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'log',
    'ln',
    'sqrt',
    'exp',
    'abs',
    'pi',
    'e',
    'mean',
    'std',
    'variance',
    'sum',
    'min',
    'max',
    'floor',
    'ceil',
    'round',
    'dot',
    'cross',
    'norm',
    'mag',
    'to',
    'and',
    'or',
    'not',
    'mod',
    'deg',
    'rad',
    'grad',
    'bin',
    'oct',
    'hex',
    'dec',
    'nPr',
    'nCr',
    'rand',
    'sum',
    'prod',
    'diff',
    'integrate',
    'i',
    'I',
    'Infinity',
    'NaN',
    'ans'
  ]);
  const vars = [...new Set(matches)].filter(v => !exclude.has(v));
  return vars;
}

function simplifySqrt(n) {
  let a = 1,
    b = n;
  for (let i = 2; i * i <= b; i++) {
    while (b % (i * i) === 0) {
      a *= i;
      b /= i * i;
    }
  }
  return { a, b };
}

function gcdInt(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}
