/**
 * 撤销栈管理器
 */
import { MAX_UNDO_SIZE } from '../shared/constants.js';

export class UndoManager {
  constructor(maxSize = MAX_UNDO_SIZE) {
    this.stack = [];
    this.maxSize = maxSize;
  }

  push(input, cursorIndex) {
    this.stack.push({ input, cursorIndex });
    if (this.stack.length > this.maxSize) this.stack.shift();
  }

  pop() {
    return this.stack.pop() || null;
  }

  get length() {
    return this.stack.length;
  }
}