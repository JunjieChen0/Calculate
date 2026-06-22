import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  evaluateExpression,
  setAngleUnit,
  getAngleUnit,
  setAns,
  setPrecision,
  getPrecision,
  setDisplayFormat,
  setCurrentBase,
  setEngineeringNotation,
  setFractionMode,
  generateTable
} from '../renderer/calculator.js';
import { autoCompleteBrackets } from '../renderer/keyboard.js';
import { searchConstants, CONSTANTS } from '../renderer/constants.js';

describe('Basic arithmetic', () => {
  it('evaluates 1+2*3 = 7', () => {
    const result = evaluateExpression('1+2*3');
    expect(result.result).toBe('7');
  });

  it('evaluates (1+2)*3 = 9', () => {
    const result = evaluateExpression('(1+2)*3');
    expect(result.result).toBe('9');
  });
});

describe('Scientific functions', () => {
  it('evaluates sin(pi/2) = 1', () => {
    const result = evaluateExpression('sin(pi/2)');
    expect(result.result).toBe('1');
  });

  it('evaluates sqrt(16) = 4', () => {
    const result = evaluateExpression('sqrt(16)');
    expect(result.result).toBe('4');
  });

  it('evaluates log10(100) = 2', () => {
    const result = evaluateExpression('log10(100)');
    expect(result.result).toBe('2');
  });
});

describe('Power and factorial', () => {
  it('evaluates 2^10 = 1024', () => {
    const result = evaluateExpression('2^10');
    expect(result.result).toBe('1024');
  });

  it('evaluates 5! = 120', () => {
    const result = evaluateExpression('5!');
    expect(result.result).toBe('120');
  });
});

describe('Complex numbers', () => {
  it('multiplies complex numbers', () => {
    const result = evaluateExpression('(2+3i)*(1-i)', 'complex');
    expect(result.result).toContain('5');
  });
});

describe('Matrix operations', () => {
  it('adds matrices', () => {
    const result = evaluateExpression('[[1,2],[3,4]] + [[1,1],[1,1]]', 'matrix');
    expect(result.result).toContain('2');
  });
});

describe('Unit conversion', () => {
  it('converts 100 cm to m', () => {
    const result = evaluateExpression('100 cm to m', 'convert');
    expect(result.result).toContain('1');
  });
});

describe('Statistics', () => {
  it('calculates mean([1,2,3,4,5]) = 3', () => {
    const result = evaluateExpression('mean([1,2,3,4,5])', 'stats');
    expect(result.result).toBe('3');
  });
});

describe('Edge cases', () => {
  it('handles 1/0 = ∞', () => {
    const result = evaluateExpression('1/0');
    expect(result.result).toBe('∞');
  });

  it('handles sqrt(-1) = i', () => {
    const result = evaluateExpression('sqrt(-1)');
    expect(result.result).toContain('i');
  });

  it('returns 0 for empty input', () => {
    const result = evaluateExpression('');
    expect(result.result).toBe('0');
  });

  it('returns error for incomplete expression', () => {
    const result = evaluateExpression('2 +');
    expect(result.success).toBe(false);
  });
});

describe('Angle mode', () => {
  afterAll(() => {
    setAngleUnit('rad');
  });

  it('defaults to rad', () => {
    expect(getAngleUnit()).toBe('rad');
  });

  it('evaluates sin(90°) = 1 in DEG mode', () => {
    setAngleUnit('deg');
    const result = evaluateExpression('sin(90)');
    expect(result.result).toBe('1');
  });

  it('evaluates sin(100 grad) = 1 in GRAD mode', () => {
    setAngleUnit('grad');
    const result = evaluateExpression('sin(100)');
    expect(result.result).toBe('1');
  });

  it('evaluates sin(pi/2) = 1 in RAD mode', () => {
    setAngleUnit('rad');
    const result = evaluateExpression('sin(pi/2)');
    expect(result.result).toBe('1');
  });
});

describe('Ans variable', () => {
  it('uses last answer in expressions', () => {
    setAns(42);
    const result = evaluateExpression('ans + 8');
    expect(result.result).toBe('50');
  });
});

describe('Precision setting', () => {
  afterAll(() => {
    setPrecision(12);
  });

  it('sets precision to 4', () => {
    setPrecision(4);
    expect(getPrecision()).toBe(4);
  });

  it('applies precision to pi', () => {
    setPrecision(4);
    const result = evaluateExpression('pi');
    expect(result.result).toBe('3.142');
  });
});

describe('Display format', () => {
  afterAll(() => {
    setDisplayFormat('norm');
  });

  it('FIX 2 format', () => {
    setDisplayFormat('fix', 2);
    const result = evaluateExpression('pi');
    expect(result.result).toBe('3.14');
  });

  it('SCI format uses exponent', () => {
    setDisplayFormat('sci', 3);
    const result = evaluateExpression('1234');
    expect(result.result).toContain('e');
  });
});

describe('Auto-complete brackets', () => {
  it('auto-completes one bracket', () => {
    expect(autoCompleteBrackets('sin(90')).toBe('sin(90)');
  });

  it('auto-completes nested brackets', () => {
    expect(autoCompleteBrackets('((1+2')).toBe('((1+2))');
  });

  it('returns unchanged when no brackets needed', () => {
    expect(autoCompleteBrackets('1+2')).toBe('1+2');
  });

  it('returns empty for empty input', () => {
    expect(autoCompleteBrackets('')).toBe('');
  });
});

describe('Constants library', () => {
  it('loads constants', () => {
    expect(CONSTANTS.length).toBeGreaterThan(0);
  });

  it('searches constants by name', () => {
    const results = searchConstants('光速');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('物理');
  });
});

describe('Base conversion', () => {
  afterAll(() => {
    setCurrentBase(10);
  });

  it('converts bin(10) = 0b1010', () => {
    setCurrentBase(10);
    const result = evaluateExpression('bin(10)', 'base');
    expect(result.result).toContain('0b1010');
  });

  it('converts dec(0b1010) = 10', () => {
    const result = evaluateExpression('dec(0b1010)', 'base');
    expect(result.result).toBe('10');
  });

  it('adds binary numbers', () => {
    setCurrentBase(2);
    const result = evaluateExpression('1010 + 10', 'base');
    expect(result.result).toContain('0b1100');
  });

  it('adds hex numbers', () => {
    setCurrentBase(16);
    const result = evaluateExpression('FF + 1', 'base');
    expect(result.result).toContain('0x100');
  });
});

describe('Bitwise operations', () => {
  beforeAll(() => {
    setCurrentBase(10);
  });

  afterAll(() => {
    setCurrentBase(10);
  });

  it('5 AND 3 = 1', () => {
    const result = evaluateExpression('5 & 3', 'base');
    expect(result.result).toBe('1');
  });

  it('5 OR 3 = 7', () => {
    const result = evaluateExpression('5 | 3', 'base');
    expect(result.result).toBe('7');
  });

  it('5 XOR 3 = 6', () => {
    const result = evaluateExpression('5 ^^ 3', 'base');
    expect(result.result).toBe('6');
  });

  it('NOT 5 = -6', () => {
    const result = evaluateExpression('~5', 'base');
    expect(result.result).toBe('-6');
  });

  it('5 << 1 = 10', () => {
    const result = evaluateExpression('5 << 1', 'base');
    expect(result.result).toBe('10');
  });

  it('5 >> 1 = 2', () => {
    const result = evaluateExpression('5 >> 1', 'base');
    expect(result.result).toBe('2');
  });
});

describe('Equation solving', () => {
  it('solves quadratic equation solve2(1,-5,6)', () => {
    const result = evaluateExpression('solve2(1,-5,6)', 'solve');
    expect(result.result).toContain('3');
    expect(result.result).toContain('2');
  });

  it('solves linear system 2x2', () => {
    const result = evaluateExpression('solveLinear2(1,1,5,2,1,7)', 'solve');
    expect(result.result).toContain('2');
    expect(result.result).toContain('3');
  });

  it('solves equation x^2 = 4', () => {
    const result = evaluateExpression('x^2 = 4', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('2');
  });
});

describe('Vector operations', () => {
  it('calculates dot product', () => {
    const result = evaluateExpression('dot([1,2,3],[4,5,6])', 'vector');
    expect(result.result).toBe('32');
  });

  it('calculates norm', () => {
    const result = evaluateExpression('norm([3,4])', 'vector');
    expect(result.result).toBe('5');
  });
});

describe('Permutations and combinations', () => {
  it('nPr(5,2) = 20', () => {
    const result = evaluateExpression('nPr(5,2)');
    expect(result.result).toBe('20');
  });

  it('nCr(5,2) = 10', () => {
    const result = evaluateExpression('nCr(5,2)');
    expect(result.result).toBe('10');
  });

  it('generates random number between 0 and 1', () => {
    const result = evaluateExpression('rand()');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThan(1);
  });
});

describe('Engineering notation', () => {
  afterAll(() => {
    setEngineeringNotation(false);
  });

  it('formats 1234 with engineering notation', () => {
    setEngineeringNotation(true);
    const result = evaluateExpression('1234');
    expect(result.result).toContain('k');
  });
});

describe('Fraction mode', () => {
  afterAll(() => {
    setFractionMode(false);
  });

  it('converts 0.5 to 1/2', () => {
    setFractionMode(true);
    const result = evaluateExpression('0.5');
    expect(result.result).toBe('1/2');
  });

  it('converts 0.75 to 3/4', () => {
    setFractionMode(true);
    const result = evaluateExpression('0.75');
    expect(result.result).toBe('3/4');
  });
});

describe('Special functions', () => {
  it('calculates ratio(2,3,4) = 6', () => {
    const result = evaluateExpression('ratio(2,3,4)');
    expect(result.result).toBe('6');
  });

  it('returns polar form', () => {
    const result = evaluateExpression('polar(3,4)');
    expect(result.result).toContain('r=');
    expect(result.result).toContain('θ=');
  });

  it('returns complex from rect()', () => {
    setAngleUnit('deg');
    const result = evaluateExpression('rect(5,90)');
    expect(result.result).toContain('i');
    setAngleUnit('rad');
  });
});

describe('Table generation', () => {
  it('generates table with correct row count', () => {
    const table = generateTable('x^2', -2, 2, 1);
    expect(table.length).toBe(5);
  });

  it('calculates x=0 correctly', () => {
    const table = generateTable('x^2', -2, 2, 1);
    expect(table[2].x).toBe(0);
    expect(table[2].y).toBe('0');
  });

  it('calculates f(2)=4 correctly', () => {
    const table = generateTable('x^2', -2, 2, 1);
    expect(table[4].y).toBe('4');
  });
});

describe('Inverse trig functions', () => {
  it('evaluates asin(0.5) in DEG mode = 30', () => {
    setAngleUnit('deg');
    const result = evaluateExpression('asin(0.5)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(30, 0);
    setAngleUnit('rad');
  });

  it('evaluates acos(0.5) in DEG mode = 60', () => {
    setAngleUnit('deg');
    const result = evaluateExpression('acos(0.5)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(60, 0);
    setAngleUnit('rad');
  });

  it('evaluates atan(1) in DEG mode = 45', () => {
    setAngleUnit('deg');
    const result = evaluateExpression('atan(1)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(45, 0);
    setAngleUnit('rad');
  });
});

describe('Nested trig functions', () => {
  it('evaluates sin(cos(30)) in DEG mode', () => {
    setAngleUnit('deg');
    const result = evaluateExpression('sin(cos(30))');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    const cosVal = Math.cos((30 * Math.PI) / 180);
    const expected = Math.sin((cosVal * Math.PI) / 180);
    expect(num).toBeCloseTo(expected, 4);
    setAngleUnit('rad');
  });
});

describe('NaN and error handling', () => {
  it('returns NaN for 0/0', () => {
    const result = evaluateExpression('0/0');
    expect(result.result).toBe('NaN');
  });

  it('returns friendly error for invalid input', () => {
    const result = evaluateExpression('xyz + 1');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('solve2 edge cases', () => {
  it('handles a=0 (linear equation)', () => {
    const result = evaluateExpression('solve2(0,2,-4)', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('2');
  });

  it('handles a=0,b=0 (no solution)', () => {
    const result = evaluateExpression('solve2(0,0,5)', 'solve');
    expect(result.success).toBe(false);
  });
});

describe('solveLinear3', () => {
  it('solves unit matrix system x=y=z=1', () => {
    const result = evaluateExpression('solveLinear3(1,0,0,1,0,1,0,1,0,0,1,1)', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('1');
  });

  it('solves a concrete 3x3 system', () => {
    const result = evaluateExpression('solveLinear3(1,1,1,6,1,2,3,14,2,1,3,13)', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('1');
    expect(result.result).toContain('2');
    expect(result.result).toContain('3');
  });
});

describe('solve3 edge cases', () => {
  it('handles a=0 (falls back to quadratic)', () => {
    const result = evaluateExpression('solve3(0,1,0,-1)', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('1');
  });

  it('handles a=0,b=0 (falls back to linear)', () => {
    const result = evaluateExpression('solve3(0,0,2,-4)', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('2');
  });
});

describe('Calculus functions', () => {
  it('calculates derivative of x^2 at x=3', () => {
    const result = evaluateExpression('d/dx(x^2, x, 3)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(6, 0);
  });

  it('calculates derivative of sin(x) at x=0', () => {
    const result = evaluateExpression('d/dx(sin(x), x, 0)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(1, 0);
  });

  it('calculates definite integral of x^2 from 0 to 1', () => {
    const result = evaluateExpression('integrate(x^2, x, 0, 1)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(1 / 3, 2);
  });

  it('calculates definite integral of sin(x) from 0 to 3.14159', () => {
    const result = evaluateExpression('integrate(sin(x), x, 0, 3.14159)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(2, 0);
  });

  it('calculates summation of i^2 from 1 to 5', () => {
    const result = evaluateExpression('sum(i^2, i, 1, 5)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('55');
  });

  it('calculates product of i from 1 to 5', () => {
    const result = evaluateExpression('product(i, i, 1, 5)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('120');
  });
});

describe('Hyperbolic functions', () => {
  it('calculates sinh(1)', () => {
    const result = evaluateExpression('sinh(1)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(Math.sinh(1), 3);
  });

  it('calculates cosh(0)', () => {
    const result = evaluateExpression('cosh(0)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('1');
  });

  it('calculates tanh(1)', () => {
    const result = evaluateExpression('tanh(1)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(Math.tanh(1), 3);
  });
});

describe('Number theory functions', () => {
  it('calculates gcd(12, 18) = 6', () => {
    const result = evaluateExpression('gcd(12, 18)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('6');
  });

  it('calculates lcm(4, 6) = 12', () => {
    const result = evaluateExpression('lcm(4, 6)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('12');
  });

  it('factorizes 12', () => {
    const result = evaluateExpression('factorize(12)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('2');
    expect(result.result).toContain('3');
  });
});

describe('Advanced statistics', () => {
  it('calculates linear regression', () => {
    const result = evaluateExpression('linReg([1,2,3],[2,4,6])', 'stats');
    expect(result.success).toBe(true);
    expect(result.result).toContain('2');
  });

  it('calculates quadratic regression', () => {
    const result = evaluateExpression('quadReg([1,2,3],[1,4,9])', 'stats');
    expect(result.success).toBe(true);
    expect(result.result).toContain('1');
  });

  it('calculates exponential regression', () => {
    const result = evaluateExpression('expReg([0,1,2],[1,2.7,7.4])', 'stats');
    expect(result.success).toBe(true);
    expect(result.result).toContain('e');
  });

  it('calculates normal CDF', () => {
    const result = evaluateExpression('normCDF(0,0,1)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.5, 2);
  });

  it('calculates binomial PMF', () => {
    const result = evaluateExpression('binomPMF(2,5,0.5)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.3125, 2);
  });

  it('calculates Poisson PMF', () => {
    const result = evaluateExpression('poissonPMF(2,3)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.224, 2);
  });
});

describe('Variable storage', () => {
  it('stores and retrieves variable A', () => {
    const result = evaluateExpression('A=5');
    expect(result.success).toBe(true);
    expect(result.result).toContain('5');
  });

  it('uses variable in expression', () => {
    evaluateExpression('A=10');
    const result = evaluateExpression('A+5');
    expect(result.success).toBe(true);
    expect(result.result).toBe('15');
  });

  it('calculates with multiple variables', () => {
    evaluateExpression('A=3');
    evaluateExpression('B=4');
    const result = evaluateExpression('A^2+B^2');
    expect(result.success).toBe(true);
    expect(result.result).toBe('25');
  });
});

describe('Custom functions', () => {
  it('defines and calls custom function f(x)', () => {
    evaluateExpression('f(x)=x^2');
    const result = evaluateExpression('f(3)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('9');
  });

  it('defines and calls custom function g(t)', () => {
    evaluateExpression('g(t)=t+1');
    const result = evaluateExpression('g(5)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('6');
  });
});

describe('Multiple statements', () => {
  it('executes multiple statements with colon', () => {
    const result = evaluateExpression('A=5:B=10:A+B');
    expect(result.success).toBe(true);
    expect(result.result).toBe('15');
  });

  it('returns last result of multiple statements', () => {
    const result = evaluateExpression('1+2:3+4:5+6');
    expect(result.success).toBe(true);
    expect(result.result).toBe('11');
  });
});

describe('Inequality solving', () => {
  it('solves quadratic inequality x^2 > 1', () => {
    const result = evaluateExpression('solveIneq(1,0,-1,">")', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('1');
  });
});

describe('DMS conversion', () => {
  it('converts decimal to DMS', () => {
    const result = evaluateExpression('toDMS(30.5)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('30');
    expect(result.result).toContain('30');
  });

  it('converts DMS to decimal', () => {
    const result = evaluateExpression('toDecimal(30,30,0)');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(30.5, 1);
  });
});

describe('Uniform distribution', () => {
  it('calculates uniform PDF', () => {
    const result = evaluateExpression('uniformPDF(0.5,0,1)', 'stats');
    expect(result.success).toBe(true);
    expect(result.result).toBe('1');
  });

  it('calculates uniform CDF', () => {
    const result = evaluateExpression('uniformCDF(0.5,0,1)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.5, 2);
  });
});

describe('Exponential distribution', () => {
  it('calculates exponential PDF', () => {
    const result = evaluateExpression('expPDF(1,2)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.27, 1);
  });

  it('calculates exponential CDF', () => {
    const result = evaluateExpression('expCDF(1,2)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.86, 1);
  });
});

describe('Verify mode', () => {
  it('verifies correct equation 3*?=12 with ?=4', () => {
    const result = evaluateExpression('verify(3*?,12,4)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('Correct');
  });

  it('verifies incorrect equation 3*?=12 with ?=5', () => {
    const result = evaluateExpression('verify(3*?,12,5)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('15');
  });

  it('verifies quadratic equation with placeholder', () => {
    const result = evaluateExpression('verify(?^2-4,0,2)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('Correct');
  });

  it('verifies equation with ? on both sides', () => {
    const result = evaluateExpression('verify(?+1,?+1,100)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('Correct');
  });
});

describe('Math Box - Dice simulation', () => {
  it('rolls correct number of dice', () => {
    const result = evaluateExpression('dice(5)');
    expect(result.success).toBe(true);
    // Should contain 5 comma-separated values
    const match = result.result.match(/\[([^\]]+)\]/);
    expect(match).not.toBeNull();
    const rolls = match[1].split(',');
    expect(rolls.length).toBe(5);
    rolls.forEach(r => {
      const n = parseInt(r);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    });
  });

  it('rolls single die', () => {
    const result = evaluateExpression('dice(1)');
    expect(result.success).toBe(true);
    const match = result.result.match(/\[([^\]]+)\]/);
    expect(match).not.toBeNull();
    const n = parseInt(match[1]);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(6);
  });

  it('shows frequency summary', () => {
    const result = evaluateExpression('dice(10)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('1:');
  });
});

describe('Math Box - Coin simulation', () => {
  it('flips correct number of coins', () => {
    const result = evaluateExpression('coin(10)');
    expect(result.success).toBe(true);
    expect(result.result).toContain('H:');
    expect(result.result).toContain('T:');
  });

  it('flips single coin', () => {
    const result = evaluateExpression('coin(1)');
    expect(result.success).toBe(true);
    const hasH = result.result.includes('H:');
    const hasT = result.result.includes('T:');
    expect(hasH || hasT).toBe(true);
  });

  it('H and T counts sum to n', () => {
    const result = evaluateExpression('coin(20)');
    expect(result.success).toBe(true);
    const hMatch = result.result.match(/H:(\d+)/);
    const tMatch = result.result.match(/T:(\d+)/);
    expect(hMatch).not.toBeNull();
    expect(tMatch).not.toBeNull();
    expect(parseInt(hMatch[1]) + parseInt(tMatch[1])).toBe(20);
  });
});

describe('Constants library expansion', () => {
  it('has at least 40 constants', () => {
    expect(CONSTANTS.length).toBeGreaterThanOrEqual(40);
  });

  it('contains Stefan-Boltzmann constant', () => {
    const results = searchConstants('斯特藩');
    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe('σ');
  });

  it('contains Rydberg constant', () => {
    const results = searchConstants('里德伯');
    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe('R∞');
  });

  it('contains Bohr radius', () => {
    const results = searchConstants('玻尔半径');
    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe('a₀');
  });

  it('contains fine-structure constant', () => {
    const results = searchConstants('精细结构');
    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe('α');
  });

  it('contains Euler-Mascheroni constant', () => {
    const results = searchConstants('欧拉');
    expect(results.length).toBe(1);
    expect(results[0].symbol).toBe('γ');
  });

  it('contains Earth radius', () => {
    const results = searchConstants('地球半径');
    expect(results.length).toBe(1);
    expect(results[0].category).toBe('天文');
  });

  it('contains Moon mass', () => {
    const results = searchConstants('月球质量');
    expect(results.length).toBe(1);
    expect(results[0].category).toBe('天文');
  });

  it('search by category works', () => {
    const results = searchConstants('天文');
    expect(results.length).toBeGreaterThanOrEqual(6);
  });
});

describe('Quartic equation solving', () => {
  it('solves x^4 - 10x^2 + 9 = 0 (roots ±1, ±3)', () => {
    const result = evaluateExpression('solve4(1,0,-10,0,9)', 'solve');
    expect(result.success).toBe(true);
    expect(result.result).toContain('1');
    expect(result.result).toContain('3');
  });
});

describe('Quartic inequality solving', () => {
  it('solves x^4 - 5x^2 + 4 > 0', () => {
    const result = evaluateExpression('solveIneq(1,0,-5,0,4,">")', 'solve');
    expect(result.success).toBe(true);
  });
});

describe('Power regression', () => {
  it('calculates power regression', () => {
    const result = evaluateExpression('powerReg([1,2,3,4],[1,4,9,16])', 'stats');
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });
});

describe('Logarithmic regression', () => {
  it('calculates logarithmic regression', () => {
    const result = evaluateExpression('logReg([1,2,3,4,5],[0,0.69,1.1,1.39,1.61])', 'stats');
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });
});

describe('Logistic regression', () => {
  it('calculates logistic regression', () => {
    const result = evaluateExpression(
      'logisticReg([0,1,2,3,4,5],[0.1,0.3,0.6,0.8,0.9,0.95])',
      'stats'
    );
    expect(result.success).toBe(true);
    expect(result.result).toBeDefined();
  });
});

describe('Inverse normal CDF', () => {
  it('invNorm(0.5,0,1) = 0', () => {
    const result = evaluateExpression('invNorm(0.5,0,1)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0, 1);
  });

  it('invNorm(0.975,0,1) ≈ 1.96', () => {
    const result = evaluateExpression('invNorm(0.975,0,1)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(1.96, 1);
  });
});

describe('Binomial CDF', () => {
  it('binomCDF(2,5,0.5) correct value', () => {
    const result = evaluateExpression('binomCDF(2,5,0.5)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.5, 1);
  });
});

describe('Poisson CDF', () => {
  it('poissonCDF(2,3) correct value', () => {
    const result = evaluateExpression('poissonCDF(2,3)', 'stats');
    expect(result.success).toBe(true);
    const num = parseFloat(result.result);
    expect(num).toBeCloseTo(0.423, 1);
  });
});

describe('Variable storage - extended', () => {
  afterAll(() => {
    evaluateExpression('A=0:B=0:C=0');
  });

  it('stores variable Z', () => {
    const result = evaluateExpression('Z=99');
    expect(result.success).toBe(true);
    expect(result.result).toContain('99');
  });

  it('retrieves variable Z', () => {
    evaluateExpression('Z=42');
    const result = evaluateExpression('Z');
    expect(result.success).toBe(true);
    expect(result.result).toBe('42');
  });
});

describe('Custom functions - extended', () => {
  it('defines and calls function h(x)', () => {
    evaluateExpression('h(x)=2*x+1');
    const result = evaluateExpression('h(5)');
    expect(result.success).toBe(true);
    expect(result.result).toBe('11');
  });
});
