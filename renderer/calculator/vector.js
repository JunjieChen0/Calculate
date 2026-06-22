/**
 * 向量模式模块
 * 向量运算：点积、叉积、模、单位向量、投影
 */
import { create, all } from 'mathjs';

const math = create(all, { number: 'number', precision: 64 });

/**
 * 向量表达式求值
 */
export function evaluateVectorExpression(expr) {
  const processed = expr
    .replace(/\bdot\(/g, 'dot(')
    .replace(/\bcross\(/g, 'cross(')
    .replace(/\bnorm\(/g, 'norm(')
    .replace(/\bmag\(/g, 'norm(')
    .replace(/\bunit\(/g, 'unit(')
    .replace(/\bproj\(/g, 'proj(');

  return math.evaluate(processed, {
    dot: math.dot,
    cross: math.cross,
    norm: math.norm,
    unit: v => math.divide(v, math.norm(v)),
    proj: (a, b) => math.multiply(b, math.dot(a, b) / math.dot(b, b))
  });
}
