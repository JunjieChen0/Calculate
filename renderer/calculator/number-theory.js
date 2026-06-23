/**
 * 数论模块
 * GCD/LCM/因式分解/不等式求解/DMS 转换
 */

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}
export function lcm(a, b) {
  return (a * b) / gcd(a, b);
}
export function factorize(n) {
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
export function solveQuadraticInequality(a, b, c, op) {
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
export function solveGeneralInequality(coeffs, op) {
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
export function evalPoly(coeffs, x) {
  let val = 0;
  const n = coeffs.length - 1;
  for (let i = 0; i <= n; i++) {
    val += coeffs[i] * Math.pow(x, n - i);
  }
  return val;
}
export function evalIneq(polyPositive, op) {
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
export function checkBoundary(coeffs, root, op) {
  const val = evalPoly(coeffs, root);
  const isZero = Math.abs(val) < 1e-10;
  if (isZero) {
    return op === '>=' || op === '<=';
  }
  return false;
}
export function findPolynomialRoots(coeffs) {
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
export function evalPolyDeriv(coeffs, x) {
  let val = 0;
  const n = coeffs.length - 1;
  for (let i = 0; i < n; i++) {
    val += coeffs[i] * (n - i) * Math.pow(x, n - i - 1);
  }
  return val;
}
export function findRationalRoots(coeffs) {
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
export function deflate(coeffs, root) {
  const n = coeffs.length - 1;
  const result = [coeffs[0]];
  for (let i = 1; i < n; i++) {
    result.push(coeffs[i] + result[i - 1] * root);
  }
  return result;
}
export function formatLinearIneq(root, positiveSlope, op) {
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
export function fmt(val) {
  return parseFloat(val.toPrecision(6));
}
export function decimalToDMS(decimal) {
  const d = Math.floor(decimal);
  const mFloat = (decimal - d) * 60;
  const m = Math.floor(mFloat);
  const s = (mFloat - m) * 60;

  return `${d}°${m}'${parseFloat(s.toPrecision(4))}"`;
}
export function dmsToDecimal(d, m, s) {
  return parseFloat((d + m / 60 + s / 3600).toPrecision(10));
}
