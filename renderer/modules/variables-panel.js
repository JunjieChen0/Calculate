import {
  getAllVariables,
  clearVariable,
  clearAllVariables,
  _getCustomFunctions
} from '../calculator.js';
import { escapeHtml } from '../utils/escape.js';

export class VariablesPanelManager {
  constructor(onInsert) {
    this.onInsert = onInsert;
    this.list = document.getElementById('variables-list');
    this.clearAllBtn = document.getElementById('variables-clear-all');

    this.clearAllBtn?.addEventListener('click', () => {
      clearAllVariables();
      this.render();
    });

    this.list?.addEventListener('click', event => {
      const item = event.target.closest('.variable-item');
      if (!item) return;

      const action = event.target.closest('[data-action]');
      if (action) {
        if (action.dataset.action === 'insert' && this.onInsert) {
          this.onInsert(action.dataset.insert);
        } else if (action.dataset.action === 'delete') {
          clearVariable(action.dataset.name);
          this.render();
        }
      }
    });
  }

  render() {
    if (!this.list) return;

    const vars = getAllVariables();
    const funcs = _getCustomFunctions();
    const varKeys = Object.keys(vars);
    const funcKeys = Object.keys(funcs);

    if (varKeys.length === 0 && funcKeys.length === 0) {
      this.list.textContent = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'variables-empty';
      emptyDiv.textContent = '暂无存储变量';
      this.list.appendChild(emptyDiv);
      return;
    }

    let html = '';

    if (varKeys.length > 0) {
      html += '<div class="variables-section-title">变量</div>';
      for (const name of varKeys.sort()) {
        const val = vars[name];
        const display = Number.isInteger(val)
          ? val.toString()
          : val.toPrecision(10).replace(/\.?0+$/, '');
        html += `
          <div class="variable-item">
            <span class="variable-name" data-action="insert" data-insert="${escapeHtml(name)}" title="点击插入">${escapeHtml(name)}</span>
            <span class="variable-value" data-action="insert" data-insert="${escapeHtml(display)}" title="点击插入值">${escapeHtml(display)}</span>
            <button class="variable-delete" data-action="delete" data-name="${escapeHtml(name)}" title="删除">×</button>
          </div>`;
      }
    }

    if (funcKeys.length > 0) {
      html += '<div class="variables-section-title">自定义函数</div>';
      for (const name of funcKeys.sort()) {
        const f = funcs[name];
        html += `
          <div class="variable-item">
            <span class="variable-name" data-action="insert" data-insert="${escapeHtml(name)}(${escapeHtml(f.param)})" title="点击插入">${escapeHtml(name)}(${escapeHtml(f.param)})</span>
            <span class="variable-value">${escapeHtml(f.expr)}</span>
          </div>`;
      }
    }

    this.list.innerHTML = html;
  }
}
