/**
 * 概率分布模块
 * 均匀/指数/正态/二项/Poisson/几何/χ²/t/F 分布
 * 以及 gamma/beta 正则化函数
 */
import { REGULARIZED_SERIES_TERMS } from '../shared/constants.js';

export function uniformPDF(x, a, b) {
  if (x < a || x > b) return 0;
  return parseFloat((1 / (b - a)).toPrecision(8));
}
export function uniformCDF(x, a, b) {
  if (x < a) return 0;
  if (x > b) return 1;
  return parseFloat(((x - a) / (b - a)).toPrecision(8));
}
export function exponentialPDF(x, lambda) {
  if (x < 0) return 0;
  return parseFloat((lambda * Math.exp(-lambda * x)).toPrecision(8));
}
export function exponentialCDF(x, lambda) {
  if (x < 0) return 0;
  return parseFloat((1 - Math.exp(-lambda * x)).toPrecision(8));
}
export function normalCDF(x, mu, sigma) {
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
export function binomialPMF(k, n, p) {
  const coeff = factorial(n) / (factorial(k) * factorial(n - k));
  return parseFloat((coeff * Math.pow(p, k) * Math.pow(1 - p, n - k)).toPrecision(8));
}
export function poissonPMF(k, lambda) {
  return parseFloat(((Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k)).toPrecision(8));
}
export function binomialCDF(k, n, p) {
  let sum = 0;
  for (let i = 0; i <= k; i++) {
    sum += binomialPMF(i, n, p);
  }
  return parseFloat(Math.min(1, sum).toPrecision(8));
}
export function poissonCDF(k, lambda) {
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
export function invNormalCDF(p, mu, sigma) {
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

export function factorial(n) {
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
export function chiSquaredCDF(x, df) {
  return regularizedGamma(df / 2, x / 2);
}
export function tDistributionCDF(t, df) {
  const x = df / (df + t * t);
  const ibeta = regularizedBeta(df / 2, 0.5, x);
  if (t >= 0) return 1 - 0.5 * ibeta;
  return 0.5 * ibeta;
}
export function fDistributionCDF(x, df1, df2) {
  const a = df1 / 2;
  const b = df2 / 2;
  const z = (df1 * x) / (df1 * x + df2);
  return regularizedBeta(a, b, z);
}
export function regularizedGamma(a, x) {
  if (x < 0) return 0;
  if (x === 0) return 0;
  const n = REGULARIZED_SERIES_TERMS;
  let sum = 0;
  let term = 1 / a;
  for (let i = 0; i < n; i++) {
    sum += term;
    term *= x / (a + i + 1);
    if (Math.abs(term) < 1e-15) break;
  }
  return Math.min(1, (Math.pow(x, a) * Math.exp(-x) * sum) / gamma(a));
}
export function regularizedBeta(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const n = REGULARIZED_SERIES_TERMS;
  let sum = 0;
  let term = 1;
  for (let i = 0; i < n; i++) {
    sum += term;
    term *= (((a + i) * x) / (i + 1)) * (1 - x);
    if (Math.abs(term) < 1e-15) break;
  }
  const bt = Math.pow(x, a) * Math.pow(1 - x, b);
  return Math.min(1, (bt * sum) / (a * beta(a, b)));
}
export function beta(a, b) {
  return (gamma(a) * gamma(b)) / gamma(a + b);
}
export function gamma(z) {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
