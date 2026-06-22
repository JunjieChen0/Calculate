/**
 * 计算器状态管理模块
 * 管理角度单位、精度、显示格式、变量、自定义函数等全局状态
 */
import { MAX_VARIABLES } from '../shared/constants.js';

// 角度单位状态
let angleUnit = 'rad';
let ansValue = 0;
let precision = 12;
let displayFormat = 'norm'; // 'norm' | 'fix' | 'sci'
let fixDecimals = 4;
let currentBase = 10; // 10 | 2 | 8 | 16
let engineeringNotation = false;
let fractionMode = false;
let exactMode = false;
let fractionType = 'improper'; // 'improper' | 'mixed'
let thousandSeparator = false;
let decimalSeparator = '.'; // '.' | ','
let language = 'zh'; // 'zh' | 'en'

// Variable storage (A-Z, 9 variables)
const variables = {};

// Custom function storage (f, g, h)
const customFunctions = {};

// --- 角度单位 ---
export function setAngleUnit(unit) {
  if (unit === 'deg' || unit === 'rad' || unit === 'grad') {
    angleUnit = unit;
  }
}

export function getAngleUnit() {
  return angleUnit;
}

// --- Ans ---
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

// --- 精度 ---
export function setPrecision(value) {
  precision = Math.max(0, Math.min(15, Math.floor(value)));
}

export function getPrecision() {
  return precision;
}

// --- 显示格式 ---
export function setDisplayFormat(format, decimals = 4) {
  if (format === 'norm') format = 'norm1'; // 向后兼容
  if (format === 'norm1' || format === 'norm2' || format === 'fix' || format === 'sci') {
    displayFormat = format;
    fixDecimals = Math.max(0, Math.min(15, Math.floor(decimals)));
  }
}

export function getDisplayFormat() {
  return { format: displayFormat, decimals: fixDecimals };
}

// --- 进制 ---
export function setCurrentBase(base) {
  if ([2, 8, 10, 16].includes(base)) {
    currentBase = base;
  }
}

export function getCurrentBase() {
  return currentBase;
}

// --- 工程符号 ---
export function setEngineeringNotation(enabled) {
  engineeringNotation = !!enabled;
}

export function getEngineeringNotation() {
  return engineeringNotation;
}

// --- 分数模式 ---
export function setFractionMode(enabled) {
  fractionMode = !!enabled;
}

export function getFractionMode() {
  return fractionMode;
}

// --- 精确模式 ---
export function setExactMode(enabled) {
  exactMode = !!enabled;
}

export function getExactMode() {
  return exactMode;
}

// --- 分数类型 ---
export function setFractionType(type) {
  if (type === 'improper' || type === 'mixed') {
    fractionType = type;
  }
}

export function getFractionType() {
  return fractionType;
}

// --- 千分位分隔符 ---
export function setThousandSeparator(enabled) {
  thousandSeparator = !!enabled;
}

export function getThousandSeparator() {
  return thousandSeparator;
}

// --- 小数点符号 ---
export function setDecimalSeparator(sep) {
  if (sep === '.' || sep === ',') {
    decimalSeparator = sep;
  }
}

export function getDecimalSeparator() {
  return decimalSeparator;
}

// --- 语言 ---
export function setLanguage(lang) {
  if (lang === 'zh' || lang === 'en') {
    language = lang;
  }
}

export function getLanguage() {
  return language;
}

// --- 变量存储 ---
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

export function getVariable(name) {
  if (typeof name !== 'string' || name.length !== 1 || !/[A-Z]/.test(name)) {
    throw new Error('变量名必须为A-Z的大写字母');
  }
  return variables[name] !== undefined ? variables[name] : 0;
}

export function getAllVariables() {
  return { ...variables };
}

export function clearVariable(name) {
  if (typeof name === 'string' && name.length === 1 && /[A-Z]/.test(name)) {
    delete variables[name];
  }
}

export function clearAllVariables() {
  Object.keys(variables).forEach(key => delete variables[key]);
}

// --- 自定义函数 ---
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

export function getCustomFunction(name) {
  if (typeof name !== 'string' || !['f', 'g', 'h'].includes(name)) {
    throw new Error('函数名必须为f、g或h');
  }
  return customFunctions[name] || null;
}

export function clearCustomFunction(name) {
  if (typeof name === 'string' && ['f', 'g', 'h'].includes(name)) {
    delete customFunctions[name];
  }
}

export function clearAllCustomFunctions() {
  Object.keys(customFunctions).forEach(key => delete customFunctions[key]);
}

// --- 状态重置 ---
export function resetAllState() {
  angleUnit = 'rad';
  ansValue = 0;
  precision = 12;
  displayFormat = 'norm';
  fixDecimals = 4;
  currentBase = 10;
  engineeringNotation = false;
  fractionMode = false;
  exactMode = false;
  fractionType = 'improper';
  thousandSeparator = false;
  decimalSeparator = '.';
  language = 'zh';
}

// --- 供其他模块访问内部状态的 getter ---
export function _getAngleUnit() {
  return angleUnit;
}
export function _getAnsValue() {
  return ansValue;
}
export function _getPrecision() {
  return precision;
}
export function _getDisplayFormat() {
  return displayFormat;
}
export function _getFixDecimals() {
  return fixDecimals;
}
export function _getCurrentBase() {
  return currentBase;
}
export function _getEngineeringNotation() {
  return engineeringNotation;
}
export function _getFractionMode() {
  return fractionMode;
}
export function _getExactMode() {
  return exactMode;
}
export function _getFractionType() {
  return fractionType;
}
export function _getThousandSeparator() {
  return thousandSeparator;
}
export function _getDecimalSeparator() {
  return decimalSeparator;
}
export function _getLanguage() {
  return language;
}
export function _getVariables() {
  return variables;
}
export function _getCustomFunctions() {
  return customFunctions;
}
