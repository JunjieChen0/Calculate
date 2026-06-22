import { create, all } from 'mathjs';

const math = create(all, {
  number: 'number',
  precision: 64
});

let angleUnit = 'rad';
let ansValue = 0;
let precision = 12;
let displayFormat = 'norm'; // 'norm' | 'fix' | 'sci'
let fixDecimals = 4;
let currentBase = 10; // 10 | 2 | 8 | 16
let engineeringNotation = false;
let fractionMode = false;

// Variable storage (A-Z, 9 variables)
const variables = {};
const MAX_VARIABLES = 9;

// Custom function storage (f, g, h)
const customFunctions = {};

export function setAngleUnit(unit) {
  if (unit === 'deg' || unit === 'rad' || unit === 'grad') {
    angleUnit = unit;
  }
}

export function getAngleUnit() {
  return angleUnit;
}

export function setAns(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    ansValue = value;
  } else if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) {
      ansValue = num;
    }
  }
}

export function getAns() {
  return ansValue;
}

export function setPrecision(value) {
  precision = Math.max(0, Math.min(15, Math.floor(value)));
}

export function getPrecision() {
  return precision;
}

export function setDisplayFormat(format, decimals = 4) {
  if (format === 'norm' || format === 'fix' || format === 'sci') {
    displayFormat = format;
    fixDecimals = Math.max(0, Math.min(15, Math.floor(decimals)));
  }
}

export function getDisplayFormat() {
  return { format: displayFormat, decimals: fixDecimals };
}

export function setCurrentBase(base) {
  if ([2, 8, 10, 16].includes(base)) {
    currentBase = base;
  }
}

export function getCurrentBase() {
  return currentBase;
}

export function setEngineeringNotation(enabled) {
  engineeringNotation = !!enabled;
}

export function getEngineeringNotation() {
  return engineeringNotation;
}

export function setFractionMode(enabled) {
  fractionMode = !!enabled;
}

export function getFractionMode() {
  return fractionMode;
}

/**
 * Set a variable value
 */
export function setVariable(name, value) {
  if (typeof name !== 'string' || name.length !== 1 || !/[A-Z]/.test(name)) {
    throw new Error('变量名必须为A-Z的大写字母');
  }

  if (Object.keys(variables).length >= MAX_VARIABLES && !(name in variables)) {
    throw new Error(`最多只能存储${MAX_VARIABLES}个变量`);
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    variables[name] = value;
  } else if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) {
      variables[name] = num;
    } else {
      throw new Error('变量值必须为数字');
    }
  }
}

/**
 * Get a variable value
 */
export function getVariable(name) {
  if (typeof name !== 'string' || name.length !== 1 || !/[A-Z]/.test(name)) {
    throw new Error('变量名必须为A-Z的大写字母');
  }
  return variables[name] !== undefined ? variables[name] : 0;
}

/**
 * Get all variables
 */
export function getAllVariables() {
  return { ...variables };
}

/**
 * Clear a variable
 */
export function clearVariable(name) {
  if (typeof name === 'string' && name.length === 1 && /[A-Z]/.test(name)) {
    delete variables[name];
  }
}

/**
 * Clear all variables
 */
export function clearAllVariables() {
  Object.keys(variables).forEach(key => delete variables[key]);
}

export function resetAllState() {
  angleUnit = 'rad';
  ansValue = 0;
  precision = 12;
  displayFormat = 'norm';
  fixDecimals = 4;
  currentBase = 10;
  engineeringNotation = false;
  fractionMode = false;
}

/**
 * Set a custom function
 */
export function setCustomFunction(name, param, expr) {
  if (typeof name !== 'string' || !['f', 'g', 'h'].includes(name)) {
    throw new Error('函数名必须为f、g或h');
  }

  if (typeof param !== 'string' || param.length !== 1 || !/[a-z]/.test(param)) {
    throw new Error('参数名必须为小写字母');
  }

  if (typeof expr !== 'string' || expr.trim() === '') {
    throw new Error('函数表达式不能为空');
  }

  customFunctions[name] = { param, expr: expr.trim() };
}

/**
 * Get a custom function
 */
export function getCustomFunction(name) {
  if (typeof name !== 'string' || !['f', 'g', 'h'].includes(name)) {
    throw new Error('函数名必须为f、g或h');
  }
  return customFunctions[name] || null;
}

/**
 * Clear a custom function
 */
export function clearCustomFunction(name) {
  if (typeof name === 'string' && ['f', 'g', 'h'].includes(name)) {
    delete customFunctions[name];
  }
}

/**
 * Clear all custom functions
 */
export function clearAllCustomFunctions() {
  Object.keys(customFunctions).forEach(key => delete customFunctions[key]);
}

/**
 * Evaluate a custom function call
 */
function evaluateCustomFunction(name, argValue) {
  const func = customFunctions[name];
  if (!func) {
    throw new Error(`未定义函数 ${name}`);
  }

  const substituted = func.expr.replace(new RegExp(`\\b${func.param}\\b`, 'g'), `(${argValue})`);
  return math.evaluate(substituted);
}

/**
 * Safely evaluate a mathematical expression.
 * Returns { success: true, result: string } or { success: false, error: string }.
 */
export function evaluateExpression(expression, mode = 'standard') {
  if (!expression || expression.trim() === '') {
    return { success: true, result: '0' };
  }

  // Handle multiple statements separated by colon
  const statements = expression.split(':').map(s => s.trim()).filter(s => s.length > 0);
  if (statements.length > 1) {
    let lastResult = '0';
    for (const stmt of statements) {
      const result = evaluateExpression(stmt, mode);
      if (!result.success) {
        return result;
      }
      lastResult = result.result;
    }
    return { success: true, result: lastResult };
  }

  try {
    let expr = expression.trim();

    // Replace display symbols with mathjs-compatible ones
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // Handle deg suffix: "90deg" -> "90 deg" for unit conversion
    expr = expr.replace(/(\d)deg\b/g, '$1 deg');

    // Handle variable assignment: A=5, B=10, etc.
    const assignMatch = expr.match(/^([A-Z])\s*=\s*(.+)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const valueExpr = assignMatch[2].trim();
      const result = math.evaluate(valueExpr);
      setVariable(varName, result);
      return { success: true, result: `${varName} = ${formatResult(result)}` };
    }

    // Handle custom function definition: f(x)=x^2, g(t)=sin(t)+1, etc.
    const funcDefMatch = expr.match(/^([fgh])\(([a-z])\)\s*=\s*(.+)$/);
    if (funcDefMatch) {
      const funcName = funcDefMatch[1];
      const paramName = funcDefMatch[2];
      const funcExpr = funcDefMatch[3].trim();
      setCustomFunction(funcName, paramName, funcExpr);
      return { success: true, result: `${funcName}(${paramName}) = ${funcExpr}` };
    }

    // Replace ans variable with last answer
    expr = expr.replace(/\bans\b/g, `(${ansValue})`);

    // Replace custom function calls with their values
    expr = expr.replace(/\b([fgh])\(([^)]+)\)/g, (match, funcName, arg) => {
      try {
        const argValue = math.evaluate(arg);
        const result = evaluateCustomFunction(funcName, argValue);
        return `(${result})`;
      } catch {
        return match;
      }
    });

    // Replace variable references (A-Z) with their values
    expr = expr.replace(/\b([A-Z])\b/g, (match) => {
      const val = getVariable(match);
      return val !== undefined ? `(${val})` : match;
    });

    // Replace calculator-specific functions with mathjs-compatible names
    expr = expr.replace(/\bnPr\(/g, 'permutations(');
    expr = expr.replace(/\bnCr\(/g, 'combinations(');
    expr = expr.replace(/\brand\(\)/g, 'random()');

    // Handle special calculator functions
    const specialResult = handleSpecialFunctions(expr);
    if (specialResult !== null) {
      return { success: true, result: formatResult(specialResult) };
    }

    const commonScope = {
      permutations: math.permutations,
      combinations: math.combinations,
      random: math.random
    };

    let result;

    switch (mode) {
      case 'base':
        result = evaluateBaseExpression(expr);
        break;
      case 'vector':
        result = evaluateVectorExpression(expr);
        break;
      case 'complex':
        result = math.evaluate(applyAngleConversions(expr), commonScope);
        break;
      case 'matrix':
        result = math.evaluate(expr, commonScope);
        break;
      case 'solve':
        result = handleSolve(expr);
        break;
      case 'convert':
        result = handleConvert(expr);
        break;
      case 'stats':
        result = handleStats(expr, commonScope);
        break;
      case 'standard':
      default:
        result = math.evaluate(applyAngleConversions(expr), commonScope);
        break;
    }

    if (typeof result === 'number' && angleUnit !== 'rad') {
      result = convertInverseTrigOutput(expr, result);
    }

    const formatted = formatResult(result);
    return { success: true, result: formatted };
  } catch (error) {
    return { success: false, error: getFriendlyError(error) };
  }
}

function applyAngleConversions(expr) {
  if (angleUnit === 'rad') {
    return expr;
  }

  const trigFuncs = ['sin', 'cos', 'tan'];
  let result = expr;

  trigFuncs.forEach(func => {
    const funcRegex = new RegExp(`\\b${func}\\(`, 'g');
    let match;
    const replacements = [];

    while ((match = funcRegex.exec(result)) !== null) {
      const openIdx = match.index + match[0].length - 1;
      let depth = 1;
      let closeIdx = openIdx + 1;
      while (closeIdx < result.length && depth > 0) {
        if (result[closeIdx] === '(') depth++;
        else if (result[closeIdx] === ')') depth--;
        closeIdx++;
      }
      if (depth !== 0) continue;

      const arg = result.slice(openIdx + 1, closeIdx - 1).trim();
      if (/deg\b|grad\b|radian?\b|pi\b/.test(arg)) continue;

      let convertedArg;
      if (angleUnit === 'grad') {
        convertedArg = /[+\-*/]/.test(arg) ? `(${arg}) * pi / 200` : `${arg} * pi / 200`;
      } else {
        convertedArg = /[+\-*/]/.test(arg) ? `(${arg}) deg` : `${arg} deg`;
      }
      replacements.push({
        start: openIdx + 1,
        end: closeIdx - 1,
        replacement: convertedArg
      });
    }

    for (let i = replacements.length - 1; i >= 0; i--) {
      const r = replacements[i];
      result = result.slice(0, r.start) + r.replacement + result.slice(r.end);
    }
  });

  return result;
}

function convertInverseTrigOutput(expr, result) {
  const inverseTrigPattern = /\b(acos|asin|atan)\s*\(/;
  const match = expr.match(inverseTrigPattern);
  if (!match) {
    return result;
  }

  if (angleUnit === 'deg') {
    return (result * 180) / Math.PI;
  }
  if (angleUnit === 'grad') {
    return (result * 200) / Math.PI;
  }
  return result;
}

function handleSpecialFunctions(expr) {
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
    if (angleUnit === 'deg') {
      theta = (theta * 180) / Math.PI;
    } else if (angleUnit === 'grad') {
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
    if (angleUnit === 'deg') {
      theta = (theta * Math.PI) / 180;
    } else if (angleUnit === 'grad') {
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
    return numericalDerivative(funcExpr, variable, point);
  }

  // Integral: integrate(f(x), x, a, b) - numerical integration
  const integralMatch = expr.match(/integrate\s*\(\s*(.+?),\s*([a-zA-Z]),\s*([^,]+),\s*([^)]+)\s*\)/i);
  if (integralMatch) {
    const funcExpr = integralMatch[1].trim();
    const variable = integralMatch[2].trim();
    const lower = Number(integralMatch[3].trim());
    const upper = Number(integralMatch[4].trim());
    if (isNaN(lower) || isNaN(upper)) {
      throw new Error('积分上下限必须为数字');
    }
    return numericalIntegration(funcExpr, variable, lower, upper);
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
    return calculateSummation(funcExpr, variable, start, end);
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
    return calculateProduct(funcExpr, variable, start, end);
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
    if (xData.some(isNaN) || yData.some(isNaN) || xData.length !== yData.length || yData.some(y => y <= 0)) {
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
    if ([k, n, p].some(isNaN) || !Number.isInteger(k) || !Number.isInteger(n) || k < 0 || k > n || p < 0 || p > 1) {
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

  // Inequality solving: solveIneq(a, b, c, op) for quadratic inequalities
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

/**
 * Uniform distribution PDF
 */
function uniformPDF(x, a, b) {
  if (x < a || x > b) return 0;
  return parseFloat((1 / (b - a)).toPrecision(8));
}

/**
 * Uniform distribution CDF
 */
function uniformCDF(x, a, b) {
  if (x < a) return 0;
  if (x > b) return 1;
  return parseFloat(((x - a) / (b - a)).toPrecision(8));
}

/**
 * Exponential distribution PDF
 */
function exponentialPDF(x, lambda) {
  if (x < 0) return 0;
  return parseFloat((lambda * Math.exp(-lambda * x)).toPrecision(8));
}

/**
 * Exponential distribution CDF
 */
function exponentialCDF(x, lambda) {
  if (x < 0) return 0;
  return parseFloat((1 - Math.exp(-lambda * x)).toPrecision(8));
}

/**
 * Linear regression: y = ax + b
 */
function linearRegression(xData, yData) {
  const n = xData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

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

/**
 * Quadratic regression: y = ax² + bx + c
 */
function quadraticRegression(xData, yData) {
  const n = xData.length;
  let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
  let sumY = 0, sumXY = 0, sumX2Y = 0;

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

  // Solve 3x3 system using Cramer's rule
  const D = n * (sumX2 * sumX4 - sumX3 * sumX3) - sumX * (sumX * sumX4 - sumX2 * sumX3) + sumX2 * (sumX * sumX3 - sumX2 * sumX2);
  const Da = sumY * (sumX2 * sumX4 - sumX3 * sumX3) - sumX * (sumXY * sumX4 - sumX2Y * sumX3) + sumX2 * (sumXY * sumX3 - sumX2Y * sumX2);
  const Db = n * (sumXY * sumX4 - sumX2Y * sumX3) - sumY * (sumX * sumX4 - sumX2 * sumX3) + sumX2 * (sumX * sumX2Y - sumX2 * sumXY);
  const Dc = n * (sumX2 * sumX2Y - sumX3 * sumXY) - sumX * (sumX * sumX2Y - sumX2 * sumXY) + sumY * (sumX * sumX3 - sumX2 * sumX2);

  const a = Da / D;
  const b = Db / D;
  const c = Dc / D;

  return `y = ${parseFloat(a.toPrecision(6))}x² + ${parseFloat(b.toPrecision(6))}x + ${parseFloat(c.toPrecision(6))}`;
}

/**
 * Exponential regression: y = a * e^(bx)
 */
function exponentialRegression(xData, yData) {
  const n = xData.length;
  const lnY = yData.map(y => Math.log(y));

  let sumX = 0, sumLnY = 0, sumXLnY = 0, sumX2 = 0;

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

/**
 * Normal distribution CDF using approximation
 */
function normalCDF(x, mu, sigma) {
  const z = (x - mu) / sigma;
  // Abramowitz and Stegun approximation
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const absZ = Math.abs(z);
  const t = 1.0 / (1.0 + p * absZ);
  const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ / 2);
  const sign = z < 0 ? -1 : 1;
  const cdf = 0.5 * (1.0 + sign * erf);

  return parseFloat(cdf.toPrecision(8));
}

/**
 * Binomial PMF
 */
function binomialPMF(k, n, p) {
  const coeff = factorial(n) / (factorial(k) * factorial(n - k));
  return parseFloat((coeff * Math.pow(p, k) * Math.pow(1 - p, n - k)).toPrecision(8));
}

/**
 * Poisson PMF
 */
function poissonPMF(k, lambda) {
  return parseFloat((Math.pow(lambda, k) * Math.exp(-lambda) / factorial(k)).toPrecision(8));
}

/**
 * Factorial function
 */
function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Solve quadratic inequality: ax² + bx + c op 0
 */
function solveQuadraticInequality(a, b, c, op) {
  // Find roots
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // No real roots
    if (a > 0) {
      return (op === '>' || op === '>=') ? '所有实数' : '无解';
    } else {
      return (op === '>' || op === '>=') ? '无解' : '所有实数';
    }
  }

  const sqrtD = Math.sqrt(discriminant);
  let x1 = (-b - sqrtD) / (2 * a);
  let x2 = (-b + sqrtD) / (2 * a);

  if (x1 > x2) [x1, x2] = [x2, x1];

  const rootStr = discriminant === 0 ? `x = ${parseFloat(x1.toPrecision(6))}` : `x₁ = ${parseFloat(x1.toPrecision(6))}, x₂ = ${parseFloat(x2.toPrecision(6))}`;

  if (discriminant === 0) {
    // One root
    if (op === '>' || op === '<') {
      return a > 0 ? `x ≠ ${parseFloat(x1.toPrecision(6))}` : '无解';
    } else {
      return '所有实数';
    }
  }

  // Two roots
  if (op === '>') {
    return a > 0 ? `x < ${parseFloat(x1.toPrecision(6))} 或 x > ${parseFloat(x2.toPrecision(6))}` : `${parseFloat(x1.toPrecision(6))} < x < ${parseFloat(x2.toPrecision(6))}`;
  } else if (op === '>=') {
    return a > 0 ? `x ≤ ${parseFloat(x1.toPrecision(6))} 或 x ≥ ${parseFloat(x2.toPrecision(6))}` : `${parseFloat(x1.toPrecision(6))} ≤ x ≤ ${parseFloat(x2.toPrecision(6))}`;
  } else if (op === '<') {
    return a > 0 ? `${parseFloat(x1.toPrecision(6))} < x < ${parseFloat(x2.toPrecision(6))}` : `x < ${parseFloat(x1.toPrecision(6))} 或 x > ${parseFloat(x2.toPrecision(6))}`;
  } else if (op === '<=') {
    return a > 0 ? `${parseFloat(x1.toPrecision(6))} ≤ x ≤ ${parseFloat(x2.toPrecision(6))}` : `x ≤ ${parseFloat(x1.toPrecision(6))} 或 x ≥ ${parseFloat(x2.toPrecision(6))}`;
  }

  return rootStr;
}

/**
 * Decimal to DMS conversion
 */
function decimalToDMS(decimal) {
  const d = Math.floor(decimal);
  const mFloat = (decimal - d) * 60;
  const m = Math.floor(mFloat);
  const s = (mFloat - m) * 60;

  return `${d}°${m}'${parseFloat(s.toPrecision(4))}"`;
}

/**
 * DMS to decimal conversion
 */
function dmsToDecimal(d, m, s) {
  return parseFloat((d + m / 60 + s / 3600).toPrecision(10));
}

/**
 * Numerical derivative using central difference method
 */
function numericalDerivative(funcExpr, variable, point) {
  const h = 1e-8;
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
 * Numerical integration using Simpson's 1/3 rule
 */
function numericalIntegration(funcExpr, variable, lower, upper) {
  const n = 1000; // number of intervals (must be even)
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
 * Calculate summation: Σf(i) for i from start to end
 */
function calculateSummation(funcExpr, variable, start, end) {
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
 * Calculate product: Πf(i) for i from start to end
 */
function calculateProduct(funcExpr, variable, start, end) {
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

/**
 * Greatest Common Divisor using Euclidean algorithm
 */
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

/**
 * Least Common Multiple
 */
function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

/**
 * Prime factorization
 */
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

function getAngleUnitSuffix() {
  switch (angleUnit) {
    case 'deg':
      return '°';
    case 'grad':
      return 'g';
    default:
      return ' rad';
  }
}

function evaluateBaseExpression(expr) {
  // In base mode, only support integer arithmetic and base conversion
  // Operators: +, -, *, /, %, ^ (limited)
  // Also support base conversion functions: bin(), oct(), hex(), dec()

  // First check for conversion: "bin(1010)", "hex(FF)"
  const conversionMatch = expr.match(/^(bin|oct|hex|dec)\((.+)\)$/i);
  if (conversionMatch) {
    const [, func, arg] = conversionMatch;
    const trimmedArg = arg.trim();
    let value;

    // Auto-detect prefix
    if (trimmedArg.toLowerCase().startsWith('0b')) {
      value = parseInt(trimmedArg.slice(2), 2);
    } else if (trimmedArg.toLowerCase().startsWith('0o')) {
      value = parseInt(trimmedArg.slice(2), 8);
    } else if (trimmedArg.toLowerCase().startsWith('0x')) {
      value = parseInt(trimmedArg.slice(2), 16);
    } else {
      value = parseInt(trimmedArg, currentBase);
    }

    if (isNaN(value)) {
      throw new Error('无效的进制数值');
    }
    return formatBaseResult(value, func.toLowerCase());
  }

  // Evaluate arithmetic in current base
  // Replace hex letters with placeholders? No, just evaluate as math expression
  // But mathjs doesn't understand hex. So we need to parse manually.
  // For simplicity, convert operands to decimal, evaluate, then convert back.
  return evaluateBaseArithmetic(expr);
}

function evaluateBaseArithmetic(expr) {
  // Tokenize: numbers, operators, parentheses
  // Supported operators: + - * / % ^ & | ~ ^^ << >> ( )
  const tokenPattern = /([0-9A-Fa-f]+)|(\*\*|<<|>>|\|\||&&|\^\^|[+\-*/%^&|~()])/gi;
  const tokens = [];
  let match;

  while ((match = tokenPattern.exec(expr)) !== null) {
    if (match[1]) {
      const value = parseInt(match[1], currentBase);
      if (isNaN(value)) {
        const invalidChars = match[1].split('').filter(ch => {
          const digit = parseInt(ch, currentBase);
          return isNaN(digit);
        });
        const hint = invalidChars.length > 0 ? ` '${invalidChars[0]}'` : '';
        throw new Error(`数字${hint}不是有效的${currentBase}进制数`);
      }
      tokens.push(value);
    } else if (match[2]) {
      let op = match[2];
      // Map calculator symbols to JS bitwise operators
      if (op.toLowerCase() === 'and' || op === '&') op = '&';
      if (op.toLowerCase() === 'or' || op === '|') op = '|';
      if (op.toLowerCase() === 'xor' || op === '^^') op = '##XOR##';
      if (op.toLowerCase() === 'not' || op === '~') op = '~';
      tokens.push(op);
    }
  }

  if (tokens.length === 0) {
    return 0;
  }

  // Safe evaluation without using Function constructor
  const result = evaluateIntegerExpression(tokens);
  if (!Number.isFinite(result) || !Number.isInteger(result)) {
    throw new Error('进制模式只支持整数运算');
  }
  return formatBaseResult(result, currentBase);
}

function evaluateIntegerExpression(tokens) {
  const safeOperators = new Set([
    '+',
    '-',
    '*',
    '/',
    '%',
    '**',
    '&',
    '|',
    '^',
    '##XOR##',
    '~',
    '<<',
    '>>',
    '(',
    ')'
  ]);

  for (const token of tokens) {
    if (typeof token === 'number') {
      continue;
    }
    if (!safeOperators.has(token)) {
      throw new Error('进制表达式包含不支持的运算符');
    }
  }

  let index = 0;

  function peek() {
    return tokens[index];
  }

  function consume() {
    return tokens[index++];
  }

  function parseExpression() {
    return parseOr();
  }

  function parseOr() {
    let left = parseXor();
    while (peek() === '|') {
      consume();
      left = left | parseXor();
    }
    return left;
  }

  function parseXor() {
    let left = parseAnd();
    while (peek() === '^' || peek() === '##XOR##') {
      consume();
      left = left ^ parseAnd();
    }
    return left;
  }

  function parseAnd() {
    let left = parseShift();
    while (peek() === '&') {
      consume();
      left = left & parseShift();
    }
    return left;
  }

  function parseShift() {
    let left = parseAdd();
    while (peek() === '<<' || peek() === '>>') {
      const op = consume();
      const right = parseAdd();
      left = op === '<<' ? left << right : left >> right;
    }
    return left;
  }

  function parseAdd() {
    let left = parseMul();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const right = parseMul();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  function parseMul() {
    let left = parsePower();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = consume();
      const right = parsePower();
      if (op === '*') {
        left = left * right;
      } else if (op === '/') {
        left = Math.trunc(left / right);
      } else {
        left = left % right;
      }
    }
    return left;
  }

  function parsePower() {
    const left = parseUnary();
    if (peek() === '**') {
      consume();
      const right = parsePower();
      return left ** right;
    }
    return left;
  }

  function parseUnary() {
    const token = peek();
    if (token === '-') {
      consume();
      return -parseUnary();
    }
    if (token === '~') {
      consume();
      return ~parseUnary();
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const token = peek();
    if (typeof token === 'number') {
      return consume();
    }
    if (token === '(') {
      consume();
      const value = parseExpression();
      if (peek() !== ')') {
        throw new Error('括号不匹配');
      }
      consume();
      return value;
    }
    throw new Error('进制表达式错误');
  }

  const result = parseExpression();
  if (index !== tokens.length) {
    throw new Error('进制表达式错误');
  }
  return result;
}

function formatBaseResult(value, base) {
  const sign = value < 0 ? '-' : '';
  switch (base) {
    case 2:
    case 'bin':
      return `${sign}0b${Math.abs(value).toString(2).toUpperCase()}`;
    case 8:
    case 'oct':
      return `${sign}0o${Math.abs(value).toString(8).toUpperCase()}`;
    case 16:
    case 'hex':
      return `${sign}0x${Math.abs(value).toString(16).toUpperCase()}`;
    case 10:
    case 'dec':
    default:
      return String(value);
  }
}

function evaluateVectorExpression(expr) {
  // Support vector operations: dot product, cross product, magnitude
  // Examples:
  // dot([1,2,3],[4,5,6])
  // cross([1,2,3],[4,5,6])
  // norm([1,2,3])
  // [1,2,3] + [4,5,6]

  const processed = expr
    .replace(/\bdot\(/g, 'dot(')
    .replace(/\bcross\(/g, 'cross(')
    .replace(/\bnorm\(/g, 'norm(')
    .replace(/\bmag\(/g, 'norm(')
    .replace(/\bunit\(/g, 'unit(')
    .replace(/\bproj\(/g, 'proj(');

  return math.evaluate(processed, {
    dot: math.dot,
    cross: math.cross,
    norm: math.norm,
    unit: v => math.divide(v, math.norm(v)),
    proj: (a, b) => math.multiply(b, math.dot(a, b) / math.dot(b, b))
  });
}

function handleSolve(expr) {
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

  // Check for special equation forms
  const specialResult = solveSpecialEquation(expr);
  if (specialResult !== null) {
    return specialResult;
  }

  return math.evaluate(expr);
}

function solveNumerically(equationExpr, variable) {
  const evalAt = val => {
    const substituted = equationExpr.replace(new RegExp(`\\b${variable}\\b`, 'g'), `(${val})`);
    const result = math.evaluate(substituted);
    return typeof result === 'number' ? result : Number(result);
  };

  const f0 = evalAt(0);
  if (Math.abs(f0) < 1e-12) {
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

    if (Math.abs(fa) < 1e-12) {
      if (!roots.some(r => Math.abs(r - a) < 1e-8)) {
        roots.push(parseFloat(a.toPrecision(12)));
      }
      continue;
    }

    if (fa * fb < 0) {
      let lo = a;
      let hi = b;
      for (let iter = 0; iter < 100; iter++) {
        const mid = (lo + hi) / 2;
        let fmid;
        try {
          fmid = evalAt(mid);
        } catch {
          break;
        }
        if (!Number.isFinite(fmid)) break;
        if (Math.abs(fmid) < 1e-12) {
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
      if (!roots.some(r => Math.abs(r - root) < 1e-8)) {
        roots.push(root);
      }
    }
  }

  if (roots.length === 0) {
    throw new Error('在搜索范围内未找到方程的解');
  }

  return roots.sort((a, b) => a - b);
}

function solveSpecialEquation(expr) {
  // Quadratic equation: solve2(a,b,c) => ax^2 + bx + c = 0
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
        if (c === 0) {
          throw new Error('方程有无穷多解');
        }
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

  // Cubic equation: solve3(a,b,c,d) => ax^3 + bx^2 + cx + d = 0
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

  // Linear system 2x2: solveLinear2(a1,b1,c1,a2,b2,c2) => a1*x + b1*y = c1, a2*x + b2*y = c2
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

function solveCubic(a, b, c, d) {
  if (a === 0) {
    if (b === 0) {
      if (c === 0) {
        if (d === 0) {
          throw new Error('方程有无穷多解');
        }
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

    // Other two roots (possibly equal)
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

function handleConvert(expr) {
  if (!expr.toLowerCase().includes(' to ')) {
    throw new Error('格式应为：100 cm to m');
  }
  return math.evaluate(expr);
}

function handleStats(expr, scope = {}) {
  return math.evaluate(expr, scope);
}

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

function formatResult(result) {
  if (result === undefined || result === null) {
    return '0';
  }

  if (typeof result === 'number') {
    if (Number.isNaN(result)) {
      return 'NaN';
    }
    if (!Number.isFinite(result)) {
      return result > 0 ? '∞' : '-∞';
    }

    const value = result;

    // Fraction mode: try to convert to fraction
    if (fractionMode && Number.isFinite(value) && !Number.isInteger(value)) {
      const fraction = toFractionString(value);
      if (fraction) {
        return fraction;
      }
    }

    switch (displayFormat) {
      case 'fix':
        return value.toFixed(fixDecimals);
      case 'sci':
        return value.toExponential(fixDecimals);
      case 'norm':
      default: {
        const normalValue = parseFloat(value.toPrecision(precision));
        if (engineeringNotation) {
          return formatEngineering(normalValue);
        }
        return String(normalValue);
      }
    }
  }

  if (result instanceof math.Complex) {
    if (Math.abs(result.im) < 1e-14) {
      return formatResult(result.re);
    }
    if (Math.abs(result.re) < 1e-14) {
      return `${formatResult(result.im)}i`;
    }
    const sign = result.im >= 0 ? ' + ' : ' - ';
    return `${formatResult(result.re)}${sign}${formatResult(Math.abs(result.im))}i`;
  }

  if (result instanceof math.Matrix || Array.isArray(result)) {
    const data = result instanceof math.Matrix ? result.toArray() : result;
    return matrixToString(data);
  }

  if (result && result.units && result.value !== undefined) {
    return `${formatResult(result.toNumber())} ${result.formatUnits ? result.formatUnits() : ''}`.trim();
  }

  if (typeof result === 'object' && result.value !== undefined && result.unit) {
    return `${formatResult(result.value)} ${result.unit}`;
  }

  if (typeof result === 'object') {
    // Linear system result {x, y}
    return Object.entries(result)
      .map(([k, v]) => `${k}=${formatResult(v)}`)
      .join(', ');
  }

  return String(result);
}

function toFractionString(value) {
  try {
    const tolerance = 1.0e-10;
    const maxIterations = 100;
    let h1 = 1;
    let h2 = 0;
    let k1 = 0;
    let k2 = 1;
    let b = value;
    let iterations = 0;

    do {
      if (++iterations > maxIterations) {
        return null;
      }
      const a = Math.floor(b);
      let aux = h1;
      h1 = a * h1 + h2;
      h2 = aux;
      aux = k1;
      k1 = a * k1 + k2;
      k2 = aux;
      const remainder = b - a;
      if (Math.abs(remainder) < 1e-15) break;
      b = 1 / remainder;
    } while (Math.abs(value - h1 / k1) > Math.abs(value) * tolerance);

    if (k1 === 0 || k1 === 1) {
      return String(h1);
    }
    return `${h1}/${k1}`;
  } catch {
    return null;
  }
}

function formatEngineering(value) {
  if (value === 0) {
    return '0';
  }

  const sign = value < 0 ? '-' : '';
  const absValue = Math.abs(value);
  const exponent = Math.floor(Math.log10(absValue));
  const engineeringExponent = Math.floor(exponent / 3) * 3;
  const mantissa = absValue / Math.pow(10, engineeringExponent);

  const prefixes = {
    '-24': 'y',
    '-21': 'z',
    '-18': 'a',
    '-15': 'f',
    '-12': 'p',
    '-9': 'n',
    '-6': 'μ',
    '-3': 'm',
    0: '',
    3: 'k',
    6: 'M',
    9: 'G',
    12: 'T',
    15: 'P',
    18: 'E',
    21: 'Z',
    24: 'Y'
  };

  const prefix = prefixes[String(engineeringExponent)];
  if (prefix === undefined) {
    return `${sign}${absValue.toExponential(3)}`;
  }

  const formattedMantissa = parseFloat(mantissa.toPrecision(precision)).toString();
  return `${sign}${formattedMantissa}${prefix}`;
}

function matrixToString(matrix) {
  if (!Array.isArray(matrix)) {
    return String(matrix);
  }
  if (matrix.length === 0) {
    return '[]';
  }
  if (!Array.isArray(matrix[0])) {
    return '[' + matrix.map(formatResult).join(', ') + ']';
  }
  return '[ ' + matrix.map(row => '[' + row.map(formatResult).join(', ') + ']').join(', ') + ' ]';
}

function getFriendlyError(error) {
  const message = error && error.message ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('undefined symbol')) {
    return '未知符号，请检查输入';
  }
  if (lowerMessage.includes('unexpected end of expression')) {
    return '表达式不完整';
  }
  if (lowerMessage.includes('parenthesis') && lowerMessage.includes('unexpected')) {
    return '括号不匹配';
  }
  if (lowerMessage.includes('unit')) {
    return '单位错误，请检查单位换算格式';
  }
  if (lowerMessage.includes('complex number')) {
    return '复数运算错误';
  }
  if (lowerMessage.includes('matrix') || lowerMessage.includes('dimension mismatch')) {
    return '矩阵运算错误，请检查维度';
  }
  if (lowerMessage.includes('no valid full parametric solution')) {
    return '方程求解失败，请检查表达式';
  }
  if (lowerMessage.includes('division by zero') || lowerMessage.includes('divide by zero')) {
    return '除零错误';
  }
  if (lowerMessage.includes('unexpected type')) {
    return '参数类型错误，请检查输入';
  }
  if (lowerMessage.includes('string value expected')) {
    return '字符串值预期，请检查输入格式';
  }
  if (lowerMessage.includes('is not a function')) {
    return '函数调用错误，请检查输入';
  }
  if (lowerMessage.includes('cannot convert')) {
    return '数值转换错误，请检查输入';
  }
  if (lowerMessage.includes('syntax error')) {
    return '语法错误，请检查表达式格式';
  }
  return '计算错误，请检查输入';
}

export function generateTable(expression, start, end, step) {
  if (!expression || expression.trim() === '') {
    throw new Error('函数表达式不能为空');
  }

  const s = Number(start);
  const e = Number(end);
  const st = Number(step);

  if ([s, e, st].some(isNaN) || st === 0) {
    throw new Error('表格参数无效');
  }

  if (Math.abs(e - s) / Math.abs(st) > 1000) {
    throw new Error('表格数据点过多，请增大步长');
  }

  const table = [];
  const ascending = st > 0;
  const steps = Math.round((e - s) / st);

  for (let i = 0; i <= steps; i++) {
    const x = parseFloat((s + i * st).toPrecision(15));
    if (
      (ascending && x > e + Math.abs(st) * 0.001) ||
      (!ascending && x < e - Math.abs(st) * 0.001)
    ) {
      break;
    }
    const expr = expression.replace(/\bx\b/g, `(${x})`).replace(/(\d)\(/g, '$1*(');
    let y;
    try {
      const result = evaluateExpression(expr, 'standard');
      y = result.success ? result.result : 'Error';
    } catch {
      y = 'Error';
    }
    table.push({ x, y });
  }

  return table;
}

export { math };
