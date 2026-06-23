/**
 * 统计列表编辑器模块
 * 提供可视化的 x/y 数据列表编辑界面
 */

export class StatsEditor {
  constructor(onInsert) {
    this.onInsert = onInsert;
    this.panel = document.getElementById('stats-editor-panel');
    this.body = document.getElementById('stats-editor-body');
    this.addRowBtn = document.getElementById('stats-add-row');
    this.clearBtn = document.getElementById('stats-clear');
    this.insertBtn = document.getElementById('stats-insert');
    this.rows = [];
    this.maxRows = 100;

    this.addRowBtn?.addEventListener('click', () => this.addRow());
    this.clearBtn?.addEventListener('click', () => this.clear());
    this.insertBtn?.addEventListener('click', () => this.insertToInput());

    // 初始化：5行
    for (let i = 0; i < 5; i++) {
      this.addRow();
    }
  }

  show() {
    if (this.panel) this.panel.style.display = '';
  }

  hide() {
    if (this.panel) this.panel.style.display = 'none';
  }

  addRow() {
    if (this.rows.length >= this.maxRows) return;
    const idx = this.rows.length;
    const tr = document.createElement('tr');
        const cells = [
      { className: "stats-row-num", text: String(idx + 1) },
      { tag: "button", className: "stats-del-row", attrs: { "data-row": String(idx), title: "删除" }, text: "×" },
      { tag: "input", className: "stats-input stats-x", attrs: { type: "number", step: "any", "data-row": String(idx), "data-col": "x" } },
      { tag: "input", className: "stats-input stats-y", attrs: { type: "number", step: "any", "data-row": String(idx), "data-col": "y" } },
      { tag: "input", className: "stats-input stats-freq", attrs: { type: "number", step: "1", min: "1", value: "1", "data-row": String(idx), "data-col": "freq" } }
    ];
    for (const cell of cells) {
      const td = document.createElement("td");
      const el = document.createElement(cell.tag || "span");
      if (cell.className) el.className = cell.className;
      if (cell.attrs) {
        for (const [k, v] of Object.entries(cell.attrs)) el.setAttribute(k, v);
      }
      if (cell.text) el.textContent = cell.text;
      td.appendChild(el);
      tr.appendChild(td);
    }
    this.body.appendChild(tr);
    this.rows.push(tr);

    // 回车跳到下一行
    const inputs = tr.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const nextRow = input.closest('tr').nextElementSibling;
          if (nextRow) {
            const nextInput = nextRow.querySelector(`input[data-col="${input.dataset.col}"]`);
            if (nextInput) nextInput.focus();
          } else {
            this.addRow();
            const newRow = this.body.lastElementChild;
            const nextInput = newRow.querySelector(`input[data-col="${input.dataset.col}"]`);
            if (nextInput) nextInput.focus();
          }
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextRow = input.closest('tr').nextElementSibling;
          if (nextRow) {
            const nextInput = nextRow.querySelector(`input[data-col="${input.dataset.col}"]`);
            if (nextInput) nextInput.focus();
          }
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevRow = input.closest('tr').previousElementSibling;
          if (prevRow) {
            const prevInput = prevRow.querySelector(`input[data-col="${input.dataset.col}"]`);
            if (prevInput) prevInput.focus();
          }
        }
      });
    });
  }

  exportCSV() {
    const { x, y, freq } = this.getData();
    if (x.length === 0) return;
    let csv = 'x,y,freq\n';
    for (let i = 0; i < x.length; i++) {
      csv += x[i] + ',' + (y[i] !== undefined ? y[i] : '') + ',' + (freq[i] || 1) + '\n';
    }
    this._download(csv, 'stats_export.csv', 'text/csv');
  }

  exportJSON() {
    const { x, y, freq } = this.getData();
    if (x.length === 0) return;
    const obj = { data: [] };
    for (let i = 0; i < x.length; i++) {
      obj.data.push({ x: x[i], y: y[i] !== undefined ? y[i] : null, freq: freq[i] || 1 });
    }
    this._download(JSON.stringify(obj, null, 2), 'stats_export.json', 'application/json');
  }

  importCSV(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const lines = e.target.result.trim().split(/\r?\n/);
      if (lines.length < 2) return;
      this.clear();
      const dataLines = lines.slice(1);
      for (let i = 0; i < dataLines.length; i++) {
        const cols = dataLines[i].split(',');
        if (i >= this.rows.length) this.addRow();
        const tr = this.rows[i];
        const xIn = tr.querySelector('.stats-x');
        const yIn = tr.querySelector('.stats-y');
        const fIn = tr.querySelector('.stats-freq');
        if (xIn && cols[0]) xIn.value = cols[0].trim();
        if (yIn && cols[1]) yIn.value = cols[1].trim();
        if (fIn && cols[2]) fIn.value = cols[2].trim();
      }
    };
    reader.readAsText(file);
  }

  importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const obj = JSON.parse(e.target.result);
        if (!obj.data) return;
        this.clear();
        for (let i = 0; i < obj.data.length; i++) {
          const d = obj.data[i];
          if (i >= this.rows.length) this.addRow();
          const tr = this.rows[i];
          const xIn = tr.querySelector('.stats-x');
          const yIn = tr.querySelector('.stats-y');
          const fIn = tr.querySelector('.stats-freq');
          if (xIn && d.x !== undefined) xIn.value = d.x;
          if (yIn && d.y !== undefined) yIn.value = d.y;
          if (fIn && d.freq !== undefined) fIn.value = d.freq;
        }
      } catch {
        /* ignore */
      }
    };
    reader.readAsText(file);
  }

  _download(content, filename, mime) {
    const blob = new Blob(['﻿' + content], { type: mime + ';charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clear() {
    this.body.innerHTML = '';
    this.rows = [];
    for (let i = 0; i < 5; i++) {
      this.addRow();
    }
  }

  /**
   * 获取编辑器中的数据
   * @returns {{ x: number[], y: number[] }}
   */
  getData() {
    const x = [];
    const y = [];
    const freq = [];
    for (const tr of this.rows) {
      const xInput = tr.querySelector('.stats-x');
      const yInput = tr.querySelector('.stats-y');
      const xv = xInput?.value.trim();
      const yv = yInput?.value.trim();
      if (xv !== '' && !isNaN(Number(xv))) {
        x.push(Number(xv));
      }
      if (yv !== '' && !isNaN(Number(yv))) {
        y.push(Number(yv));
      }
      const fv = tr.querySelector('.stats-freq')?.value.trim();
      freq.push(fv !== '' && !isNaN(Number(fv)) && Number(fv) > 0 ? Math.round(Number(fv)) : 1);
    }
    return { x, y, freq };
  }

  /**
   * 将数据以数组语法插入到输入框
   * 例如 linReg([1,2,3],[4,5,6])
   */
  insertToInput() {
    const { x, y } = this.getData();
    if (x.length === 0) return;

    const xStr = `[${x.join(',')}]`;
    const yStr = y.length > 0 ? `[${y.join(',')}]` : '';

    if (this.onInsert) {
      this.onInsert({ x: xStr, y: yStr, xData: x, yData: y });
    }
  }
}
