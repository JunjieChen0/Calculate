/**
 * 璁＄畻鍣ㄦā鍧?— 鍚戝悗鍏煎鍖呰灞?
 * 鎵€鏈夊姛鑳藉凡鎷嗗垎鍒?calculator/ 瀛愮洰褰曚笅鐨勭嫭绔嬫ā鍧?
 * 姝ゆ枃浠朵粎鍋?re-export锛屼繚鎸佸師鏈夊鍏ヨ矾寰勪笉鍙?
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
