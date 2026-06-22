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
  _getFractionMode as getFractionMode
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
        return fraction;
      }
    }

    switch (getDisplayFormat()) {
      case 'fix':
        return value.toFixed(getFixDecimals());
      case 'sci':
        return value.toExponential(getFixDecimals());
      case 'norm':
      default: {
        const normalValue = parseFloat(value.toPrecision(getPrecision()));
        if (getEngineeringNotation()) {
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
 * 友好错误消息
 */
export function getFriendlyError(error) {
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
