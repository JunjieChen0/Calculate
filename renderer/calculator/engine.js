/**
 * 核心求值引擎模块
 * 表达式求值主入口，协调各模式处理器
 */
import { create, all } from 'mathjs';
import { MAX_TABLE_DATA_POINTS } from '../shared/constants.js';
import {
  _getAngleUnit as getAngleUnit,
  _getAnsValue as getAnsValue,
  getVariable,
  setVariable,
  setCustomFunction,
  _getCustomFunctions as getCustomFunctions
} from './state.js';
import { formatResult, getFriendlyError } from './formatter.js';
import { applyAngleConversions, convertInverseTrigOutput } from './angle-utils.js';
import { handleSpecialFunctions } from './special-functions.js';
import {
  numericalDerivative,
  numericalIntegration,
  calculateSummation,
  calculateProduct
} from './calculus.js';
import { evaluateBaseExpression } from './base.js';
import { evaluateVectorExpression } from './vector.js';
import { handleSolve } from './solve.js';

const math = create(all, { number: 'number', precision: 64 });

/**
 * 评估自定义函数调用
 */
function evaluateCustomFunction(name, argValue) {
  const funcs = getCustomFunctions();
  const func = funcs[name];
  if (!func) {
    throw new Error(`未定义函数 ${name}`);
  }

  const substituted = func.expr.replace(new RegExp(`\\b${func.param}\\b`, 'g'), `(${argValue})`);
  return math.evaluate(substituted);
}

/**
 * 安全求值数学表达式
 * @param {string} expression - 表达式
 * @param {string} mode - 计算模式
 * @returns {{ success: boolean, result?: string, error?: string }}
 */
export function evaluateExpression(expression, mode = 'standard') {
  if (!expression || expression.trim() === '') {
    return { success: true, result: '0' };
  }

  // 表达式长度安全边界
  const MAX_EXPRESSION_LENGTH = 500;
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    return { success: false, error: `表达式长度不能超过 ${MAX_EXPRESSION_LENGTH} 字符` };
  }

  // Handle multiple statements separated by colon
  const statements = expression
    .split(':')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  if (statements.length > 1) {
    const MAX_STATEMENT_COUNT = 10;
    if (statements.length > MAX_STATEMENT_COUNT) {
      return { success: false, error: `多语句表达式最多 ${MAX_STATEMENT_COUNT} 条` };
    }
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
    expr = expr.replace(/\bans\b/g, `(${getAnsValue()})`);

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
    expr = expr.replace(/\b([A-Z])\b/g, match => {
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
      // 处理微积分标记
      if (typeof specialResult === 'object' && specialResult.__calculus) {
        return handleCalculusResult(specialResult);
      }
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
        if (!expr.toLowerCase().includes(' to ')) {
          throw new Error('格式应为：100 cm to m');
        }
        result = math.evaluate(expr);
        break;
      case 'stats':
        result = math.evaluate(expr, commonScope);
        break;
      case 'standard':
      default:
        result = math.evaluate(applyAngleConversions(expr), commonScope);
        break;
    }

    if (typeof result === 'number' && getAngleUnit() !== 'rad') {
      result = convertInverseTrigOutput(expr, result);
    }

    const formatted = formatResult(result);
    return { success: true, result: formatted };
  } catch (error) {
    return { success: false, error: getFriendlyError(error) };
  }
}

/**
 * 处理微积分特殊函数的延迟计算
 */
function handleCalculusResult(calculusResult) {
  try {
    let result;
    switch (calculusResult.__calculus) {
      case 'derivative':
        result = numericalDerivative(
          calculusResult.funcExpr,
          calculusResult.variable,
          calculusResult.point
        );
        break;
      case 'integral':
        result = numericalIntegration(
          calculusResult.funcExpr,
          calculusResult.variable,
          calculusResult.lower,
          calculusResult.upper
        );
        break;
      case 'sum':
        result = calculateSummation(
          calculusResult.funcExpr,
          calculusResult.variable,
          calculusResult.start,
          calculusResult.end
        );
        break;
      case 'product':
        result = calculateProduct(
          calculusResult.funcExpr,
          calculusResult.variable,
          calculusResult.start,
          calculusResult.end
        );
        break;
      default:
        throw new Error('未知的微积分操作');
    }
    return { success: true, result: formatResult(result) };
  } catch (error) {
    return { success: false, error: getFriendlyError(error) };
  }
}

/**
 * 生成数值表格
 */
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

  if (Math.abs(e - s) / Math.abs(st) > MAX_TABLE_DATA_POINTS) {
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
