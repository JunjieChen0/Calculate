import { math } from './math-instance.js';
/**
 * 微积分模块
 * 数值导数、数值积分、求和、求积
 */
import { NUMERICAL_DERIVATIVE_STEP, SIMPSON_INTERVALS } from '../shared/constants.js';
import { applyAngleConversions } from './angle-utils.js';


/**
 * 数值导数（中心差分法）
 */
export function numericalDerivative(funcExpr, variable, point) {
  const h = NUMERICAL_DERIVATIVE_STEP;
  const evalAt = val => {
    const substituted = funcExpr.replace(new RegExp(`\\b${variable}\\b`, 'g'), `(${val})`);
    const result = math.evaluate(applyAngleConversions(substituted));
    return typeof result === 'number' ? result : Number(result);
  };

  const fPlus = evalAt(point + h);
  const fMinus = evalAt(point - h);

  if (!Number.isFinite(fPlus) || !Number.isFinite(fMinus)) {
    throw new Error('函数在该点不可导');
  }

  const derivative = (fPlus - fMinus) / (2 * h);
  return parseFloat(derivative.toPrecision(12));
}

/**
 * 数值积分（Simpson 1/3 法则）
 */
export function numericalIntegration(funcExpr, variable, lower, upper) {
  const n = SIMPSON_INTERVALS;
  const h = (upper - lower) / n;

  const evalAt = val => {
    const substituted = funcExpr.replace(new RegExp(`\\b${variable}\\b`, 'g'), `(${val})`);
    const result = math.evaluate(applyAngleConversions(substituted));
    return typeof result === 'number' ? result : Number(result);
  };

  let sum = evalAt(lower) + evalAt(upper);

  for (let i = 1; i < n; i++) {
    const x = lower + i * h;
    const fx = evalAt(x);
    sum += (i % 2 === 0 ? 2 : 4) * fx;
  }

  const integral = (h / 3) * sum;
  return parseFloat(integral.toPrecision(12));
}

/**
 * 求和：Σf(i) for i from start to end
 */
export function calculateSummation(funcExpr, variable, start, end) {
  let sum = 0;
  const evalAt = val => {
    const substituted = funcExpr.replace(new RegExp(`\\b${variable}\\b`, 'g'), `(${val})`);
    const result = math.evaluate(applyAngleConversions(substituted));
    return typeof result === 'number' ? result : Number(result);
  };

  for (let i = start; i <= end; i++) {
    sum += evalAt(i);
  }

  return parseFloat(sum.toPrecision(12));
}

/**
 * 求积：Πf(i) for i from start to end
 */
export function calculateProduct(funcExpr, variable, start, end) {
  let product = 1;
  const evalAt = val => {
    const substituted = funcExpr.replace(new RegExp(`\\b${variable}\\b`, 'g'), `(${val})`);
    const result = math.evaluate(applyAngleConversions(substituted));
    return typeof result === 'number' ? result : Number(result);
  };

  for (let i = start; i <= end; i++) {
    product *= evalAt(i);
  }

  return parseFloat(product.toPrecision(12));
}
