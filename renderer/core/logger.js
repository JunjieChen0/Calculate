/**
 * 分级日志系统
 * 生产环境仅 warn/error，开发环境全量输出
 * 保留最近 N 条日志用于错误上报
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

class Logger {
  constructor(level = 'info') {
    this.level = LOG_LEVELS[level] ?? LOG_LEVELS.info;
    this.logs = [];
    this.maxLogs = 200;
  }

  _log(level, ...args) {
    if (LOG_LEVELS[level] < this.level) return;
    const entry = { level, time: Date.now(), args };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) this.logs.shift();

    const prefix = `[${level.toUpperCase()}]`;
    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }

  debug(...args) {
    this._log('debug', ...args);
  }

  info(...args) {
    this._log('info', ...args);
  }

  warn(...args) {
    this._log('warn', ...args);
  }

  error(...args) {
    this._log('error', ...args);
  }

  getRecentLogs() {
    return [...this.logs];
  }

  clear() {
    this.logs.length = 0;
  }
}

export const logger = new Logger(
  typeof import.meta !== 'undefined' && import.meta.env?.PROD ? 'warn' : 'debug'
);
