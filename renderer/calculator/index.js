/**
 * 计算器模块聚合导出
 * 保持与原有 calculator.js 相同的对外 API
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
  setVariable,
  getVariable,
  getAllVariables,
  clearVariable,
  clearAllVariables,
  setCustomFunction,
  getCustomFunction,
  clearCustomFunction,
  clearAllCustomFunctions,
  resetAllState
} from './state.js';

// 核心引擎
export { evaluateExpression, generateTable } from './engine.js';

// 格式化
export {
  formatResult,
  formatBaseResult,
  toFractionString,
  formatEngineering,
  getFriendlyError
} from './formatter.js';

// 角度工具
export {
  applyAngleConversions,
  convertInverseTrigOutput,
  getAngleUnitSuffix
} from './angle-utils.js';

// 微积分
export {
  numericalDerivative,
  numericalIntegration,
  calculateSummation,
  calculateProduct
} from './calculus.js';

// 特殊函数
export { handleSpecialFunctions } from './special-functions.js';

// 进制模式
export { evaluateBaseExpression } from './base.js';

// 向量模式
export { evaluateVectorExpression } from './vector.js';

// 求解模式
export { handleSolve } from './solve.js';

// mathjs 实例（供需要直接使用 mathjs 的模块）
// mathjs 实例（供需要直接使用 mathjs 的模块）
export { math } from './math-instance.js';
