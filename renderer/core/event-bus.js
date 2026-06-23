/**
 * 轻量级事件总线 —— 模块间解耦通信
 */
export class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /**
   * 订阅事件
   * @param {string} event
   * @param {Function} callback
   * @returns {Function} 取消订阅函数
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * 取消订阅
   */
  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) this._listeners.delete(event);
    }
  }

  /**
   * 发布事件
   */
  emit(event, data) {
    const set = this._listeners.get(event);
    if (set) {
      set.forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[EventBus] handler error for "${event}":`, e);
        }
      });
    }
  }

  /**
   * 一次性订阅
   */
  once(event, callback) {
    const unsub = this.on(event, data => {
      unsub();
      callback(data);
    });
    return unsub;
  }
}
