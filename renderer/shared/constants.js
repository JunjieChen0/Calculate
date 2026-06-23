/**
 * 项目共享常量
 * ESM 格式，供 renderer 模块使用
 */

// 存储相关
export const ALLOWED_STORE_KEYS = Object.freeze([
  'calculator_settings',
  'calculator_memory',
  'calculator_history',
  'calculator_theme'
]);

export const MAX_STORE_VALUE_SIZE = 1024 * 1024; // 1MB

// 历史记录
export const MAX_HISTORY_ITEMS = 100;

// 数值表格
export const MAX_TABLE_DATA_POINTS = 1000;

// 阶乘
export const MAX_FACTORIAL_INPUT = 170;

// 表达式求值
export const MAX_EXPRESSION_LENGTH = 500;
export const MAX_STATEMENT_COUNT = 10;

// 变量存储
export const MAX_VARIABLES = 9;

// 数值计算
export const NUMERICAL_DERIVATIVE_STEP = 1e-8;
export const BISECTION_MAX_ITERATIONS = 100;
export const NEWTON_RAPHSON_MAX_ITERATIONS = 1000;
export const ROOT_FINDING_TOLERANCE = 1e-12;
export const ROOT_EQUALITY_TOLERANCE = 1e-8;
export const SIMPSON_INTERVALS = 1000;

// 精度
export const RESULT_PRECISION = 15;

// UI
export const FEEDBACK_DISPLAY_TIMEOUT = 3000;

// 计算模式
export const CALC_MODES = Object.freeze({
  STANDARD: 'standard',
  COMPLEX: 'complex',
  MATRIX: 'matrix',
  VECTOR: 'vector',
  SOLVE: 'solve',
  BASE: 'base',
  CONVERT: 'convert',
  STATS: 'stats',
  CALCULUS: 'calculus'
});

// 角度单位
export const ANGLE_UNITS = Object.freeze({
  RAD: 'rad',
  DEG: 'deg',
  GRAD: 'grad'
});

// 显示格式
export const DISPLAY_FORMATS = Object.freeze({
  NORM: 'norm',
  FIX: 'fix',
  SCI: 'sci'
});

// 进制
export const BASES = Object.freeze({
  BIN: 2,
  OCT: 8,
  DEC: 10,
  HEX: 16
});
// 撤销栈
export const MAX_UNDO_SIZE = 50;

// 表达式历史导航
export const MAX_EXPRESSION_HISTORY = 100;

// 骰子/硬币模拟
export const DICE_MAX_ROLLS = 100;
export const COIN_MAX_FLIPS = 100;

// 概率分布级数展开项数
export const REGULARIZED_SERIES_TERMS = 200;

// 格式化阈值
export const NORM1_EXPONENT_THRESHOLD_LOW = 1e-2;
export const NORM2_EXPONENT_THRESHOLD_LOW = 1e-9;
export const NORM_EXPONENT_THRESHOLD_HIGH = 1e10;

// 方程求解
export const ABERDEEN_MAX_ITERATIONS = 500;
export const ABERDEEN_TOLERANCE = 1e-14;

// 统计编辑器
export const MAX_STATS_ROWS = 100;
export const INITIAL_STATS_ROWS = 5;
