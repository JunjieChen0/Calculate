const NUM_COLS = 5;
const NUM_ROWS = 20;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E'];

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
    let html = '<thead><tr><th class="ss-corner"></th>';
    for (const label of COL_LABELS) {
      html += `<th class="ss-col-header">${label}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (let r = 1; r <= NUM_ROWS; r++) {
      html += `<tr><td class="ss-row-header">${r}</td>`;
      for (let c = 0; c < NUM_COLS; c++) {
        const id = `${COL_LABELS[c]}${r}`;
        html += `<td class="ss-cell" data-cell="${id}"><input type="text" class="ss-input" data-cell="${id}" value="" /><span class="ss-display" data-cell="${id}"></span></td>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';
    this.tableEl.innerHTML = html;

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

      // Replace ^ with ** for exponentiation (JS ^ is bitwise XOR)
      expr = expr.replace(/\^/g, '**');

      // Safe eval using Function constructor (no access to outer scope)
      const result = Function(`"use strict"; return (${expr})`)();
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
