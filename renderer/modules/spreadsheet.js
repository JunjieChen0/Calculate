import { downloadFile } from '../utils/download.js';

const NUM_COLS = 5;
const NUM_ROWS = 20;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E'];

/**
 * 安全的算术表达式求值器（递归下降解析器）
 * 仅支持：数字、+ - * / ^、括号，不允许任何代码执行
 */
function safeArithmeticEval(input) {
  const src = String(input).trim();
  if (src.length === 0) return 0;
  // 仅允许数字、运算符、括号、小数点、空白
  if (!/^[\d\s+\-*/^().eE]+$/.test(src)) {
    throw new Error('表达式包含非法字符');
  }
  let pos = 0;

  function peek() {
    while (pos < src.length && src[pos] === ' ') pos++;
    return pos < src.length ? src[pos] : null;
  }

  function consume() {
    const ch = peek();
    if (ch !== null) pos++;
    return ch;
  }

  function parseNumber() {
    const start = pos;
    while (pos < src.length && src[pos] === ' ') pos++;
    if (pos >= src.length) throw new Error('意外的表达式结尾');

    let hasDigits = false;
    const numStart = pos;

    // 处理正负号
    if (src[pos] === '+' || src[pos] === '-') pos++;

    // 整数部分
    while (pos < src.length && src[pos] >= '0' && src[pos] <= '9') {
      hasDigits = true;
      pos++;
    }

    // 小数部分
    if (pos < src.length && src[pos] === '.') {
      pos++;
      while (pos < src.length && src[pos] >= '0' && src[pos] <= '9') {
        hasDigits = true;
        pos++;
      }
    }

    // 科学计数法
    if (pos < src.length && (src[pos] === 'e' || src[pos] === 'E')) {
      pos++;
      if (pos < src.length && (src[pos] === '+' || src[pos] === '-')) pos++;
      while (pos < src.length && src[pos] >= '0' && src[pos] <= '9') pos++;
    }

    if (!hasDigits) {
      pos = start;
      throw new Error('期望数字');
    }

    const num = parseFloat(src.slice(numStart, pos));
    if (!Number.isFinite(num)) throw new Error('数值溢出');
    return num;
  }

  // expr = term (('+' | '-') term)*
  function parseExpr() {
    let result = parseTerm();
    while (true) {
      const ch = peek();
      if (ch === '+') {
        consume();
        result += parseTerm();
      } else if (ch === '-') {
        consume();
        result -= parseTerm();
      } else {
        break;
      }
    }
    return result;
  }

  // term = power (('*' | '/') power)*
  function parseTerm() {
    let result = parsePower();
    while (true) {
      const ch = peek();
      if (ch === '*') {
        consume();
        result *= parsePower();
      } else if (ch === '/') {
        consume();
        const divisor = parsePower();
        if (divisor === 0) throw new Error('除零错误');
        result /= divisor;
      } else {
        break;
      }
    }
    return result;
  }

  // power = unary ('^' unary)*
  function parsePower() {
    let result = parseUnary();
    if (peek() === '^') {
      consume();
      const exp = parsePower(); // 右结合
      result = Math.pow(result, exp);
    }
    return result;
  }

  // unary = ('-' | '+') unary | primary
  function parseUnary() {
    const ch = peek();
    if (ch === '-') {
      consume();
      return -parseUnary();
    }
    if (ch === '+') {
      consume();
      return parseUnary();
    }
    return parsePrimary();
  }

  // primary = number | '(' expr ')'
  function parsePrimary() {
    const ch = peek();
    if (ch === '(') {
      consume();
      const result = parseExpr();
      if (peek() !== ')') throw new Error('括号不匹配');
      consume();
      return result;
    }
    return parseNumber();
  }

  const result = parseExpr();
  if (pos < src.length) {
    const remaining = src.slice(pos).trim();
    if (remaining.length > 0) {
      throw new Error('表达式解析未完成');
    }
  }
  return result;
}

export class SpreadsheetManager {
  constructor() {
    this.cells = {};
    this.panel = document.getElementById('spreadsheet-panel');
    this.tableEl = document.getElementById('spreadsheet-table');
    this.statusEl = document.getElementById('spreadsheet-status');

    this.init();
  }

  init() {
    if (!this.tableEl) return;
    this.renderGrid();
  }

  renderGrid() {
    // 使用 DocumentFragment 批量构建 DOM，减少重排
    const fragment = document.createDocumentFragment();

    // thead
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const corner = document.createElement('th');
    corner.className = 'ss-corner';
    headerRow.appendChild(corner);
    for (const label of COL_LABELS) {
      const th = document.createElement('th');
      th.className = 'ss-col-header';
      th.textContent = label;
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    fragment.appendChild(thead);

    // tbody
    const tbody = document.createElement('tbody');
    for (let r = 1; r <= NUM_ROWS; r++) {
      const tr = document.createElement('tr');
      const rowHeader = document.createElement('td');
      rowHeader.className = 'ss-row-header';
      rowHeader.textContent = r;
      tr.appendChild(rowHeader);
      for (let c = 0; c < NUM_COLS; c++) {
        const id = `${COL_LABELS[c]}${r}`;
        const td = document.createElement('td');
        td.className = 'ss-cell';
        td.dataset.cell = id;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'ss-input';
        input.dataset.cell = id;
        const span = document.createElement('span');
        span.className = 'ss-display';
        span.dataset.cell = id;
        td.appendChild(input);
        td.appendChild(span);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    fragment.appendChild(tbody);

    this.tableEl.innerHTML = '';
    this.tableEl.appendChild(fragment);

    this.tableEl.addEventListener('input', e => {
      if (e.target.classList.contains('ss-input')) {
        const cellId = e.target.dataset.cell;
        this.cells[cellId] = e.target.value;
        this.recalculate();
      }
    });

    this.tableEl.addEventListener(
      'focus',
      e => {
        if (e.target.classList.contains('ss-input')) {
          const cellId = e.target.dataset.cell;
          e.target.value = this.cells[cellId] || '';
          if (this.statusEl) this.statusEl.textContent = cellId;
        }
      },
      true
    );

    this.tableEl.addEventListener(
      'blur',
      e => {
        if (e.target.classList.contains('ss-input')) {
          this.recalculate();
        }
      },
      true
    );
  }

  getCellValue(cellId) {
    const raw = this.cells[cellId];
    if (raw === undefined || raw === '') return 0;
    if (typeof raw === 'string' && raw.startsWith('=')) {
      return this.evaluateFormula(raw.substring(1));
    }
    const num = Number(raw);
    return isNaN(num) ? 0 : num;
  }

  evaluateFormula(formula) {
    try {
      let expr = formula;

      // Handle range functions BEFORE replacing individual cell references
      expr = expr.replace(/SUM\(([A-E])(\d+):([A-E])(\d+)\)/gi, (_, c1, r1, c2, r2) => {
        return String(
          this.sumRange(c1.toUpperCase(), parseInt(r1), c2.toUpperCase(), parseInt(r2))
        );
      });

      expr = expr.replace(/AVG\(([A-E])(\d+):([A-E])(\d+)\)/gi, (_, c1, r1, c2, r2) => {
        return String(
          this.avgRange(c1.toUpperCase(), parseInt(r1), c2.toUpperCase(), parseInt(r2))
        );
      });

      expr = expr.replace(/COUNT\(([A-E])(\d+):([A-E])(\d+)\)/gi, (_, c1, r1, c2, r2) => {
        return String(
          this.countRange(c1.toUpperCase(), parseInt(r1), c2.toUpperCase(), parseInt(r2))
        );
      });

      expr = expr.replace(/MAX\(([A-E])(\d+):([A-E])(\d+)\)/gi, (_, c1, r1, c2, r2) => {
        return String(
          this.maxRange(c1.toUpperCase(), parseInt(r1), c2.toUpperCase(), parseInt(r2))
        );
      });

      expr = expr.replace(/MIN\(([A-E])(\d+):([A-E])(\d+)\)/gi, (_, c1, r1, c2, r2) => {
        return String(
          this.minRange(c1.toUpperCase(), parseInt(r1), c2.toUpperCase(), parseInt(r2))
        );
      });

      // Now replace remaining individual cell references (A1, B2, etc.) with their values
      expr = expr.replace(/([A-E])(\d+)/gi, (match, col, row) => {
        const id = `${col.toUpperCase()}${row}`;
        return String(this.getCellValue(id));
      });

      // 使用安全的算术求值器（不允许任意代码执行）
      const result = safeArithmeticEval(expr);
      return Number.isFinite(result) ? result : 0;
    } catch {
      return '#ERR';
    }
  }

  getCellsInRange(c1, r1, c2, r2, nonEmptyOnly = false) {
    const ci1 = COL_LABELS.indexOf(c1);
    const ci2 = COL_LABELS.indexOf(c2);
    const minC = Math.min(ci1, ci2);
    const maxC = Math.max(ci1, ci2);
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    const values = [];
    for (let c = minC; c <= maxC; c++) {
      for (let r = minR; r <= maxR; r++) {
        const id = `${COL_LABELS[c]}${r}`;
        const raw = this.cells[id];
        if (nonEmptyOnly && (raw === undefined || raw === '')) continue;
        const v = this.getCellValue(id);
        if (typeof v === 'number' && !isNaN(v)) values.push(v);
      }
    }
    return values;
  }

  sumRange(c1, r1, c2, r2) {
    return this.getCellsInRange(c1, r1, c2, r2).reduce((a, b) => a + b, 0);
  }

  avgRange(c1, r1, c2, r2) {
    const vals = this.getCellsInRange(c1, r1, c2, r2);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }

  countRange(c1, r1, c2, r2) {
    return this.getCellsInRange(c1, r1, c2, r2, true).length;
  }

  maxRange(c1, r1, c2, r2) {
    const vals = this.getCellsInRange(c1, r1, c2, r2);
    return vals.length ? Math.max(...vals) : 0;
  }

  minRange(c1, r1, c2, r2) {
    const vals = this.getCellsInRange(c1, r1, c2, r2);
    return vals.length ? Math.min(...vals) : 0;
  }

  recalculate() {
    if (!this.tableEl) return;
    const displays = this.tableEl.querySelectorAll('.ss-display');
    displays.forEach(el => {
      const cellId = el.dataset.cell;
      const raw = this.cells[cellId];
      if (raw === undefined || raw === '') {
        el.textContent = '';
        return;
      }
      if (typeof raw === 'string' && raw.startsWith('=')) {
        const val = this.evaluateFormula(raw.substring(1));
        el.textContent =
          typeof val === 'number'
            ? Number.isInteger(val)
              ? val.toString()
              : val.toPrecision(8).replace(/\.?0+$/, '')
            : val;
      } else {
        el.textContent = raw;
      }
    });
  }

  exportCSV() {
    const rows = [];
    rows.push(['', 'A', 'B', 'C', 'D', 'E'].join(','));
    for (let r = 1; r <= 20; r++) {
      const row = [r];
      for (const col of ['A', 'B', 'C', 'D', 'E']) {
        const v = this.cells[col + r] || '';
        const escaped = v.includes('"') ? v.replace(/"/g, '""') : v;
        row.push(v.includes(',') || v.includes('"') ? '"' + escaped + '"' : v);
      }
      rows.push(row.join(','));
    }
    downloadFile(rows.join('\n'), 'spreadsheet.csv', 'text/csv');
  }

  exportJSON() {
    const obj = { cells: {} };
    for (const [k, v] of Object.entries(this.cells)) {
      if (v !== '' && v !== undefined) obj.cells[k] = v;
    }
    downloadFile(JSON.stringify(obj, null, 2), 'spreadsheet.json', 'application/json');
  }

  importCSV(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const lines = e.target.result.trim().split(/\r?\n/);
      this.clearAll();
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const row = parseInt(cols[0]);
        if (isNaN(row)) continue;
        for (let c = 1; c < cols.length && c <= 5; c++) {
          const val = cols[c].replace(/^"|"$/g, '').trim();
          if (val !== '') {
            const cellId = 'ABCDE'[c - 1] + row;
            this.cells[cellId] = val;
          }
        }
      }
      this.recalculate();
      if (this.tableEl) {
        this.tableEl.querySelectorAll('.ss-input').forEach(el => {
          const id = el.dataset.cell;
          el.value = this.cells[id] || '';
        });
      }
    };
    reader.readAsText(file);
  }

  importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const obj = JSON.parse(e.target.result);
        this.clearAll();
        if (obj.cells) {
          for (const [k, v] of Object.entries(obj.cells)) {
            this.cells[k] = String(v);
          }
        }
        this.recalculate();
        if (this.tableEl) {
          this.tableEl.querySelectorAll('.ss-input').forEach(el => {
            const id = el.dataset.cell;
            el.value = this.cells[id] || '';
          });
        }
      } catch {
        this.statusEl && (this.statusEl.textContent = 'JSON 解析失败');
      }
    };
    reader.readAsText(file);
  }

  clearAll() {
    this.cells = {};
    if (this.tableEl) {
      this.tableEl.querySelectorAll('.ss-input').forEach(el => {
        el.value = '';
      });
      this.tableEl.querySelectorAll('.ss-display').forEach(el => {
        el.textContent = '';
      });
    }
  }
}
