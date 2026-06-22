import 'katex/dist/katex.min.css';
import {
  evaluateExpression,
  getAngleUnit,
  setAns,
  setPrecision,
  getPrecision,
  setDisplayFormat,
  getDisplayFormat,
  setCurrentBase,
  getCurrentBase,
  setEngineeringNotation,
  getEngineeringNotation,
  setFractionMode,
  getFractionMode
} from './calculator.js';
import { initHistory, addHistory, clearHistory } from './history.js';
import { initTheme, toggleTheme } from './theme.js';
import { initKeyboard, autoCompleteBrackets } from './keyboard.js';
import { createStore } from './utils/store.js';
import { updateDisplay, setError, clearError, copyResult } from './modules/display.js';
import {
  getHelperText,
  renderHelperPanel,
  setActiveModeTab,
  updateBaseKeyboard
} from './modules/mode.js';
import { PanelManager } from './modules/panel.js';
import { SettingsManager } from './modules/settings.js';
import { MemoryManager } from './modules/memory.js';
import { TableManager } from './modules/table.js';
import { ConstantsPanelManager } from './modules/constants-panel.js';
import { HistoryPanelManager } from './modules/history-panel.js';
import { HelpPanelManager } from './modules/help.js';

// DOM Elements
const helperPanel = document.getElementById('helper-panel');
const angleToggle = document.getElementById('angle-toggle');

// State
let currentInput = '';
let currentMode = 'standard';
let lastResult = '0';
let cursorIndex = 0;

// Managers
const store = createStore();
const panelManager = new PanelManager();
const settingsManager = new SettingsManager(store);
const memoryManager = new MemoryManager(store);
new TableManager();

// Initialization
async function init() {
  await initTheme(store);
  await initHistory(store);
  await memoryManager.load();
  await settingsManager.load();
  new ConstantsPanelManager(insertText);
  new HistoryPanelManager(handleHistorySelect);
  new HelpPanelManager();
  bindEvents();
  renderHelperPanel(currentMode, helperPanel);
  updateBaseKeyboard(getCurrentBase());
  updateAngleButton();
  initKeyboard({
    onInsert: insertText,
    onBackspace: handleBackspace,
    onClear: handleClear,
    onCalculate: handleCalculate,
    onCursorLeft: moveCursorLeft,
    onCursorRight: moveCursorRight,
    onToggleHistory: () => panelManager.toggle('history'),
    onToggleTheme: () => toggleTheme(),
    onClearHistory: handleClearHistory,
    onAutoBracket: handleAutoBracket,
    getCurrentMode: () => currentMode,
    isPanelOpen: () => panelManager.activePanel !== null,
    closePanel: () => panelManager.closeAll(),
    onToggleHelp: () => panelManager.toggle('help')
  });
  updateDisplayWithCursor();
}

function bindEvents() {
  // Keypad buttons
  document.querySelectorAll('.key').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const value = button.dataset.value;

      switch (action) {
        case 'insert':
          insertText(value);
          break;
        case 'clear':
          handleClear();
          break;
        case 'backspace':
          handleBackspace();
          break;
        case 'calculate':
          handleCalculate();
          break;
      }
    });
  });

  // Helper buttons
  helperPanel.addEventListener('click', event => {
    const button = event.target.closest('.helper-btn');
    if (!button) return;

    if (button.id === 'angle-toggle') {
      cycleAngleUnit();
      return;
    }

    const insertValue = button.dataset.insert;
    if (insertValue !== undefined) {
      insertText(insertValue);
    }
  });

  // Memory buttons
  document.querySelectorAll('.memory-btn').forEach(button => {
    button.addEventListener('click', () => {
      memoryManager.handleAction(button.dataset.memory, lastResult, insertText);
    });
  });

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      setActiveModeTab(tab.dataset.mode);
      currentMode = tab.dataset.mode;
      currentInput = '';
      cursorIndex = 0;
      clearError();
      renderHelperPanel(currentMode, helperPanel);
      updateBaseKeyboard(getCurrentBase());
      updateDisplay(currentInput, lastResult);
    });
  });

  // Header buttons
  document
    .getElementById('history-toggle')
    .addEventListener('click', () => panelManager.toggle('history'));
  document
    .getElementById('constants-toggle')
    .addEventListener('click', () => panelManager.toggle('constants'));
  document
    .getElementById('table-toggle')
    .addEventListener('click', () => panelManager.toggle('table'));
  document
    .getElementById('settings-toggle')
    .addEventListener('click', () => panelManager.toggle('settings'));
  document.getElementById('theme-toggle').addEventListener('click', () => toggleTheme());
  document.getElementById('help-toggle')?.addEventListener('click', () => panelManager.toggle('help'));
  document.getElementById('help-close')?.addEventListener('click', () => panelManager.toggle('help'));
  document
    .getElementById('history-close')
    ?.addEventListener('click', () => panelManager.toggle('history'));
  document.getElementById('fraction-toggle').addEventListener('click', () => {
    setFractionMode(!getFractionMode());
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });

  // Panel close buttons
  document
    .getElementById('constants-close')
    .addEventListener('click', () => panelManager.toggle('constants'));
  document
    .getElementById('settings-close')
    .addEventListener('click', () => panelManager.toggle('settings'));
  document
    .getElementById('table-close')
    .addEventListener('click', () => panelManager.toggle('table'));

  // Copy result
  document.getElementById('copy-result').addEventListener('click', () => copyResult(lastResult));

  // Settings controls
  let precisionSaveTimeout = null;
  document.getElementById('precision-setting').addEventListener('input', e => {
    setPrecision(Number(e.target.value));
    document.getElementById('precision-value').textContent = getPrecision();
    recalculateCurrent();
    if (precisionSaveTimeout) clearTimeout(precisionSaveTimeout);
    precisionSaveTimeout = setTimeout(() => settingsManager.save(), 300);
  });

  document.getElementById('settings-angle-toggle').addEventListener('click', () => {
    cycleAngleUnit();
  });

  document.getElementById('auto-bracket-toggle').addEventListener('click', () => {
    settingsManager.toggleAutoBracket();
    settingsManager.updateUI();
    settingsManager.save();
  });

  document.getElementById('engineering-toggle').addEventListener('click', () => {
    setEngineeringNotation(!getEngineeringNotation());
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });

  // Format buttons
  document.getElementById('format-norm').addEventListener('click', () => setFormat('norm'));
  document.getElementById('format-fix').addEventListener('click', () => setFormat('fix'));
  document.getElementById('format-sci').addEventListener('click', () => setFormat('sci'));

  // Base buttons
  document.getElementById('base-dec').addEventListener('click', () => setBase(10));
  document.getElementById('base-bin').addEventListener('click', () => setBase(2));
  document.getElementById('base-oct').addEventListener('click', () => setBase(8));
  document.getElementById('base-hex').addEventListener('click', () => setBase(16));
}

function setFormat(format) {
  setDisplayFormat(format, getDisplayFormat().decimals);
  settingsManager.save();
  settingsManager.updateUI();
  recalculateCurrent();
}

function setBase(base) {
  setCurrentBase(base);
  settingsManager.save();
  settingsManager.updateUI();
  updateBaseKeyboard(base);
  if (currentMode === 'base') {
    recalculateCurrent();
  }
}

function insertText(text) {
  const insertValue = getHelperText(text);
  currentInput = currentInput.slice(0, cursorIndex) + insertValue + currentInput.slice(cursorIndex);
  cursorIndex += insertValue.length;
  updateDisplayWithCursor();
}

function handleBackspace() {
  if (cursorIndex > 0) {
    currentInput = currentInput.slice(0, cursorIndex - 1) + currentInput.slice(cursorIndex);
    cursorIndex--;
  }
  updateDisplayWithCursor();
}

function handleClear() {
  currentInput = '';
  lastResult = '0';
  cursorIndex = 0;
  clearError();
  updateDisplayWithCursor();
}

function moveCursorLeft() {
  if (cursorIndex > 0) {
    cursorIndex--;
    updateDisplayWithCursor();
  }
}

function moveCursorRight() {
  if (cursorIndex < currentInput.length) {
    cursorIndex++;
    updateDisplayWithCursor();
  }
}

function handleAutoBracket() {
  if (settingsManager.getAutoBracketEnabled()) {
    currentInput = autoCompleteBrackets(currentInput);
    cursorIndex = currentInput.length;
    updateDisplayWithCursor();
  }
}

function handleCalculate() {
  if (!currentInput.trim()) {
    return;
  }

  let expr = currentInput;
  if (settingsManager.getAutoBracketEnabled()) {
    expr = autoCompleteBrackets(expr);
    currentInput = expr;
    cursorIndex = currentInput.length;
  }

  const result = evaluateExpression(expr, currentMode);

  if (result.success) {
    lastResult = result.result;
    setAns(lastResult);
    clearError();
    addHistory({ expression: expr, result: lastResult, mode: currentMode });
  } else {
    setError(result.error);
    return;
  }

  currentInput = lastResult;
  cursorIndex = currentInput.length;
  updateDisplayWithCursor();
}

function recalculateCurrent() {
  if (currentInput.trim()) {
    const result = evaluateExpression(currentInput, currentMode);
    if (result.success) {
      lastResult = result.result;
      clearError();
    } else {
      // Suppress error for incomplete expressions (user still typing)
      const trimmed = currentInput.trim();
      const isIncomplete = /[+\-*/^(,]$|\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs|floor|ceil|exp|det|inv|transpose|trace|norm|dot|cross|mean|median|std|variance|sum|min|max)\($/.test(trimmed);
      if (!isIncomplete) {
        setError(result.error);
      } else {
        clearError();
      }
    }
    updateDisplayWithCursor();
  }
}

function updateDisplayWithCursor() {
  updateDisplay(currentInput, lastResult, cursorIndex);
}

function cycleAngleUnit() {
  settingsManager.cycleAngleUnit();
  updateAngleButton();
  recalculateCurrent();
  settingsManager.save();
}

function updateAngleButton() {
  const unit = getAngleUnit().toUpperCase();
  if (angleToggle) {
    angleToggle.textContent = unit;
    angleToggle.classList.toggle('active', getAngleUnit() !== 'rad');
  }
}

function handleHistorySelect(historyItem) {
  currentInput = historyItem.expression;
  cursorIndex = currentInput.length;
  currentMode = historyItem.mode || 'standard';
  lastResult = historyItem.result || '0';
  setActiveModeTab(currentMode);
  renderHelperPanel(currentMode, helperPanel);
  updateBaseKeyboard(getCurrentBase());
  updateDisplayWithCursor();
  panelManager.toggle('history');
}

function handleClearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    clearHistory();
  }
}

// Start the app
init().catch(error => {
  console.error('Failed to initialize app:', error);
});
