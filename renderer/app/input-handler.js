/**
 * 输入处理工具函数
 * 纯函数，不直接操作 DOM 或全局状态
 */

/**
 * 执行退格操作
 * @param {string} input - 当前输入
 * @param {number} cursorIndex - 光标位置
 * @returns {{ input: string, cursorIndex: number }}
 */
export function applyBackspace(input, cursorIndex) {
  if (!input || input.length === 0) {
    return { input: '', cursorIndex: 0 };
  }
  if (cursorIndex > 0) {
    const newInput = input.slice(0, cursorIndex - 1) + input.slice(cursorIndex);
    return { input: newInput, cursorIndex: cursorIndex - 1 };
  }
  return { input, cursorIndex };
}

/**
 * 在光标位置插入文本
 * @param {string} input - 当前输入
 * @param {string} text - 要插入的文本
 * @param {number} cursorIndex - 光标位置
 * @returns {{ input: string, cursorIndex: number }}
 */
export function applyInsert(input, text, cursorIndex) {
  const newInput = input.slice(0, cursorIndex) + text + input.slice(cursorIndex);
  return { input: newInput, cursorIndex: cursorIndex + text.length };
}