import { confirmAsync } from './modal.js';
import {
  clearHistory,
  deleteHistoryItem,
  getHistoryItems,
  setSearchQuery,
  exportHistory
} from '../history.js';

export class HistoryPanelManager {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.historyList = document.getElementById('history-list');
    this.historySearchInput = document.getElementById('history-search-input');
    this.historyClear = document.getElementById('history-clear');
    this.historyExport = document.getElementById('history-export');

    this.historySearchInput?.addEventListener('input', e => {
      setSearchQuery(e.target.value);
    });

    this.historyClear?.addEventListener('click', async () => {
      if (await confirmAsync('确定要清空所有历史记录吗？')) {
        clearHistory();
      }
    });

    this.historyExport?.addEventListener('click', () => {
      exportHistory();
    });

    this.historyList?.addEventListener('click', event => {
      const deleteBtn = event.target.closest('.delete-btn');
      if (deleteBtn) {
        event.stopPropagation();
        deleteHistoryItem(Number(deleteBtn.dataset.id));
        return;
      }

      const item = event.target.closest('.history-item');
      if (item && this.onSelect) {
        const id = Number(item.dataset.id);
        const historyItem = getHistoryItems().find(h => h.id === id);
        if (historyItem) {
          this.onSelect(historyItem);
        }
      }
    });
  }
}
