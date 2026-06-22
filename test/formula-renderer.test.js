import { describe, it, expect } from 'vitest';
import { inputToLatex } from '../renderer/formula-renderer.js';

describe('inputToLatex — empty and whitespace', () => {
  it('returns empty string for null input', () => {
    expect(inputToLatex(null)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(inputToLatex('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(inputToLatex('   ')).toBe('');
  });
});

describe('inputToLatex — ZWSP cursor stripping', () => {
  it('strips ZWSP from input before processing', () => {
    // sqrt with ZWSP cursor inside should still produce \sqrt
    expect(inputToLatex('s\u200Bqrt(5)')).toContain('\\sqrt');
  });

  it('strips multiple ZWSP characters', () => {
    expect(inputToLatex('\u200Bsin\u200B(30)\u200B')).toContain('\\sin');
  });
});

describe('inputToLatex — display operators', () => {
  it('converts × to \\cdot', () => {
    expect(inputToLatex('3×4')).toContain('\\cdot');
  });

  it('converts ÷ to \\div', () => {
    expect(inputToLatex('6÷2')).toContain('\\div');
  });

  it('converts − to -', () => {
    expect(inputToLatex('5−3')).toContain('-');
  });
});

describe('inputToLatex — base prefixes', () => {
  it('wraps hex prefix 0xFF in \\text{}', () => {
    expect(inputToLatex('0xFF')).toContain('\\text{0xFF}');
  });

  it('wraps binary prefix 0b1010 in \\text{}', () => {
    expect(inputToLatex('0b1010')).toContain('\\text{0b1010}');
  });

  it('wraps octal prefix 0o77 in \\text{}', () => {
    expect(inputToLatex('0o77')).toContain('\\text{0o77}');
  });
});

describe('inputToLatex — constants', () => {
  it('replaces pi with \\pi', () => {
    expect(inputToLatex('pi')).toContain('\\pi');
  });

  it('replaces 2pi with 2\\pi (not 2\\cdot pi)', () => {
    const result = inputToLatex('2pi');
    expect(result).toContain('\\pi');
    expect(result).not.toContain('pi}'); // should not leave raw "pi"
  });

  it('replaces deg with ^{\\circ}', () => {
    const result = inputToLatex('90deg');
    // deg → ^{\circ}, then processPowers wraps in ^{...} → ^{{\circ}}
    expect(result).toBe('90^{{\\circ}}');
  });

  it('replaces grad with ^{g}', () => {
    const result = inputToLatex('100grad');
    // grad → ^{g}, then processPowers wraps in ^{...} → ^{{g}}
    expect(result).toBe('100^{{g}}');
  });

  it('does not replace pi inside function names like asin', () => {
    // "asin" does not contain "pi" so this is a basic sanity check
    const result = inputToLatex('asin(0.5)');
    expect(result).toContain('\\arcsin');
    expect(result).not.toContain('\\pi');
  });
});

describe('inputToLatex — function replacements', () => {
  it('converts sin( to \\sin(', () => {
    expect(inputToLatex('sin(30)')).toContain('\\sin(');
  });

  it('converts cos( to \\cos(', () => {
    expect(inputToLatex('cos(60)')).toContain('\\cos(');
  });

  it('converts asin( to \\arcsin(', () => {
    expect(inputToLatex('asin(0.5)')).toContain('\\arcsin(');
  });

  it('converts log10( to \\log_{10}(', () => {
    expect(inputToLatex('log10(100)')).toContain('\\log_{10}(');
  });

  it('converts ln( to \\ln(', () => {
    expect(inputToLatex('ln(1)')).toContain('\\ln(');
  });

  it('converts sqrt( to \\sqrt(', () => {
    expect(inputToLatex('sqrt(4)')).toContain('\\sqrt(');
  });

  it('converts nPr( to \\text{P}(', () => {
    expect(inputToLatex('nPr(5,2)')).toContain('\\text{P}(');
  });

  it('converts nCr( to \\text{C}(', () => {
    expect(inputToLatex('nCr(5,2)')).toContain('\\text{C}(');
  });
});

describe('inputToLatex — delimiter-matched functions', () => {
  it('converts abs(x) to \\left|x\\right|', () => {
    const result = inputToLatex('abs(x)');
    expect(result).toContain('\\left|');
    expect(result).toContain('\\right|');
  });

  it('converts floor(x) to \\lfloor x \\rfloor', () => {
    const result = inputToLatex('floor(x)');
    expect(result).toContain('\\lfloor');
    expect(result).toContain('\\rfloor');
  });

  it('converts ceil(x) to \\lceil x \\rceil', () => {
    const result = inputToLatex('ceil(x)');
    expect(result).toContain('\\lceil');
    expect(result).toContain('\\rceil');
  });

  it('converts norm(v) with double bars', () => {
    const result = inputToLatex('norm(v)');
    expect(result).toContain('\\left\\|');
    expect(result).toContain('\\right\\|');
  });

  it('handles nested parentheses in abs()', () => {
    const result = inputToLatex('abs(x+3)');
    expect(result).toContain('\\left|');
    expect(result).toContain('x+3');
    expect(result).toContain('\\right|');
  });

  it('handles abs() with power: abs(x)^2', () => {
    const result = inputToLatex('abs(x)^2');
    expect(result).toContain('\\left|');
    expect(result).toContain('\\right|');
    expect(result).toContain('^{2}');
  });
});

describe('inputToLatex — implicit multiplication', () => {
  it('adds \\cdot between digit and backslash', () => {
    // 2\pi should become 2\cdot\pi
    const result = inputToLatex('2pi');
    expect(result).toContain('\\cdot');
  });

  it('adds \\cdot between digit and open paren', () => {
    const result = inputToLatex('2(3)');
    expect(result).toContain('\\cdot');
  });

  it('adds \\cdot between close paren and digit', () => {
    const result = inputToLatex('(2)3');
    expect(result).toContain('\\cdot');
  });

  it('adds \\cdot between close and open parens', () => {
    const result = inputToLatex('(2)(3)');
    expect(result).toContain('\\cdot');
  });

  it('adds \\cdot between close paren and letter', () => {
    const result = inputToLatex('(2)x');
    expect(result).toContain('\\cdot');
  });
});

describe('inputToLatex — powers', () => {
  it('wraps simple power in braces: x^2 → x^{2}', () => {
    const result = inputToLatex('x^2');
    expect(result).toContain('^{2}');
  });

  it('handles braced power: x^{2+1}', () => {
    const result = inputToLatex('x^{2+1}');
    expect(result).toContain('^{{2+1}}');
  });

  it('handles parenthesized exponent: x^(n+1)', () => {
    const result = inputToLatex('x^(n+1)');
    expect(result).toContain('^{(n+1)}');
  });

  it('handles function exponent: x^\\sin(y)', () => {
    const result = inputToLatex('x^sin(y)');
    // The exponent reader should consume the full \sin(y) command
    expect(result).toContain('^');
    expect(result).toContain('\\sin');
  });
});

describe('inputToLatex — fractions', () => {
  it('converts a/b to \\frac{a}{b}', () => {
    const result = inputToLatex('a/b');
    expect(result).toContain('\\frac{a}{b}');
  });

  it('converts simple numeric fraction 1/2', () => {
    const result = inputToLatex('1/2');
    expect(result).toContain('\\frac{1}{2}');
  });

  it('converts sin(x)/cos(x) correctly', () => {
    const result = inputToLatex('sin(x)/cos(x)');
    expect(result).toContain('\\frac{');
    expect(result).toContain('\\sin');
    expect(result).toContain('\\cos');
  });

  it('handles braced denominator: a/{b+c}', () => {
    const result = inputToLatex('a/{b+c}');
    expect(result).toContain('\\frac{a}{{b+c}}');
  });

  it('handles parenthesized denominator: a/(b+c)', () => {
    const result = inputToLatex('a/(b+c)');
    expect(result).toContain('\\frac{a}{(b+c)}');
  });
});

describe('inputToLatex — factorial', () => {
  it('wraps ! in braces to avoid LaTeX spacing', () => {
    const result = inputToLatex('5!');
    expect(result).toContain('{!}');
  });
});

describe('inputToLatex — matrix input', () => {
  it('converts [[1,2],[3,4]] to bmatrix', () => {
    const result = inputToLatex('[[1,2],[3,4]]');
    expect(result).toContain('\\begin{bmatrix}');
    expect(result).toContain('\\end{bmatrix}');
  });

  it('replaces commas with & in matrix', () => {
    const result = inputToLatex('[[1,2],[3,4]]');
    expect(result).toContain('&');
  });
});

describe('inputToLatex — equation solvers', () => {
  it('wraps solve2 in \\text{}', () => {
    expect(inputToLatex('solve2(1,2,3)')).toContain('\\text{solve2}');
  });

  it('wraps solve3 in \\text{}', () => {
    expect(inputToLatex('solve3(1,0,0,1)')).toContain('\\text{solve3}');
  });

  it('wraps solveLinear3 in \\text{}', () => {
    expect(inputToLatex('solveLinear3(1,0,0,1,0,1,0,1,0,0,1,1)')).toContain('\\text{solveLinear3}');
  });
});

describe('inputToLatex — unit conversion arrow', () => {
  it('converts "to" to \\to', () => {
    const result = inputToLatex('m to cm');
    expect(result).toContain('\\to');
  });
});

describe('inputToLatex — combined expressions', () => {
  it('handles 2*pi correctly', () => {
    const result = inputToLatex('2*pi');
    expect(result).toContain('\\pi');
    // Note: * is kept as literal, only × is converted to \cdot
  });

  it('handles nested trig: sin(cos(30))', () => {
    const result = inputToLatex('sin(cos(30))');
    expect(result).toContain('\\sin');
    expect(result).toContain('\\cos');
  });

  it('handles complex expression: sin(x)^2 + cos(x)^2', () => {
    const result = inputToLatex('sin(x)^2 + cos(x)^2');
    expect(result).toContain('\\sin');
    expect(result).toContain('\\cos');
    expect(result).toContain('^{2}');
  });
});
