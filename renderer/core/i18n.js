/**
 * 轻量级国际化模块
 * 支持占位符替换：t('error.divisionByZero') → '除零错误'
 */

import zh from './i18n/zh.js';
import en from './i18n/en.js';

const LOCALES = { zh, en };
let currentLocale = 'zh';

/**
 * 设置当前语言
 */
export function setLocale(locale) {
  if (LOCALES[locale]) {
    currentLocale = locale;
  }
}

/**
 * 获取当前语言
 */
export function getLocale() {
  return currentLocale;
}

/**
 * 翻译指定 key
 * @param {string} key - 如 'error.divisionByZero'
 * @param {Object} [params] - 占位符参数，如 { name: 'A' }
 * @returns {string}
 */
export function t(key, params) {
  const dict = LOCALES[currentLocale] || LOCALES.zh;
  let text = dict[key] || key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
  }
  return text;
}
