import { getAngleUnit } from '../calculator.js';
import { escapeHtml, escapeAttr } from '../utils/escape.js';

const MODE_HELPERS = {
  standard: [
    { insert: 'i', label: 'i' },
    { insert: 'e', label: 'e' },
    { insert: 'pi', label: 'π' },
    { insert: '!', label: '!' },
    { insert: '%', label: '%' },
    { insert: 'nPr(', label: 'nPr' },
    { insert: 'nCr(', label: 'nCr' },
    { insert: 'rand()', label: 'Rand' },
    { insert: 'randInt(', label: 'RanInt' },
    { insert: 'dice(', label: 'Dice' },
    { insert: 'coin(', label: 'Coin' },
    { insert: 'sinh(', label: 'sinh' },
    { insert: 'cosh(', label: 'cosh' },
    { insert: 'tanh(', label: 'tanh' },
    { insert: 'gcd(', label: 'gcd' },
    { insert: 'lcm(', label: 'lcm' },
    { insert: 'factorize(', label: 'factor' },
    { insert: 'toDMS(', label: 'toDMS' },
    { insert: 'toDecimal(', label: 'toDec' },
    { insert: 'polar(', label: 'polar' },
    { insert: 'rect(', label: 'rect' },
    { insert: 'ratio(', label: 'ratio' },
    { insert: 'verify(', label: 'verify' },
    { insert: '?', label: '?' },
    { insert: 'S_D', label: 'S⇔D' },
    { insert: 'rnd(', label: 'RND' },
    { insert: ' and ', label: 'AND' },
    { insert: ' or ', label: 'OR' },
    { insert: 'not(', label: 'NOT' },
    { insert: 'ans', label: 'Ans' }
  ],
  complex: [
    { insert: 'i', label: 'i' },
    { insert: 'e', label: 'e' },
    { insert: 'pi', label: 'π' },
    { insert: 'abs(', label: '|z|' },
    { insert: 'sqrt(', label: '√' },
    { insert: 're(', label: 'Re' },
    { insert: 'im(', label: 'Im' },
    { insert: 'arg(', label: 'Arg' },
    { insert: 'conj(', label: 'Conj' },
    { insert: 'polar(', label: 'polar' },
    { insert: 'rect(', label: 'rect' },
    { insert: 'ans', label: 'Ans' }
  ],
  matrix: [
    { insert: '[[', label: '[[' },
    { insert: ']]', label: ']]' },
    { insert: ',', label: ',' },
    { insert: 'det(', label: 'det' },
    { insert: 'inv(', label: 'inv' },
    { insert: 'transpose(', label: 'T' },
    { insert: 'trace(', label: 'tr' },
    { insert: 'eig(', label: 'eig' },
    { insert: 'ans', label: 'Ans' }
  ],
  vector: [
    { insert: '[', label: '[' },
    { insert: ']', label: ']' },
    { insert: ',', label: ',' },
    { insert: 'dot(', label: 'dot' },
    { insert: 'cross(', label: 'cross' },
    { insert: 'norm(', label: 'norm' },
    { insert: 'unit(', label: 'unit' },
    { insert: 'proj(', label: 'proj' },
    { insert: 'ans', label: 'Ans' }
  ],
  solve: [
    { insert: 'solve2(1,', label: '一元二次' },
    { insert: 'solve3(1,', label: '一元三次' },
    { insert: 'solve4(1,', label: '一元四次' },
    { insert: 'solveLinear2(1,', label: '二元一次' },
    { insert: 'solveLinear3(1,', label: '三元一次' },
    { insert: 'solveLinear4(1,', label: '四元一次' },
    { insert: 'solveIneq(1,0,-1,', label: '不等式' },
    { insert: '=', label: '=' },
    { insert: 'x', label: 'x' },
    { insert: 'y', label: 'y' },
    { insert: 'z', label: 'z' },
    { insert: 'w', label: 'w' },
    { insert: 'ans', label: 'Ans' }
  ],
  base: [
    { insert: 'bin(', label: 'BIN' },
    { insert: 'oct(', label: 'OCT' },
    { insert: 'dec(', label: 'DEC' },
    { insert: 'hex(', label: 'HEX' },
    { insert: 'A', label: 'A', hex: true },
    { insert: 'B', label: 'B', hex: true },
    { insert: 'C', label: 'C', hex: true },
    { insert: 'D', label: 'D', hex: true },
    { insert: 'E', label: 'E', hex: true },
    { insert: 'F', label: 'F', hex: true },
    { insert: '&', label: 'AND' },
    { insert: '|', label: 'OR' },
    { insert: '^^', label: 'XOR' },
    { insert: '~', label: 'NOT' },
    { insert: '<<', label: '<<' },
    { insert: '>>', label: '>>' },
    { insert: 'int(', label: 'INT' },
    { insert: 'frac(', label: 'FRAC' },
    { insert: 'ans', label: 'Ans' }
  ],
  convert: [
    { insert: ' to ', label: '→' },
    { insert: 'cm', label: 'cm' },
    { insert: 'm', label: 'm' },
    { insert: 'km', label: 'km' },
    { insert: 'mm', label: 'mm' },
    { insert: 'in', label: 'in' },
    { insert: 'ft', label: 'ft' },
    { insert: 'mi', label: 'mi' },
    { insert: 'kg', label: 'kg' },
    { insert: 'g', label: 'g' },
    { insert: 'lb', label: 'lb' },
    { insert: 'oz', label: 'oz' },
    { insert: 's', label: 's' },
    { insert: 'min', label: 'min' },
    { insert: 'h', label: 'h' },
    { insert: 'day', label: 'day' },
    { insert: 'year', label: 'year' },
    { insert: 'm/s', label: 'm/s' },
    { insert: 'km/h', label: 'km/h' },
    { insert: 'mph', label: 'mph' },
    { insert: 'knot', label: 'knot' },
    { insert: 'm^2', label: 'm²' },
    { insert: 'km^2', label: 'km²' },
    { insert: 'ha', label: 'ha' },
    { insert: 'acre', label: 'acre' },
    { insert: 'm^3', label: 'm³' },
    { insert: 'L', label: 'L' },
    { insert: 'mL', label: 'mL' },
    { insert: 'gal', label: 'gal' },
    { insert: 'degF', label: '°F' },
    { insert: 'degC', label: '°C' },
    { insert: 'K', label: 'K' },
    { insert: 'Pa', label: 'Pa' },
    { insert: 'kPa', label: 'kPa' },
    { insert: 'MPa', label: 'MPa' },
    { insert: 'bar', label: 'bar' },
    { insert: 'atm', label: 'atm' },
    { insert: 'psi', label: 'psi' },
    { insert: 'J', label: 'J' },
    { insert: 'kJ', label: 'kJ' },
    { insert: 'cal', label: 'cal' },
    { insert: 'kcal', label: 'kcal' },
    { insert: 'eV', label: 'eV' },
    { insert: 'kWh', label: 'kWh' },
    { insert: 'W', label: 'W' },
    { insert: 'kW', label: 'kW' },
    { insert: 'hp', label: 'hp' },
    { insert: 'bit', label: 'bit' },
    { insert: 'byte', label: 'byte' },
    { insert: 'kB', label: 'kB' },
    { insert: 'MB', label: 'MB' },
    { insert: 'GB', label: 'GB' },
    { insert: 'TB', label: 'TB' },
    { insert: 'T', label: 'T' },
    { insert: 'Gauss', label: 'Gauss' },
    { insert: 'Hz', label: 'Hz' },
    { insert: 'kHz', label: 'kHz' },
    { insert: 'MHz', label: 'MHz' },
    { insert: 'GHz', label: 'GHz' },
    { insert: 'atm', label: 'atm' },
    { insert: 'bar', label: 'bar' },
    { insert: 'psi', label: 'psi' },
    { insert: 'mmHg', label: 'mmHg' },
    { insert: 'W', label: 'W' },
    { insert: 'kW', label: 'kW' },
    { insert: 'hp', label: 'hp' },
    { insert: 'J', label: 'J' },
    { insert: 'kJ', label: 'kJ' },
    { insert: 'cal', label: 'cal' },
    { insert: 'kcal', label: 'kcal' },
    { insert: 'eV', label: 'eV' },
    { insert: 'kWh', label: 'kWh' },
    { insert: 'N', label: 'N' },
    { insert: 'rad', label: 'rad' },
    { insert: 'deg', label: 'deg' }
  ],
  stats: [
    { insert: 'mean([', label: 'mean' },
    { insert: 'median([', label: 'median' },
    { insert: 'std([', label: 'std' },
    { insert: 'variance([', label: 'var' },
    { insert: 'sum([', label: 'sum' },
    { insert: 'min([', label: 'min' },
    { insert: 'max([', label: 'max' },
    { insert: 'linReg([', label: 'linReg' },
    { insert: 'quadReg([', label: 'quadReg' },
    { insert: 'expReg([', label: 'expReg' },
    { insert: 'powerReg([', label: 'powReg' },
    { insert: 'logReg([', label: 'logReg' },
    { insert: 'logisticReg([', label: 'logiReg' },
    { insert: 'normCDF(', label: 'normCDF' },
    { insert: 'invNorm(', label: 'invNorm' },
    { insert: 'binomPMF(', label: 'binomPMF' },
    { insert: 'binomCDF(', label: 'binomCDF' },
    { insert: 'poissonPMF(', label: 'poissonPMF' },
    { insert: 'poissonCDF(', label: 'poissonCDF' },
    { insert: 'uniformPDF(', label: 'uniPDF' },
    { insert: 'uniformCDF(', label: 'uniCDF' },
    { insert: 'expPDF(', label: 'expPDF' },
    { insert: 'expCDF(', label: 'expCDF' },
    { insert: ',', label: ',' },
    { insert: 'ans', label: 'Ans' }
  ],
  calculus: [
    { insert: 'd/dx(', label: 'd/dx' },
    { insert: 'integrate(', label: '∫' },
    { insert: 'sum(', label: 'Σ' },
    { insert: 'product(', label: 'Π' },
    { insert: 'x', label: 'x' },
    { insert: ',', label: ',' },
    { insert: 'ans', label: 'Ans' }
  ]
};

const FUNC_MAP = {
  sin: 'sin(',
  cos: 'cos(',
  tan: 'tan(',
  sinh: 'sinh(',
  cosh: 'cosh(',
  tanh: 'tanh(',
  asin: 'asin(',
  acos: 'acos(',
  atan: 'atan(',
  asinh: 'asinh(',
  acosh: 'acosh(',
  atanh: 'atanh(',
  log: 'log10(',
  ln: 'ln(',
  sqrt: 'sqrt(',
  cbrt: 'cbrt(',
  abs: 'abs(',
  floor: 'floor(',
  ceil: 'ceil(',
  round: 'round(',
  'x!': 'factorial(',
  π: 'pi',
  deg: 'deg',
  '°': 'deg',
  '→': ' to ',
  nPr: 'nPr(',
  nCr: 'nCr(',
  Rand: 'rand()',
  RanInt: 'randInt(',
  INT: 'int(',
  FRAC: 'frac(',
  det: 'det(',
  inv: 'inv(',
  T: 'transpose(',
  tr: 'trace(',
  eig: 'eig(',
  dot: 'dot(',
  cross: 'cross(',
  norm: 'norm(',
  unit: 'unit(',
  proj: 'proj(',
  mean: 'mean([',
  median: 'median([',
  std: 'std([',
  var: 'variance([',
  sum: 'sum([',
  min: 'min([',
  max: 'max([',
  Re: 're(',
  Im: 'im(',
  Arg: 'arg(',
  Conj: 'conj(',
  polar: 'polar(',
  rect: 'rect(',
  ratio: 'ratio(',
  gcd: 'gcd(',
  lcm: 'lcm(',
  factorize: 'factorize(',
  'd/dx': 'd/dx(',
  '∫': 'integrate(',
  Σ: 'sum(',
  Π: 'product(',
  linReg: 'linReg([',
  quadReg: 'quadReg([',
  expReg: 'expReg([',
  powReg: 'powerReg([',
  logReg: 'logReg([',
  logiReg: 'logisticReg([',
  normCDF: 'normCDF(',
  invNorm: 'invNorm(',
  binomPMF: 'binomPMF(',
  binomCDF: 'binomCDF(',
  poissonPMF: 'poissonPMF(',
  poissonCDF: 'poissonCDF(',
  solveIneq: 'solveIneq(',
  solve4: 'solve4(',
  solveLinear4: 'solveLinear4(',
  toDMS: 'toDMS(',
  toDec: 'toDecimal(',
  uniPDF: 'uniformPDF(',
  uniCDF: 'uniformCDF(',
  expPDF: 'expPDF(',
  expCDF: 'expCDF(',
  f: 'f(',
  g: 'g(',
  h: 'h(',
  AND: '&',
  OR: '|',
  XOR: '^^',
  NOT: '~',
  '<<': '<<',
  '>>': '>>'
};

export function getHelperText(text) {
  return FUNC_MAP[text] || text;
}

export function renderHelperPanel(mode, helperPanel) {
  if (!helperPanel) {
    return;
  }

  const helpers = MODE_HELPERS[mode] || MODE_HELPERS.standard;

  helperPanel.innerHTML = helpers
    .map(
      h =>
        `<button class="helper-btn ${h.hex ? 'hex-only' : ''}" data-insert="${escapeAttr(
          h.insert
        )}" title="插入 ${escapeAttr(h.label)}">${escapeHtml(h.label)}</button>`
    )
    .join('');

  const hasAngle = helperPanel.querySelector('#angle-toggle');
  if (!hasAngle) {
    helperPanel.insertAdjacentHTML(
      'beforeend',
      `<button class="helper-btn" id="angle-toggle" data-insert="" title="角度/弧度/百分度">${getAngleUnit().toUpperCase()}</button>`
    );
  }
}

export function setActiveModeTab(mode) {
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
    tab.setAttribute('aria-selected', tab.dataset.mode === mode ? 'true' : 'false');
  });
}

export function updateBaseKeyboard(base) {
  document.querySelectorAll('.base-num').forEach(btn => {
    const value = btn.dataset.value;
    let enabled = true;

    if (base === 2) {
      enabled = /^[01]$/.test(value);
    } else if (base === 8) {
      enabled = /^[0-7]$/.test(value);
    } else if (base === 16) {
      enabled = /^[0-9A-Fa-f]$/.test(value) || value === '00';
    }

    btn.style.opacity = enabled ? '1' : '0.25';
    btn.style.pointerEvents = enabled ? 'auto' : 'none';
  });

  document.querySelectorAll('.hex-only').forEach(btn => {
    btn.style.display = base === 16 ? 'inline-block' : 'none';
  });
}
