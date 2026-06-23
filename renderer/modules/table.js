import { generateTable } from '../calculator.js';
import { PlotManager } from './plot.js';
import { downloadFile } from '../utils/download.js';

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

  getLastData() {
    return this._lastData || null;
  }

  exportCSV() {
    const d = this._lastData;
    if (!d || d.data.length === 0) return;
    const hasG = d.data2 && d.data2.length > 0;
    let csv = hasG ? 'x,f(x),g(x)' : 'x,f(x)';
    csv += '\n';
    d.data.forEach((row, i) => {
      const g = hasG && d.data2[i] ? d.data2[i].y : '';
      csv += row.x + ',' + row.y + (hasG ? ',' + g : '') + '\n';
    });
    downloadFile(csv, 'table_export.csv', 'text/csv');
  }

  exportJSON() {
    const d = this._lastData;
    if (!d || d.data.length === 0) return;
    const obj = {
      expression: d.expression,
      expression2: d.expression2 || '',
      start: d.start,
      end: d.end,
      step: d.step,
      data: d.data.map((row, i) => ({
        x: row.x,
        y: row.y,
        ...(d.data2 && d.data2[i] ? { g: d.data2[i].y } : {})
      }))
    };
    downloadFile(JSON.stringify(obj, null, 2), 'table_export.json', 'application/json');
  }

  importCSV(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const lines = text.trim().split(/[\r\n]+/);
      if (lines.length < 2) return;
      const header = lines[0].split(',');
      const hasG = header.length >= 3;
      const data = [];
      const data2 = hasG ? [] : null;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const x = parseFloat(cols[0]);
        const y = parseFloat(cols[1]);
        if (!isNaN(x) && !isNaN(y)) {
          data.push({ x, y });
          if (hasG && data2) data2.push({ x, y: parseFloat(cols[2]) || 0 });
        }
      }
      if (data.length > 0) {
        this._lastData = {
          data,
          data2,
          expression: 'imported',
          expression2: '',
          start: data[0].x,
          end: data[data.length - 1].x,
          step: 1
        };
        this.render(data, data2);
      }
    };
    reader.readAsText(file);
  }

  importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const obj = JSON.parse(e.target.result);
        const data = obj.data.map(d => ({ x: d.x, y: d.y }));
        const data2 =
          obj.data[0] && obj.data[0].g !== undefined
            ? obj.data.map(d => ({ x: d.x, y: d.g }))
            : null;
        this._lastData = {
          data,
          data2,
          expression: obj.expression || 'imported',
          expression2: obj.expression2 || '',
          start: obj.start,
          end: obj.end,
          step: obj.step
        };
        if (this.tableExpression && obj.expression) this.tableExpression.value = obj.expression;
        if (this.tableExpression2 && obj.expression2) this.tableExpression2.value = obj.expression2;
        if (this.tableStart && obj.start !== undefined) this.tableStart.value = obj.start;
        if (this.tableEnd && obj.end !== undefined) this.tableEnd.value = obj.end;
        if (this.tableStep && obj.step !== undefined) this.tableStep.value = obj.step;
        this.render(data, data2);
      } catch {
        this.showEmpty('JSON 格式错误');
      }
    };
    reader.readAsText(file);
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
      this._lastData = {
        data,
        data2,
        expression,
        expression2: expression2 || '',
        start,
        end,
        step
      };
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
