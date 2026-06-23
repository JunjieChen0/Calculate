import { logger } from './logger.js';
/**
 * 响应式状态管理 —— 状态变更自动通知订阅者
 */
export class ReactiveState {
  constructor(initialState = {}) {
    this._state = { ...initialState };
    this._listeners = new Map();
  }

  /**
   * 获取状态值
   */
  get(key) {
    return this._state[key];
  }

  /**
   * 设置状态值（值变化时自动通知）
   */
  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;
    if (oldValue !== value) {
      this._notify(key, value, oldValue);
    }
  }

  /**
   * 批量更新（仅在最后触发一次通知）
   */
  batch(updates) {
    const changes = [];
    for (const [key, value] of Object.entries(updates)) {
      const oldValue = this._state[key];
      this._state[key] = value;
      if (oldValue !== value) {
        changes.push([key, value, oldValue]);
      }
    }
    for (const [key, value, oldValue] of changes) {
      this._notify(key, value, oldValue);
    }
  }

  /**
   * 监听状态变化
   * @returns {Function} 取消监听函数
   */
  on(key, callback) {
    if (!this._listeners.has(key)) {
      this._listeners.set(key, new Set());
    }
    this._listeners.get(key).add(callback);
    return () => {
      const set = this._listeners.get(key);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this._listeners.delete(key);
      }
    };
  }

  /**
   * 获取当前所有状态的快照（只读）
   */
  snapshot() {
    return Object.freeze({ ...this._state });
  }

  _notify(key, value, oldValue) {
    const set = this._listeners.get(key);
    if (set) {
      set.forEach(cb => {
        try {
          cb(value, oldValue);
        } catch (e) {
          logger.error(`[ReactiveState] listener error for "${key}":`, e);
        }
      });
    }
  }
}

/**
 * 创建应用全局状态
 */
export function createAppState() {
  return new ReactiveState({
    currentMode: 'standard',
    currentInput: '',
    cursorIndex: 0,
    lastResult: '0',
    error: null,
    isEditing: false
  });
}
