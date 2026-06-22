import { generateTable } from '../calculator.js';
import { PlotManager } from './plot.js';

export class TableManager {
  constructor() {
    this.tableExpression = document.getElementById('table-expression');
    this.tableExpression2 = document.getElementById('table-expression2');
    this.tableStart = document.getElementById('table-start');
    this.tableEnd = document.getElementById('table-end');
    this.tableStep = document.getElementById('table-step');
    this.tableGenerate = document.getElementById('table-generate');
    this.tablePlot = document.getElementById('table-plot');
    this.tableResult = document.getElementById('table-result');
    this.plotResult = document.getElementById('plot-result');
    this.tabs = document.querySelectorAll('.table-tab');
    this.plotManager = new PlotManager('plot-result');
    this.activeTab = 'table';

    this.tableGenerate?.addEventListener('click', () => {
      this.switchTab('table');
      this.generate();
    });

    this.tablePlot?.addEventListener('click', () => {
      this.switchTab('plot');
      this.plot();
    });

    [
      this.tableExpression,
      this.tableExpression2,
      this.tableStart,
      this.tableEnd,
      this.tableStep
    ].forEach(input => {
      input?.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          this.generate();
        }
      });
    });

    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchTab(tab.dataset.tab);
      });
    });
  }

  switchTab(tab) {
    this.activeTab = tab;
    this.tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    this.tableResult?.classList.toggle('active', tab === 'table');
    this.plotResult?.classList.toggle('active', tab === 'plot');
  }

  generate() {
    const expression = this.tableExpression?.value.trim();
    const expression2 = this.tableExpression2?.value.trim();
    const start = parseFloat(this.tableStart?.value);
    const end = parseFloat(this.tableEnd?.value);
    const step = parseFloat(this.tableStep?.value);

    if (!expression) {
      this.showEmpty('请输入函数表达式');
      return;
    }

    if ([start, end, step].some(isNaN) || step === 0) {
      this.showEmpty('参数无效');
      return;
    }

    try {
      const data = generateTable(expression, start, end, step);
      let data2 = null;
      if (expression2) {
        try {
          data2 = generateTable(expression2, start, end, step);
        } catch {
          data2 = null;
        }
      }
      this.render(data, data2);
    } catch (error) {
      this.showEmpty(error.message);
    }
  }

  plot() {
    const expression = this.tableExpression?.value.trim();
    const start = parseFloat(this.tableStart?.value);
    const end = parseFloat(this.tableEnd?.value);

    if (!expression) {
      this.plotManager.showEmpty('请输入函数表达式');
      return;
    }

    if ([start, end].some(isNaN)) {
      this.plotManager.showEmpty('参数无效');
      return;
    }

    try {
      const step = Math.abs(end - start) / 200;
      this.plotManager.plot(expression, start, end, Math.max(step, 0.001));
    } catch (error) {
      this.plotManager.showEmpty(error.message);
    }
  }

  render(data, data2) {
    if (!this.tableResult) {
      return;
    }

    if (data.length === 0) {
      this.showEmpty('无数据');
      return;
    }

    const hasG = data2 && data2.length > 0;

    const rows = data
      .map((row, idx) => {
        const gVal = hasG && data2[idx] ? this.formatValue(data2[idx].y) : '';
        const gCol = hasG ? `<td>${gVal}</td>` : '';
        return `
      <tr>
        <td>${this.formatValue(row.x)}</td>
        <td>${this.formatValue(row.y)}</td>
        ${gCol}
      </tr>
    `;
      })
      .join('');

    const gHeader = hasG ? '<th>g(x)</th>' : '';

    this.tableResult.innerHTML = `
      <table class="table-data">
        <thead>
          <tr>
            <th>x</th>
            <th>f(x)</th>
            ${gHeader}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  showEmpty(message) {
    if (this.tableResult) {
      const div = document.createElement('div');
      div.className = 'table-empty';
      div.textContent = message;
      this.tableResult.innerHTML = '';
      this.tableResult.appendChild(div);
    }
  }

  formatValue(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return parseFloat(value.toPrecision(12)).toString();
    }
    if (typeof value === 'string') {
      const div = document.createElement('div');
      div.textContent = value;
      return div.innerHTML;
    }
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  }
}
