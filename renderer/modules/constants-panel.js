import { searchConstants } from '../constants.js';
import { escapeHtml, escapeAttr } from '../utils/escape.js';
import { debounce } from '../utils/debounce.js';

export class ConstantsPanelManager {
  constructor(onInsert) {
    this.onInsert = onInsert;
    this.constantsList = document.getElementById('constants-list');
    this.constantsSearchInput = document.getElementById('constants-search-input');

    const debouncedSearch = debounce(query => this.render(query), 150);
    this.constantsSearchInput?.addEventListener('input', e => {
      debouncedSearch(e.target.value);
    });

    this.constantsList?.addEventListener('click', event => {
      const item = event.target.closest('.constant-item');
      if (item && this.onInsert) {
        this.onInsert(item.dataset.insert);
      }
    });

    this.render();
  }

  render(query = '') {
    if (!this.constantsList) {
      return;
    }

    const items = searchConstants(query);

    if (items.length === 0) {
      this.constantsList.textContent = '';
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'constants-empty';
      emptyDiv.textContent = '未找到匹配的常量';
      this.constantsList.appendChild(emptyDiv);
      return;
    }

    this.constantsList.innerHTML = items
      .map(
        c => `
      <div class="constant-item" data-insert="${escapeAttr(c.insert)}" title="点击插入 ${escapeAttr(
        c.symbol
      )}">
        <div class="name">${escapeHtml(c.name)}</div>
        <div class="symbol">${escapeHtml(c.symbol)} = ${escapeHtml(c.value)}</div>
        ${c.unit ? `<div class="unit">单位: ${escapeHtml(c.unit)}</div>` : ''}
        <div class="category">${escapeHtml(c.category)}</div>
      </div>
    `
      )
      .join('');
  }
}
