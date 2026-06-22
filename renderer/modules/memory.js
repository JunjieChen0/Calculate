import { FEEDBACK_DISPLAY_TIMEOUT } from '../shared/constants.js';

export class MemoryManager {
  constructor(store) {
    this.store = store;
    this.value = 0;
    this.hasMemory = false;
  }

  async load() {
    try {
      const saved = await this.store.get('calculator_memory', { value: 0, hasMemory: false });
      this.value = saved.value || 0;
      this.hasMemory = saved.hasMemory || false;
      this.updateButtons();
    } catch (error) {
      console.warn('Failed to load memory:', error);
    }
  }

  async save() {
    try {
      await this.store.set('calculator_memory', { value: this.value, hasMemory: this.hasMemory });
    } catch (error) {
      console.warn('Failed to save memory:', error);
    }
    this.updateButtons();
  }

  updateButtons() {
    document.querySelectorAll('.memory-btn').forEach(btn => {
      const action = btn.dataset.memory;
      if (action === 'MR' || action === 'MC') {
        btn.disabled = !this.hasMemory;
        btn.classList.toggle('disabled', !this.hasMemory);
      }
    });
  }

  handleAction(action, currentResult, onRecall) {
    let currentValue;
    if (typeof currentResult === 'number' && Number.isFinite(currentResult)) {
      currentValue = currentResult;
    } else if (typeof currentResult === 'string') {
      // Use Number() instead of parseFloat() to reject strings like "3 + 4i"
      // parseFloat("3 + 4i") returns 3 (silent truncation), Number() returns NaN
      currentValue = Number(currentResult.trim());
    } else {
      currentValue = NaN;
    }
    const isValidNumber = !isNaN(currentValue) && isFinite(currentValue);

    switch (action) {
      case 'MC':
        this.value = 0;
        this.hasMemory = false;
        break;
      case 'MR':
        if (this.hasMemory && onRecall) {
          onRecall(String(this.value));
        }
        return;
      case 'M+':
        if (isValidNumber) {
          this.value += currentValue;
          this.hasMemory = true;
        } else {
          this.showFeedback('无法存储非数值结果');
          return;
        }
        break;
      case 'M-':
        if (isValidNumber) {
          this.value -= currentValue;
          this.hasMemory = true;
        } else {
          this.showFeedback('无法存储非数值结果');
          return;
        }
        break;
      case 'MS':
        if (isValidNumber) {
          this.value = currentValue;
          this.hasMemory = true;
        } else {
          this.showFeedback('无法存储非数值结果');
          return;
        }
        break;
    }

    this.save();
  }

  showFeedback(message) {
    const errorDisplay = document.getElementById('error-display');
    if (errorDisplay) {
      errorDisplay.textContent = message;
      setTimeout(() => {
        if (errorDisplay.textContent === message) {
          errorDisplay.textContent = '';
        }
      }, FEEDBACK_DISPLAY_TIMEOUT);
    }
  }
}
