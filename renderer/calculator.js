/**
 * 计算器模块 — 向后兼容包装层
 * 所有功能已拆分到 calculator/ 子目录下的独立模块
 * 此文件仅做 re-export，保持原有导入路径不变
 */

// 状态管理
export {
  setAngleUnit,
  getAngleUnit,
  setAns,
  getAns,
  setPrecision,
  getPrecision,
  setDisplayFormat,
  getDisplayFormat,
  setCurrentBase,
  getCurrentBase,
  setEngineeringNotation,
  getEngineeringNotation,
  setFractionMode,
  getFractionMode,
  setExactMode,
  getExactMode,
  setFractionType,
  getFractionType,
  setThousandSeparator,
  getThousandSeparator,
  setDecimalSeparator,
  getDecimalSeparator,
  setLanguage,
  getLanguage,
  setVariable,
  getVariable,
  getAllVariables,
  clearVariable,
  clearAllVariables,
  setCustomFunction,
  getCustomFunction,
  clearCustomFunction,
  clearAllCustomFunctions,
  resetAllState,
  _getCustomFunctions
} from './calculator/state.js';

// 核心引擎
export { evaluateExpression, generateTable } from './calculator/engine.js';

// mathjs 实例
export { math } from './calculator/index.js';
