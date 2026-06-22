/**
 * 进制模式模块
 * 进制转换和进制算术运算
 */
import { _getCurrentBase as getCurrentBase } from './state.js';
import { formatBaseResult } from './formatter.js';

/**
 * 进制模式表达式求值
 */
export function evaluateBaseExpression(expr) {
  // INT/FRAC extraction
  const intMatch = expr.match(/^int\((.+)\)$/i);
  if (intMatch) {
    const value = Number(intMatch[1].trim());
    if (isNaN(value)) throw new Error('int() 参数必须为数字');
    return formatBaseResult(Math.trunc(value), getCurrentBase());
  }
  const fracMatch = expr.match(/^frac\((.+)\)$/i);
  if (fracMatch) {
    const value = Number(fracMatch[1].trim());
    if (isNaN(value)) throw new Error('frac() 参数必须为数字');
    const frac = value - Math.trunc(value);
    return formatBaseResult(frac, getCurrentBase());
  }

  const conversionMatch = expr.match(/^(bin|oct|hex|dec)\((.+)\)$/i);
  if (conversionMatch) {
    const [, func, arg] = conversionMatch;
    const trimmedArg = arg.trim();
    let value;

    if (trimmedArg.toLowerCase().startsWith('0b')) {
      value = parseInt(trimmedArg.slice(2), 2);
    } else if (trimmedArg.toLowerCase().startsWith('0o')) {
      value = parseInt(trimmedArg.slice(2), 8);
    } else if (trimmedArg.toLowerCase().startsWith('0x')) {
      value = parseInt(trimmedArg.slice(2), 16);
    } else {
      value = parseInt(trimmedArg, getCurrentBase());
    }

    if (isNaN(value)) {
      throw new Error('无效的进制数值');
    }
    return formatBaseResult(value, func.toLowerCase());
  }

  return evaluateBaseArithmetic(expr);
}

/**
 * 进制算术运算
 */
function evaluateBaseArithmetic(expr) {
  const tokenPattern = /([0-9A-Fa-f]+)|(\*\*|<<|>>|\|\||&&|\^\^|[+\-*/%^&|~()])/gi;
  const tokens = [];
  let match;

  while ((match = tokenPattern.exec(expr)) !== null) {
    if (match[1]) {
      const value = parseInt(match[1], getCurrentBase());
      if (isNaN(value)) {
        const invalidChars = match[1].split('').filter(ch => {
          const digit = parseInt(ch, getCurrentBase());
          return isNaN(digit);
        });
        const hint = invalidChars.length > 0 ? ` '${invalidChars[0]}'` : '';
        throw new Error(`数字${hint}不是有效的${getCurrentBase()}进制数`);
      }
      tokens.push(value);
    } else if (match[2]) {
      let op = match[2];
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

  const result = evaluateIntegerExpression(tokens);
  if (!Number.isFinite(result) || !Number.isInteger(result)) {
    throw new Error('进制模式只支持整数运算');
  }
  return formatBaseResult(result, getCurrentBase());
}

/**
 * 安全的整数表达式求值（递归下降解析器）
 */
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
    if (typeof token === 'number') continue;
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
