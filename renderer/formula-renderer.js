import katex from 'katex';

const RE_ZERO_WIDTH = /\u200B/g;
const RE_MUL_SIGN = /×/g;
const RE_DIV_SIGN = /÷/g;
const RE_MINUS_SIGN = /−/g;
const RE_HEX_PREFIX = /\b0x([0-9A-Fa-f]+)\b/g;
const RE_BIN_PREFIX = /\b0b([01]+)\b/g;
const RE_OCT_PREFIX = /\b0o([0-7]+)\b/g;
const RE_TO_ARROW = /\bto\b/g;
const RE_PI = /(?<![a-zA-Z_])pi(?![a-zA-Z_])/g;
const RE_DEG = /(?<![a-zA-Z_])deg(?![a-zA-Z_])/g;
const RE_GRAD = /(?<![a-zA-Z_])grad(?![a-zA-Z_])/g;
const RE_E_CONST = /(?<![a-zA-Z_])e(?![a-zA-Z_0-9])/g;
const RE_I_CONST = /(?<![a-zA-Z_])i(?![a-zA-Z_0-9])/g;

const FUNC_REPLACEMENTS = [
  [/\basinh\(/g, '\\text{arcsinh}('],
  [/\bacosh\(/g, '\\text{arccosh}('],
  [/\batanh\(/g, '\\text{arctanh}('],
  [/\basin\(/g, '\\arcsin('],
  [/\bacos\(/g, '\\arccos('],
  [/\batan\(/g, '\\arctan('],
  [/\bsinh\(/g, '\\sinh('],
  [/\bcosh\(/g, '\\cosh('],
  [/\btanh\(/g, '\\tanh('],
  [/\bsin\(/g, '\\sin('],
  [/\bcos\(/g, '\\cos('],
  [/\btan\(/g, '\\tan('],
  [/\blog10\(/g, '\\log_{10}('],
  [/\blog\(/g, '\\log('],
  [/\bln\(/g, '\\ln('],
  [/\bsqrt\(/g, '\\sqrt('],
  [/\bcbrt\(/g, '\\sqrt[3]('],
  [/\bnPr\(/g, '\\text{P}('],
  [/\bnCr\(/g, '\\text{C}('],
  [/\brand\(/g, '\\text{rand}('],
  [/\bround\(/g, '\\text{round}('],
  [/\bgcd\(/g, '\\text{gcd}('],
  [/\blcm\(/g, '\\text{lcm}('],
  [/\bfactorize\(/g, '\\text{factorize}('],
  [/\bd\/dx\(/g, '\\frac{d}{dx}('],
  [/\bintegrate\(/g, '\\int('],
  [/\bsum\(/g, '\\sum('],
  [/\bproduct\(/g, '\\prod('],
  [/\blinReg\(/g, '\\text{linReg}('],
  [/\bquadReg\(/g, '\\text{quadReg}('],
  [/\bexpReg\(/g, '\\text{expReg}('],
  [/\bnormCDF\(/g, '\\text{normCDF}('],
  [/\bbinomPMF\(/g, '\\text{binomPMF}('],
  [/\bpoissonPMF\(/g, '\\text{poissonPMF}('],
  [/\bsolveIneq\(/g, '\\text{solveIneq}('],
  [/\btoDMS\(/g, '\\text{toDMS}('],
  [/\btoDecimal\(/g, '\\text{toDecimal}('],
  [/\buniformPDF\(/g, '\\text{uniformPDF}('],
  [/\buniformCDF\(/g, '\\text{uniformCDF}('],
  [/\bexpPDF\(/g, '\\text{expPDF}('],
  [/\bexpCDF\(/g, '\\text{expCDF}('],
  [/\bf\(/g, 'f('],
  [/\bg\(/g, 'g('],
  [/\bh\(/g, 'h('],
  [/\bdot\(/g, '\\vec{a} \\cdot \\vec{b}('],
  [/\bcross\(/g, '\\vec{a} \\times \\vec{b}('],
  [/\bsolve2\(/g, '\\text{solve2}('],
  [/\bsolve3\(/g, '\\text{solve3}('],
  [/\bsolveLinear2\(/g, '\\text{solveLinear2}('],
  [/\bsolveLinear3\(/g, '\\text{solveLinear3}(']
];

const RE_IMPLICIT_DIGIT_CMD = /(\d)(\\)/g;
const RE_IMPLICIT_DIGIT_PAREN = /(\d)(\()/g;
const RE_IMPLICIT_PAREN_DIGIT = /(\))(\d)/g;
const RE_IMPLICIT_PAREN_PAREN = /(\))(\()/g;
const RE_IMPLICIT_PAREN_ALPHA = /(\))([a-zA-Z\\])/g;
const RE_FACTORIAL = /!/g;

export function inputToLatex(input) {
  if (!input || input.trim() === '') {
    return '';
  }

  if (input.length > 1000) {
    return '\\text{输入过长}';
  }

  let expr = input;
  if (expr.indexOf('\u200B') !== -1) {
    expr = expr.replace(RE_ZERO_WIDTH, '');
  }

  expr = expr.replace(RE_MUL_SIGN, '\\cdot ');
  expr = expr.replace(RE_DIV_SIGN, '\\div ');
  expr = expr.replace(RE_MINUS_SIGN, '-');

  expr = expr.replace(RE_HEX_PREFIX, '\\text{0x$1}');
  expr = expr.replace(RE_BIN_PREFIX, '\\text{0b$1}');
  expr = expr.replace(RE_OCT_PREFIX, '\\text{0o$1}');

  expr = expr.replace(RE_TO_ARROW, '\\to ');

  expr = expr.replace(RE_PI, '\\pi');
  expr = expr.replace(RE_DEG, '^{\\circ}');
  expr = expr.replace(RE_GRAD, '^{g}');
  expr = expr.replace(RE_E_CONST, 'e');
  expr = expr.replace(RE_I_CONST, 'i');

  for (const [re, replacement] of FUNC_REPLACEMENTS) {
    expr = expr.replace(re, replacement);
  }

  expr = replaceDelimitedFunc(expr, 'abs', '\\left|', '\\right|');
  expr = replaceDelimitedFunc(expr, 'floor', '\\lfloor ', '\\rfloor');
  expr = replaceDelimitedFunc(expr, 'ceil', '\\lceil ', '\\rceil');
  expr = replaceDelimitedFunc(expr, 'norm', '\\left\\|', '\\right\\|');
  expr = replaceDelimitedFunc(expr, 'mag', '\\left\\|', '\\right\\|');

  expr = expr.replace(RE_IMPLICIT_DIGIT_CMD, '$1\\cdot $2');
  expr = expr.replace(RE_IMPLICIT_DIGIT_PAREN, '$1\\cdot $2');
  expr = expr.replace(RE_IMPLICIT_PAREN_DIGIT, '$1\\cdot $2');
  expr = expr.replace(RE_IMPLICIT_PAREN_PAREN, '$1\\cdot $2');
  expr = expr.replace(RE_IMPLICIT_PAREN_ALPHA, '$1\\cdot $2');

  expr = processPowers(expr);
  expr = processFractions(expr);

  expr = expr.replace(RE_FACTORIAL, '{!}');

  expr = formatMatrixInput(expr);

  return expr;
}

/**
 * Render LaTeX into a target DOM element.
 */
export function renderFormula(element, latex, options = {}) {
  if (!element || !katex) {
    return;
  }

  try {
    katex.render(latex, element, {
      throwOnError: false,
      displayMode: false,
      ...options
    });
  } catch {
    element.textContent = latex;
  }
}

/**
 * Render a result string with KaTeX if it contains math notation.
 */
export function renderResult(element, result) {
  if (!element || !katex) {
    return;
  }

  if (!result || result === '0') {
    element.textContent = '0';
    return;
  }

  try {
    const latex = resultToLatex(result);
    katex.render(latex, element, {
      throwOnError: false,
      displayMode: false
    });
  } catch {
    element.textContent = result;
  }
}

function processPowers(expr) {
  let result = '';
  let i = 0;

  while (i < expr.length) {
    if (expr[i] === '\\' && expr.slice(i, i + 4) === '\\^{') {
      result += '\\^{';
      i += 3;
      continue;
    }

    if (expr[i] === '^' && (i === 0 || expr[i - 1] !== '\\')) {
      result += '^';
      i++;
      const exponent = readExponent(expr, i);
      result += `{${exponent}}`;
      i += exponent.length;
    } else {
      result += expr[i];
      i++;
    }
  }

  return result;
}

function readExponent(expr, start) {
  if (start >= expr.length) return '';

  if (expr[start] === '{') {
    let depth = 1;
    let j = start + 1;
    while (j < expr.length && depth > 0) {
      if (expr[j] === '{') depth++;
      else if (expr[j] === '}') depth--;
      j++;
    }
    return expr.slice(start, j);
  }

  if (expr[start] === '\\') {
    let j = start + 1;
    while (j < expr.length && /[a-zA-Z]/.test(expr[j])) j++;
    if (j < expr.length && expr[j] === '{') {
      let depth = 1;
      j++;
      while (j < expr.length && depth > 0) {
        if (expr[j] === '{') depth++;
        else if (expr[j] === '}') depth--;
        j++;
      }
    } else if (j < expr.length && expr[j] === '(') {
      let depth = 1;
      j++;
      while (j < expr.length && depth > 0) {
        if (expr[j] === '(') depth++;
        else if (expr[j] === ')') depth--;
        j++;
      }
    }
    return expr.slice(start, j);
  }

  if (expr[start] === '(') {
    let depth = 1;
    let j = start + 1;
    while (j < expr.length && depth > 0) {
      if (expr[j] === '(') depth++;
      else if (expr[j] === ')') depth--;
      j++;
    }
    return expr.slice(start, j);
  }

  let j = start;
  while (j < expr.length && /[^+\-*/=,()\s^]/.test(expr[j])) j++;
  return expr.slice(start, j);
}

function processFractions(expr) {
  let result = '';
  let i = 0;

  while (i < expr.length) {
    if (expr[i] === '/' && i > 0 && i < expr.length - 1) {
      const numStart = findNumeratorStart(result);
      if (numStart >= 0 && numStart < result.length) {
        const numerator = result.slice(numStart);
        let denEnd = i + 1;
        if (denEnd < expr.length && expr[denEnd] === '{') {
          let d = 1;
          denEnd++;
          while (denEnd < expr.length && d > 0) {
            if (expr[denEnd] === '{') d++;
            else if (expr[denEnd] === '}') d--;
            denEnd++;
          }
        } else if (denEnd < expr.length && expr[denEnd] === '\\') {
          denEnd++;
          while (denEnd < expr.length && /[a-zA-Z]/.test(expr[denEnd])) denEnd++;
          if (denEnd < expr.length && expr[denEnd] === '{') {
            let d = 1;
            denEnd++;
            while (denEnd < expr.length && d > 0) {
              if (expr[denEnd] === '{') d++;
              else if (expr[denEnd] === '}') d--;
              denEnd++;
            }
          } else if (denEnd < expr.length && expr[denEnd] === '(') {
            let d = 1;
            denEnd++;
            while (denEnd < expr.length && d > 0) {
              if (expr[denEnd] === '(') d++;
              else if (expr[denEnd] === ')') d--;
              denEnd++;
            }
          }
        } else if (denEnd < expr.length && expr[denEnd] === '(') {
          let d = 1;
          denEnd++;
          while (denEnd < expr.length && d > 0) {
            if (expr[denEnd] === '(') d++;
            else if (expr[denEnd] === ')') d--;
            denEnd++;
          }
        } else {
          while (denEnd < expr.length && /[^+\-*/=,()\s]/.test(expr[denEnd])) denEnd++;
        }

        const denominator = expr.slice(i + 1, denEnd);
        if (numerator && denominator) {
          result = result.slice(0, numStart);
          result += `\\frac{${numerator}}{${denominator}}`;
          i = denEnd;
          continue;
        }
      }
    }
    result += expr[i];
    i++;
  }

  return result;
}

function findNumeratorStart(result) {
  if (result.length === 0) return -1;

  let i = result.length - 1;

  if (result[i] === ')') {
    let depth = 1;
    i--;
    while (i >= 0 && depth > 0) {
      if (result[i] === ')') depth++;
      else if (result[i] === '(') depth--;
      i--;
    }

    while (i >= 0 && result[i] === '}') {
      let braceDepth = 1;
      i--;
      while (i >= 0 && braceDepth > 0) {
        if (result[i] === '}') braceDepth++;
        else if (result[i] === '{') braceDepth--;
        i--;
      }
      while (i >= 0 && /[a-zA-Z\\]/.test(result[i])) i--;
    }

    while (i >= 0 && /[a-zA-Z\\]/.test(result[i])) i--;
    return i + 1;
  }

  while (i >= 0 && /[^+\-*/=,()\s{}]/.test(result[i])) i--;
  return i + 1;
}

function replaceDelimitedFunc(expr, funcName, openDelim, closeDelim) {
  const pattern = new RegExp(`\\b${funcName}\\(`, 'g');
  let result = expr;
  let match;
  let iterations = 0;
  const maxIterations = 50;

  while ((match = pattern.exec(result)) !== null && iterations < maxIterations) {
    iterations++;
    const openIdx = match.index + match[0].length - 1;
    let depth = 1;
    let closeIdx = openIdx + 1;
    while (closeIdx < result.length && depth > 0) {
      if (result[closeIdx] === '(') depth++;
      else if (result[closeIdx] === ')') depth--;
      closeIdx++;
    }
    if (depth !== 0) break;

    const inner = result.slice(openIdx + 1, closeIdx - 1);
    const replacement = `${openDelim}${inner}${closeDelim}`;
    result = result.slice(0, match.index) + replacement + result.slice(closeIdx);
    // Reset lastIndex after string mutation
    pattern.lastIndex = match.index + replacement.length;
  }

  return result;
}

function formatMatrixInput(expr) {
  if (!expr.includes('[')) return expr;

  try {
    const result = expr;
    // Only replace commas inside matrix brackets
    const segments = [];
    let i = 0;
    while (i < result.length) {
      if (result[i] === '[') {
        let depth = 1;
        let j = i + 1;
        while (j < result.length && depth > 0) {
          if (result[j] === '[') depth++;
          else if (result[j] === ']') depth--;
          j++;
        }
        const inner = result.slice(i, j);
        const converted = inner
          .replace(/\[\[/g, '\\begin{bmatrix}')
          .replace(/\]\]/g, '\\end{bmatrix}')
          .replace(/\],\s*\[/g, ' \\\\ ')
          .replace(/\[\s*/g, '\\begin{bmatrix}')
          .replace(/\s*\]/g, '\\end{bmatrix}')
          .replace(/,/g, ' & ');
        segments.push(converted);
        i = j;
      } else {
        segments.push(result[i]);
        i++;
      }
    }
    return segments.join('');
  } catch {
    return expr;
  }
}

function resultToLatex(result) {
  if (!result || result === '0') {
    return '0';
  }

  let latex = String(result);

  // Matrix/vector result formatting
  if (latex.includes('[') && latex.includes(']')) {
    return formatMatrixResult(latex);
  }

  // Complex number
  latex = latex.replace(/\+ /g, '+').replace(/- /g, '-');

  // Infinity
  latex = latex.replace(/∞/g, '\\infty');

  // Scientific notation
  latex = latex.replace(/([\d.]+)e([+-]?\d+)/g, '$1 \\times 10^{$2}');

  // Base prefixes
  latex = latex.replace(/\b0x/g, '\\text{0x}');
  latex = latex.replace(/\b0b/g, '\\text{0b}');
  latex = latex.replace(/\b0o/g, '\\text{0o}');

  return latex;
}

function formatMatrixResult(latex) {
  try {
    let normalized = latex.replace(/\[\s*\[/g, '[[').replace(/\]\s*\]/g, ']]');
    normalized = normalized.replace(/\],\s*\[/g, '],[');

    return normalized
      .replace(/\[\[/g, '\\begin{bmatrix}')
      .replace(/\]\]/g, '\\end{bmatrix}')
      .replace(/\],\[/g, ' \\\\ ')
      .replace(/, /g, ' & ')
      .replace(/,/g, ' & ');
  } catch {
    return latex;
  }
}
