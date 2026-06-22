/**
 * 统计列表编辑器模块
 * 提供可视化的 x/y 数据列表编辑界面
 */

export class StatsEditor {
  constructor() {
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
    tr.innerHTML = `
      <td class="stats-row-num">${idx + 1}</td>
      <td><input type="number" class="stats-input stats-x" step="any" data-row="${idx}" data-col="x" /></td>
      <td><input type="number" class="stats-input stats-y" step="any" data-row="${idx}" data-col="y" /></td>
    `;
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
    }
    return { x, y };
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

    // 触发自定义事件，让 app.js 处理
    const event = new CustomEvent('stats-insert', {
      detail: { x: xStr, y: yStr, xData: x, yData: y }
    });
    document.dispatchEvent(event);
  }
}
