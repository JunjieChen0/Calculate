/**
 * 角度转换工具模块
 * 处理三角函数的角度输入转换和反三角函数的角度输出转换
 */
import { _getAngleUnit as getAngleUnit } from './state.js';

/**
 * 将三角函数参数从当前角度单位转换为弧度
 */
export function applyAngleConversions(expr) {
  if (getAngleUnit() === 'rad') {
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
      if (getAngleUnit() === 'grad') {
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

/**
 * 将反三角函数输出从弧度转换为当前角度单位
 */
export function convertInverseTrigOutput(expr, result) {
  const inverseTrigPattern = /\b(acos|asin|atan)\s*\(/;
  const match = expr.match(inverseTrigPattern);
  if (!match) {
    return result;
  }

  if (getAngleUnit() === 'deg') {
    return (result * 180) / Math.PI;
  }
  if (getAngleUnit() === 'grad') {
    return (result * 200) / Math.PI;
  }
  return result;
}

/**
 * 获取角度单位后缀
 */
export function getAngleUnitSuffix() {
  switch (getAngleUnit()) {
    case 'deg':
      return '°';
    case 'grad':
      return 'g';
    default:
      return ' rad';
  }
}
