import { MAX_HISTORY_ITEMS } from './shared/constants.js';
import { debounce } from './utils/debounce.js';
import { logger } from './core/logger.js';

const STORAGE_KEY = 'calculator_history';

let historyItems = [];
let searchQuery = '';
let store = null;

export async function initHistory(externalStore) {
  store = externalStore;
  if (store && store.get) {
    try {
      const saved = await store.get(STORAGE_KEY, []);
      historyItems = Array.isArray(saved) ? saved.slice(0, MAX_HISTORY_ITEMS) : [];
    } catch (error) {
      logger.warn('Failed to load history:', error);
      historyItems = [];
    }
  }
  renderHistory();
}

export function addHistory(item) {
  if (!item || typeof item !== 'object') {
    return;
  }

  if (!item.expression || item.expression.trim() === '') {
    return;
  }

  const expression = item.expression.trim();

  // Skip if identical to the most recent entry
  if (historyItems.length > 0 && historyItems[0].expression === expression) {
    return;
  }

  const normalised = {
    id: Date.now(),
    expression,
    result: String(item.result),
    mode: item.mode || 'standard',
    timestamp: new Date().toISOString()
  };

  historyItems.unshift(normalised);

  if (historyItems.length > MAX_HISTORY_ITEMS) {
    historyItems = historyItems.slice(0, MAX_HISTORY_ITEMS);
  }

  saveHistory();
  debouncedRenderHistory();
}

export function clearHistory() {
  historyItems = [];
  saveHistory();
  renderHistory();
}

export function deleteHistoryItem(id) {
  historyItems = historyItems.filter(item => item.id !== id);
  saveHistory();
  renderHistory();
}

export function getHistoryItems() {
  return [...historyItems];
}

export function setSearchQuery(query) {
  searchQuery = query || '';
  debouncedRenderHistory();
}

export function getFilteredHistory() {
  if (!searchQuery.trim()) {
    return [...historyItems];
  }
  const lowerQuery = searchQuery.toLowerCase();
  return historyItems.filter(
    item =>
      item.expression.toLowerCase().includes(lowerQuery) ||
      item.result.toLowerCase().includes(lowerQuery)
  );
}

export function exportHistory() {
  const data = {
    exportDate: new Date().toISOString(),
    total: historyItems.length,
    items: historyItems
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calculate_jyy_history_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const debouncedStoreSave = debounce(() => {
  if (store && store.set) {
    store.set(STORAGE_KEY, historyItems).catch(error => {
      logger.warn('Failed to save history:', error);
      const listElement = document.getElementById('history-list');
      if (listElement) {
        const notice = document.createElement('div');
        notice.className = 'history-notice';
        notice.textContent = '⚠ 历史记录保存失败，请检查存储空间';
        notice.style.cssText =
          'padding:8px;text-align:center;color:var(--accent);font-size:0.85em;';
        listElement.prepend(notice);
        setTimeout(() => notice.remove(), 3000);
      }
    });
  }
}, 300);

function saveHistory() {
  debouncedStoreSave();
}

const debouncedRenderHistory = debounce(() => renderHistory(), 100);

function renderHistory() {
  const listElement = document.getElementById('history-list');
  if (!listElement) {
    return;
  }

  const items = getFilteredHistory();

  if (items.length === 0) {
    listElement.textContent = '';
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'history-empty';
    emptyDiv.textContent = searchQuery.trim() ? '未找到匹配的历史记录' : '暂无历史记录';
    listElement.appendChild(emptyDiv);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const item of items) {
    const wrapper = document.createElement('div');
    wrapper.className = 'history-item';
    wrapper.dataset.id = String(item.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.dataset.id = String(item.id);
    deleteBtn.title = '删除';
    deleteBtn.textContent = '\u00D7';

    const exprDiv = document.createElement('div');
    exprDiv.className = 'expr';
    exprDiv.textContent = item.expression;

    const resultDiv = document.createElement('div');
    resultDiv.className = 'result';
    resultDiv.textContent = '= ' + item.result;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'time';
    timeDiv.textContent = formatTime(item.timestamp);

    wrapper.appendChild(deleteBtn);
    wrapper.appendChild(exprDiv);
    wrapper.appendChild(resultDiv);
    wrapper.appendChild(timeDiv);
    fragment.appendChild(wrapper);
  }

  listElement.textContent = '';
  listElement.appendChild(fragment);
}

function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}
