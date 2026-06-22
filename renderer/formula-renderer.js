import katex from 'katex';

/**
 * Convert a raw calculator input string into a KaTeX-renderable expression.
 */
export function inputToLatex(input) {
  if (!input || input.trim() === '') {
    return '';
  }

  let expr = input;
  const cursorPos = expr.indexOf('\u200B');
  if (cursorPos !== -1) {
    expr = expr.replace(/\u200B/g, '');
  }

  // Replace display operators
  expr = expr.replace(/×/g, '\\cdot ');
  expr = expr.replace(/÷/g, '\\div ');
  expr = expr.replace(/−/g, '-');

  // Base prefixes (before constants and implicit mult)
  expr = expr.replace(/\b0x([0-9A-Fa-f]+)\b/g, '\\text{0x$1}');
  expr = expr.replace(/\b0b([01]+)\b/g, '\\text{0b$1}');
  expr = expr.replace(/\b0o([0-7]+)\b/g, '\\text{0o$1}');

  // Unit conversion arrow
  expr = expr.replace(/\bto\b/g, '\\to ');

  // Constants (use lookbehind that allows digit prefix: 2pi → 2\pi)
  expr = expr.replace(/(?<![a-zA-Z_])pi(?![a-zA-Z_])/g, '\\pi');
  expr = expr.replace(/(?<![a-zA-Z_])deg(?![a-zA-Z_])/g, '^{\\circ}');
  expr = expr.replace(/(?<![a-zA-Z_])grad(?![a-zA-Z_])/g, '^{g}');
  expr = expr.replace(/(?<![a-zA-Z_])e(?![a-zA-Z_0-9])/g, 'e');
  expr = expr.replace(/(?<![a-zA-Z_])i(?![a-zA-Z_0-9])/g, 'i');

  // Functions with special LaTeX names
  expr = expr.replace(/\bsin\(/g, '\\sin(');
  expr = expr.replace(/\bcos\(/g, '\\cos(');
  expr = expr.replace(/\btan\(/g, '\\tan(');
  expr = expr.replace(/\basin\(/g, '\\arcsin(');
  expr = expr.replace(/\bacos\(/g, '\\arccos(');
  expr = expr.replace(/\batan\(/g, '\\arctan(');
  expr = expr.replace(/\bsinh\(/g, '\\sinh(');
  expr = expr.replace(/\bcosh\(/g, '\\cosh(');
  expr = expr.replace(/\btanh\(/g, '\\tanh(');
  expr = expr.replace(/\basinh\(/g, '\\text{arcsinh}(');
  expr = expr.replace(/\bacosh\(/g, '\\text{arccosh}(');
  expr = expr.replace(/\batanh\(/g, '\\text{arctanh}(');
  expr = expr.replace(/\blog10\(/g, '\\log_{10}(');
  expr = expr.replace(/\blog\(/g, '\\log(');
  expr = expr.replace(/\bln\(/g, '\\ln(');
  expr = expr.replace(/\bsqrt\(/g, '\\sqrt(');
  expr = expr.replace(/\bcbrt\(/g, '\\sqrt[3](');
  expr = expr.replace(/\bnPr\(/g, '\\text{P}(');
  expr = expr.replace(/\bnCr\(/g, '\\text{C}(');
  expr = expr.replace(/\brand\(/g, '\\text{rand}(');
  expr = expr.replace(/\bround\(/g, '\\text{round}(');
  expr = expr.replace(/\bgcd\(/g, '\\text{gcd}(');
  expr = expr.replace(/\blcm\(/g, '\\text{lcm}(');
  expr = expr.replace(/\bfactorize\(/g, '\\text{factorize}(');

  // Calculus functions
  expr = expr.replace(/\bd\/dx\(/g, '\\frac{d}{dx}(');
  expr = expr.replace(/\bintegrate\(/g, '\\int(');
  expr = expr.replace(/\bsum\(/g, '\\sum(');
  expr = expr.replace(/\bproduct\(/g, '\\prod(');

  // Regression and distribution functions
  expr = expr.replace(/\blinReg\(/g, '\\text{linReg}(');
  expr = expr.replace(/\bquadReg\(/g, '\\text{quadReg}(');
  expr = expr.replace(/\bexpReg\(/g, '\\text{expReg}(');
  expr = expr.replace(/\bnormCDF\(/g, '\\text{normCDF}(');
  expr = expr.replace(/\bbinomPMF\(/g, '\\text{binomPMF}(');
  expr = expr.replace(/\bpoissonPMF\(/g, '\\text{poissonPMF}(');
  expr = expr.replace(/\bsolveIneq\(/g, '\\text{solveIneq}(');
  expr = expr.replace(/\btoDMS\(/g, '\\text{toDMS}(');
  expr = expr.replace(/\btoDecimal\(/g, '\\text{toDecimal}(');
  expr = expr.replace(/\buniformPDF\(/g, '\\text{uniformPDF}(');
  expr = expr.replace(/\buniformCDF\(/g, '\\text{uniformCDF}(');
  expr = expr.replace(/\bexpPDF\(/g, '\\text{expPDF}(');
  expr = expr.replace(/\bexpCDF\(/g, '\\text{expCDF}(');

  // Custom functions
  expr = expr.replace(/\bf\(/g, 'f(');
  expr = expr.replace(/\bg\(/g, 'g(');
  expr = expr.replace(/\bh\(/g, 'h(');

  // Delimiter-matched functions: abs, floor, ceil, norm, mag
  expr = replaceDelimitedFunc(expr, 'abs', '\\left|', '\\right|');
  expr = replaceDelimitedFunc(expr, 'floor', '\\lfloor ', '\\rfloor');
  expr = replaceDelimitedFunc(expr, 'ceil', '\\lceil ', '\\rceil');
  expr = replaceDelimitedFunc(expr, 'norm', '\\left\\|', '\\right\\|');
  expr = replaceDelimitedFunc(expr, 'mag', '\\left\\|', '\\right\\|');

  // Vector functions
  expr = expr.replace(/\bdot\(/g, '\\vec{a} \\cdot \\vec{b}(');
  expr = expr.replace(/\bcross\(/g, '\\vec{a} \\times \\vec{b}(');

  // Equation solvers
  expr = expr.replace(/\bsolve2\(/g, '\\text{solve2}(');
  expr = expr.replace(/\bsolve3\(/g, '\\text{solve3}(');
  expr = expr.replace(/\bsolveLinear2\(/g, '\\text{solveLinear2}(');
  expr = expr.replace(/\bsolveLinear3\(/g, '\\text{solveLinear3}(');

  // Implicit multiplication (after all replacements, no letter-based rule)
  expr = expr.replace(/(\d)(\\)/g, '$1\\cdot $2');
  expr = expr.replace(/(\d)(\()/g, '$1\\cdot $2');
  expr = expr.replace(/(\))(\d)/g, '$1\\cdot $2');
  expr = expr.replace(/(\))(\()/g, '$1\\cdot $2');
  expr = expr.replace(/(\))([a-zA-Z\\])/g, '$1\\cdot $2');

  // Powers: handle nested parentheses for exponent
  expr = processPowers(expr);

  // Fractions: a/b -> \frac{a}{b}
  expr = processFractions(expr);

  // Factorial
  expr = expr.replace(/!/g, '{!}');

  // Matrix and vector formatting
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
