/**
 * 表达式历史导航
 * 管理已执行表达式的上下键导航
 */
import { MAX_EXPRESSION_HISTORY } from '../shared/constants.js';

export class ExpressionHistory {
  constructor(maxSize = MAX_EXPRESSION_HISTORY) {
    this.items = [];
    this.navIndex = -1;
    this.maxSize = maxSize;
  }

  push(expression) {
    this.items.push(expression);
    if (this.items.length > this.maxSize) this.items.shift();
    this.navIndex = -1;
  }

  navigate(direction) {
    if (this.items.length === 0) return null;

    if (direction === 'up') {
      if (this.navIndex === -1) this.navIndex = this.items.length - 1;
      else if (this.navIndex > 0) this.navIndex--;
    } else {
      if (this.navIndex === -1) return null;
      if (this.navIndex < this.items.length - 1) {
        this.navIndex++;
      } else {
        this.navIndex = -1;
        return ''; // 返回空字符串表示清除输入
      }
    }
    return this.items[this.navIndex];
  }
}
