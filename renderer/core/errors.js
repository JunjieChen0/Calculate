/**
 * 统一错误类型
 */
export class CalculatorError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'CalculatorError';
  }
}

/**
 * 错误码枚举
 */
export const ErrorCode = Object.freeze({
  INVALID_EXPRESSION: 'INVALID_EXPRESSION',
  DIVISION_BY_ZERO: 'DIVISION_BY_ZERO',
  OVERFLOW: 'OVERFLOW',
  UNDEFINED_VARIABLE: 'UNDEFINED_VARIABLE',
  DIMENSION_MISMATCH: 'DIMENSION_MISMATCH',
  ROOT_NOT_FOUND: 'ROOT_NOT_FOUND',
  STORAGE_ERROR: 'STORAGE_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  NEGATIVE_ROOT: 'NEGATIVE_ROOT',
  EIGEN_NOT_CONVERGE: 'EIGEN_NOT_CONVERGE'
});

/**
 * 错误码到中文的映射（生产环境用友好消息）
 */
const FRIENDLY_MESSAGES = Object.freeze({
  [ErrorCode.INVALID_EXPRESSION]: '表达式无效，请检查输入',
  [ErrorCode.DIVISION_BY_ZERO]: '除零错误',
  [ErrorCode.OVERFLOW]: '数值溢出',
  [ErrorCode.UNDEFINED_VARIABLE]: '未知变量',
  [ErrorCode.DIMENSION_MISMATCH]: '矩阵维度不匹配',
  [ErrorCode.ROOT_NOT_FOUND]: '未找到根',
  [ErrorCode.STORAGE_ERROR]: '存储读写失败',
  [ErrorCode.INVALID_INPUT]: '输入无效',
  [ErrorCode.NEGATIVE_ROOT]: '负数不能开偶次根',
  [ErrorCode.EIGEN_NOT_CONVERGE]: '特征值迭代未收敛'
});

/**
 * 错误处理器 —— 统一处理、日志记录、友好消息转换
 */
export class ErrorHandler {
  constructor() {
    this.fallbackMessage = '计算错误，请检查输入';
    this._rules = [
      [/division by zero|divide by zero|除零/i, ErrorCode.DIVISION_BY_ZERO],
      [/dimension/i, ErrorCode.DIMENSION_MISMATCH],
      [/overflow/i, ErrorCode.OVERFLOW],
      [/not converge/i, ErrorCode.EIGEN_NOT_CONVERGE],
      [/root not found|roots not found/i, ErrorCode.ROOT_NOT_FOUND],
      [/must be >= 1/i, ErrorCode.INVALID_INPUT]
    ];
  }

  /**
   * 处理错误，返回 { success, error, code }
   */
  handle(error) {
    if (error instanceof CalculatorError) {
      console.warn(`[CalculatorError] ${error.code}: ${error.message}`, error.details);
      return { success: false, error: error.message, code: error.code };
    }

    const code = this._detectCode(error);
    const friendly = FRIENDLY_MESSAGES[code] || this.fallbackMessage;
    console.warn(`[ErrorHandler] ${code}:`, error?.message);
    return { success: false, error: friendly, code };
  }

  /**
   * 从错误消息推断错误码
   */
  _detectCode(error) {
    const msg = error?.message || '';
    for (const [pattern, code] of this._rules) {
      if (pattern.test(msg)) return code;
    }
    return ErrorCode.INVALID_EXPRESSION;
  }
}

/**
 * 全局错误处理器单例
 */
export const errorHandler = new ErrorHandler();
