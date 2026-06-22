import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { evaluateExpression } from '../calculator.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export class PlotManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.chart = null;
  }

  plot(expression, start, end, step = 0.1) {
    if (!this.container) {
      return;
    }

    const s = Number(start);
    const e = Number(end);
    const st = Number(step);

    if ([s, e, st].some(isNaN) || st === 0) {
      throw new Error('绘图参数无效');
    }

    if (Math.abs(e - s) / Math.abs(st) > 5000) {
      throw new Error('数据点过多，请增大步长');
    }

    const labels = [];
    const data = [];
    const backgroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent')
      .trim();

    const ascending = st > 0;
    let x = s;

    while ((ascending && x <= e) || (!ascending && x >= e)) {
      const expr = expression.replace(/\bx\b/g, `(${x})`).replace(/(\d)\(/g, '$1*(');
      let y;
      try {
        const result = evaluateExpression(expr, 'standard');
        y = result.success ? Number(result.result) : NaN;
      } catch {
        y = NaN;
      }

      if (Number.isFinite(y)) {
        labels.push(parseFloat(x.toPrecision(6)));
        data.push(y);
      }

      x += st;
    }

    if (data.length === 0) {
      throw new Error('没有可绘制的有效数据点');
    }

    this.render(labels, data, expression, backgroundColor);
  }

  render(labels, data, expression, color) {
    if (this._rendering) return;
    this._rendering = true;
    try {
      this.clear();

      const canvas = document.createElement('canvas');
      canvas.id = 'plot-canvas';
      this.container.appendChild(canvas);

      const textColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--text-primary')
        .trim();
      const gridColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-tertiary')
        .trim();

      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: `f(x) = ${expression}`,
              data,
              borderColor: color,
              backgroundColor: color + '20',
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4,
              fill: false,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              labels: {
                color: textColor
              }
            },
            tooltip: {
              callbacks: {
                title: items => `x = ${items[0].label}`,
                label: item => `f(x) = ${item.parsed.y.toPrecision(8)}`
              }
            }
          },
          scales: {
            x: {
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor,
                maxTicksLimit: 10
              }
            },
            y: {
              grid: {
                color: gridColor
              },
              ticks: {
                color: textColor,
                maxTicksLimit: 8
              }
            }
          }
        }
      });
    } finally {
      this._rendering = false;
    }
  }

  clear() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  showEmpty(message) {
    this.clear();
    if (this.container) {
      const div = document.createElement('div');
      div.className = 'plot-empty';
      div.textContent = message;
      this.container.appendChild(div);
    }
  }
}
