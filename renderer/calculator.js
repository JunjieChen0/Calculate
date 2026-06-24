/**
 * 计算器模块 — 向后兼容封装
 * 所有功能已拆分到 calculator/ 子目录下的独立模块
 * 此文件仅做 re-export，保持原有导入路径不变
 */

// 鐘舵€佺悊
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
  setComplexDisplayFormat,
  getComplexDisplayFormat,
  pushAnsStack,
  getAnsStack,
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

// 鏍稿績寮曟搸
export { evaluateExpression, generateTable } from './calculator/engine.js';

// mathjs 瀹炰緥
export { math } from './calculator/index.js';
