'use strict';

/**
 * 项目共享常量
 * CJS 格式，供 main.cjs 和 preload.cjs 使用
 */

const ALLOWED_STORE_KEYS = Object.freeze([
  'calculator_settings',
  'calculator_memory',
  'calculator_history',
  'calculator_theme'
]);

const MAX_STORE_VALUE_SIZE = 1024 * 1024; // 1MB

module.exports = {
  ALLOWED_STORE_KEYS,
  MAX_STORE_VALUE_SIZE
};
