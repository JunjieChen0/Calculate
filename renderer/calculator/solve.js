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
      const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      return [x1, x2];
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
