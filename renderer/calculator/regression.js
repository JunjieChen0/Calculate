/**
 * 回归分析模块
 * 线性/二次/指数/幂/对数/逻辑回归
 */

export function linearRegression(xData, yData) {
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
export function quadraticRegression(xData, yData) {
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
export function exponentialRegression(xData, yData) {
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
export function powerRegression(xData, yData) {
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
export function logarithmicRegression(xData, yData) {
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
export function logisticRegression(xData, yData) {
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
