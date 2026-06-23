/**
 * mathjs 全局单例
 * 所有需要 mathjs 的模块应从此处导入，避免重复实例化。
 */
import { create, all } from 'mathjs';

export const math = create(all, { number: 'number', precision: 64 });
