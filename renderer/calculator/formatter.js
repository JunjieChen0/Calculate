/**
 * 结果格式化模块
 * 处理数值格式化、工程符号、分数转换、矩阵字符串化、错误消息友好化
 */
import { create, all } from 'mathjs';
import {
  _getPrecision as getPrecision,
  _getDisplayFormat as getDisplayFormat,
  _getFixDecimals as getFixDecimals,
  _getEngineeringNotation as getEngineeringNotation,
  _getFractionMode as getFractionMode,
  _getExactMode as getExactMode,
  _getFractionType as getFractionType,
  _getThousandSeparator as getThousandSeparator,
  _getDecimalSeparator as getDecimalSeparator,
  _getLanguage as getLanguage
} from './state.js';

const math = create(all, { number: 'number', precision: 64 });

/**
 * 格式化计算结果
 */
export function formatResult(result) {
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

    if (getFractionMode() && Number.isFinite(value) && !Number.isInteger(value)) {
      const fraction = toFractionString(value);
      if (fraction) {
        if (getFractionType() === 'mixed') {
          // 转换假分数为带分数: "5/3" → "1 2/3"
          const parts = fraction.split('/');
          if (parts.length === 2) {
            const num = Number(parts[0]);
            const den = Number(parts[1]);
            if (!isNaN(num) && !isNaN(den) && den !== 0) {
              const mixed = toMixedFraction(num, den);
              if (mixed) return mixed;
            }
          }
        }
        return fraction;
      }
    }

    if (getExactMode() && Number.isFinite(value) && !Number.isInteger(value)) {
      const exact = toExactForm(value);
      if (exact) {
        return exact;
      }
    }

    switch (getDisplayFormat()) {
      case 'fix':
        return applySep(value.toFixed(getFixDecimals()));
      case 'sci':
        return applySep(value.toExponential(getFixDecimals()));
      case 'norm1': {
        const abs = Math.abs(value);
        if (abs !== 0 && (abs < 1e-2 || abs >= 1e10)) {
          return applySep(value.toExponential(getFixDecimals()));
        }
        const normalValue = parseFloat(value.toPrecision(getPrecision()));
        if (getEngineeringNotation()) {
          return applySep(formatEngineering(normalValue));
        }
        return applySep(String(normalValue));
      }
      case 'norm2': {
        const abs = Math.abs(value);
        if (abs !== 0 && (abs < 1e-9 || abs >= 1e10)) {
          return applySep(value.toExponential(getFixDecimals()));
        }
        const normalValue = parseFloat(value.toPrecision(getPrecision()));
        if (getEngineeringNotation()) {
          return applySep(formatEngineering(normalValue));
        }
        return applySep(String(normalValue));
      }
      default: {
        const normalValue = parseFloat(value.toPrecision(getPrecision()));
        if (getEngineeringNotation()) {
          return applySep(formatEngineering(normalValue));
        }
        return applySep(String(normalValue));
      }
    }
  }

  // 非数字类型直接返回
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
    return Object.entries(result)
      .map(([k, v]) => `${k}=${formatResult(v)}`)
      .join(', ');
  }

  return String(result);
}

/**
 * 分数转换
 */
export function toFractionString(value) {
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

/**
 * 将假分数转换为带分数字符串
 * @param {number} numerator 分子
 * @param {number} denominator 分母
 * @returns {string} 带分数格式如 "1 2/3"
 */
export function toMixedFraction(numerator, denominator) {
  if (denominator === 0) return null;
  const sign = numerator < 0 !== denominator < 0 ? '-' : '';
  const absNum = Math.abs(numerator);
  const absDen = Math.abs(denominator);
  const whole = Math.floor(absNum / absDen);
  const remainder = absNum % absDen;
  if (remainder === 0) {
    return `${sign}${whole}`;
  }
  if (whole === 0) {
    return `${sign}${remainder}/${absDen}`;
  }
  return `${sign}${whole} ${remainder}/${absDen}`;
}

/**
 * 工程符号格式化
 */
export function formatEngineering(value) {
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

  const formattedMantissa = parseFloat(mantissa.toPrecision(getPrecision())).toString();
  return `${sign}${formattedMantissa}${prefix}`;
}

/**
 * 矩阵转字符串
 */
export function matrixToString(matrix) {
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

/**
 * 在数字字符串中插入千分位逗号
 */
export function applyThousandSeparator(str) {
  if (!str || typeof str !== 'string') return str;
  // 不处理科学计数法、NaN、∞
  if (str.includes('e') || str.includes('E') || str.includes('NaN') || str.includes('∞')) {
    return str;
  }
  const parts = str.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

function applySep(str) {
  let result = str;
  if (getThousandSeparator()) {
    result = applyThousandSeparator(result);
  }
  if (getDecimalSeparator() === ',') {
    // 欧洲格式: 小数点→逗号，千分位逗号→句点
    if (getThousandSeparator()) {
      result = result.replace(/,/g, '#TMP#').replace(/\./g, ',').replace(/#TMP#/g, '.');
    } else {
      result = result.replace(/\./g, ',');
    }
  }
  return result;
}

function t(zhKey, enKey) {
  return getLanguage() === 'en' ? enKey : zhKey;
}

/**
 * 友好错误消息
 */
export function getFriendlyError(error) {
  const message = error && error.message ? error.message : String(error);
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('undefined symbol')) {
    return t('未知符号，请检查输入', 'Unknown symbol, check input');
  }
  if (lowerMessage.includes('unexpected end of expression')) {
    return t('表达式不完整', 'Incomplete expression');
  }
  if (lowerMessage.includes('parenthesis') && lowerMessage.includes('unexpected')) {
    return t('括号不匹配', 'Mismatched parentheses');
  }
  if (lowerMessage.includes('unit')) {
    return t('单位错误，请检查单位换算格式', 'Unit error, check conversion format');
  }
  if (lowerMessage.includes('complex number')) {
    return t('复数运算错误', 'Complex number error');
  }
  if (lowerMessage.includes('matrix') || lowerMessage.includes('dimension mismatch')) {
    return t('矩阵运算错误，请检查维度', 'Matrix error, check dimensions');
  }
  if (lowerMessage.includes('no valid full parametric solution')) {
    return t('方程求解失败，请检查表达式', 'Equation solving failed');
  }
  if (lowerMessage.includes('division by zero') || lowerMessage.includes('divide by zero')) {
    return t('除零错误', 'Division by zero');
  }
  if (lowerMessage.includes('unexpected type')) {
    return t('参数类型错误，请检查输入', 'Parameter type error, check input');
  }
  if (lowerMessage.includes('string value expected')) {
    return t('字符串值预期，请检查输入格式', 'String value expected, check format');
  }
  if (lowerMessage.includes('is not a function')) {
    return t('函数调用错误，请检查输入', 'Function call error, check input');
  }
  if (lowerMessage.includes('cannot convert')) {
    return t('数值转换错误，请检查输入', 'Value conversion error, check input');
  }
  if (lowerMessage.includes('syntax error')) {
    return t('语法错误，请检查表达式格式', 'Syntax error, check expression');
  }
  return t('计算错误，请检查输入', 'Calculation error, check input');
}

/**
 * 将浮点数还原为精确符号形式（√n, a√b, π, e 等）
 * 返回字符串如 "√2", "2√3", "π/2" 等；无法识别则返回 null
 */
export function toExactForm(value) {
  if (!Number.isFinite(value) || Number.isInteger(value)) {
    return null;
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  // 1. 检查是否为 π 的有理倍数:  k * π
  const piMult = absValue / Math.PI;
  if (Math.abs(piMult - Math.round(piMult)) < 1e-10) {
    const k = Math.round(piMult);
    if (k === 1) return `${sign}π`;
    if (k === -1) return `${sign}π`;
    return `${sign}${k}π`;
  }

  // 2. 检查是否为 e 的有理倍数:  k * e
  const eMult = absValue / Math.E;
  if (Math.abs(eMult - Math.round(eMult)) < 1e-10) {
    const k = Math.round(eMult);
    if (k === 1) return `${sign}e`;
    return `${sign}${k}e`;
  }

  // 3. 检查是否为 √n 形式:  value² ≈ n (n 为整数)
  const squared = absValue * absValue;
  const n = Math.round(squared);
  if (n > 1 && Math.abs(squared - n) < 1e-10) {
    // 化简 √n = a√b，其中 b 无平方因子
    const simplified = simplifySquareRoot(n);
    if (simplified.a === 1) {
      return `${sign}√${simplified.b}`;
    }
    return `${sign}${simplified.a}√${simplified.b}`;
  }

  // 4. 检查是否为 a√b 形式:  value / √n ≈ 整数
  // 遍历可能的 b (2~1000，无平方因子)
  for (let b = 2; b <= 1000; b++) {
    if (!isSquareFree(b)) continue;
    const sqrtB = Math.sqrt(b);
    const a = absValue / sqrtB;
    const aRounded = Math.round(a);
    if (aRounded > 0 && Math.abs(a - aRounded) < 1e-10) {
      if (aRounded === 1) {
        return `${sign}√${b}`;
      }
      return `${sign}${aRounded}√${b}`;
    }
  }

  // 5. 检查是否为 π/√n 或 √n/π 等组合
  // π/√n
  const piOverSqrt = Math.PI / absValue;
  const piOverSqrtSq = piOverSqrt * piOverSqrt;
  const piOverN = Math.round(piOverSqrtSq);
  if (piOverN > 1 && Math.abs(piOverSqrtSq - piOverN) < 1e-10) {
    const simplified = simplifySquareRoot(piOverN);
    if (simplified.a === 1) {
      return `${sign}π/√${simplified.b}`;
    }
    return `${sign}π/${simplified.a}√${simplified.b}`;
  }

  // 6. 检查是否为常见特殊值
  const specialValues = [
    { value: Math.SQRT2, form: '√2' },
    { value: Math.SQRT1_2, form: '√2/2' },
    { value: Math.PI / 2, form: 'π/2' },
    { value: Math.PI / 3, form: 'π/3' },
    { value: Math.PI / 4, form: 'π/4' },
    { value: Math.PI / 6, form: 'π/6' },
    { value: Math.PI * 2, form: '2π' },
    { value: Math.PI / 180, form: 'π/180' },
    { value: Math.E / 2, form: 'e/2' },
    { value: Math.LOG10E, form: 'log₁₀e' },
    { value: Math.LOG2E, form: 'log₂e' },
    { value: Math.LN10, form: 'ln10' },
    { value: Math.LN2, form: 'ln2' }
  ];

  for (const sv of specialValues) {
    if (Math.abs(absValue - sv.value) < 1e-10) {
      return `${sign}${sv.form}`;
    }
  }

  return null;
}

/**
 * 化简平方根: √n = a√b，其中 b 无平方因子
 */
function simplifySquareRoot(n) {
  let a = 1;
  let b = n;
  for (let i = 2; i * i <= b; i++) {
    while (b % (i * i) === 0) {
      a *= i;
      b /= i * i;
    }
  }
  return { a, b };
}

/**
 * 判断 n 是否为无平方因子数（square-free）
 */
function isSquareFree(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % (i * i) === 0) return false;
  }
  return true;
}

/**
 * 进制结果格式化
 */
export function formatBaseResult(value, base) {
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
