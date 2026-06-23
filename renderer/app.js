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
  getFractionMode,
  setExactMode,
  getExactMode,
  setFractionType,
  setThousandSeparator,
  getThousandSeparator,
  setDecimalSeparator,
  setLanguage
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
import { StatsEditor } from './modules/stats-editor.js';
import { VariablesPanelManager } from './modules/variables-panel.js';
import { SpreadsheetManager } from './modules/spreadsheet.js';
import { qrToDataURL } from './modules/qrcode.js';
import { EventBus } from './core/event-bus.js';
import { ReactiveState } from './core/state.js';
import { errorHandler } from './core/errors.js';

// ── DOM Elements ──
const helperPanel = document.getElementById('helper-panel');
const angleToggle = document.getElementById('angle-toggle');

// ── 核心基础设施 ──
const bus = new EventBus();
const uiState = new ReactiveState({
  currentInput: '',
  currentMode: 'standard',
  lastResult: '0',
  cursorIndex: 0
});

// ── 撤销栈 ──
const undoStack = [];
const MAX_UNDO = 50;

function pushUndo() {
  undoStack.push({
    input: uiState.get('currentInput'),
    cursor: uiState.get('cursorIndex')
  });
  if (undoStack.length > MAX_UNDO) undoStack.shift();
}

function handleUndo() {
  if (undoStack.length === 0) return;
  const state = undoStack.pop();
  uiState.batch({ currentInput: state.input, cursorIndex: state.cursor });
  updateDisplayWithCursor();
}

// ── Managers ──
const store = createStore();
const panelManager = new PanelManager();
const settingsManager = new SettingsManager(store);
const memoryManager = new MemoryManager(store);
const statsEditor = new StatsEditor();
new TableManager();
let varsPanelMgr;
let spreadsheetMgr;

// ── Initialization ──
async function init() {
  await initTheme(store);
  await initHistory(store);
  await memoryManager.load();
  await settingsManager.load();
  new ConstantsPanelManager(insertText);
  varsPanelMgr = new VariablesPanelManager(insertText);
  spreadsheetMgr = new SpreadsheetManager();
  new HistoryPanelManager(handleHistorySelect);
  new HelpPanelManager();
  bindEvents();
  renderHelperPanel(uiState.get('currentMode'), helperPanel);
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
    getCurrentMode: () => uiState.get('currentMode'),
    isPanelOpen: () => panelManager.activePanel !== null,
    closePanel: () => panelManager.closeAll(),
    onToggleHelp: () => panelManager.toggle('help'),
    onUndo: handleUndo
  });
  updateDisplayWithCursor();
}

// ── Event Binding ──
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
      memoryManager.handleAction(button.dataset.memory, uiState.get('lastResult'), insertText);
    });
  });

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const newMode = tab.dataset.mode;
      setActiveModeTab(newMode);
      uiState.batch({ currentMode: newMode, currentInput: '', cursorIndex: 0 });
      clearError();
      renderHelperPanel(newMode, helperPanel);
      updateBaseKeyboard(getCurrentBase());
      updateDisplay(uiState.get('currentInput'), uiState.get('lastResult'));
      bus.emit('mode-changed', newMode);
      // 显示/隐藏统计编辑器
      if (newMode === 'stats') {
        statsEditor.show();
      } else {
        statsEditor.hide();
      }
    });
  });

  // Stats editor insert event
  document.addEventListener('stats-insert', e => {
    const { x, y } = e.detail;
    if (uiState.get('currentMode') === 'stats') {
      const expr = y ? `linReg(${x},${y})` : `mean(${x})`;
      uiState.batch({ currentInput: expr, cursorIndex: expr.length });
      updateDisplayWithCursor();
    }
  });

  // Header buttons
  document
    .getElementById('history-toggle')
    .addEventListener('click', () => panelManager.toggle('history'));
  document
    .getElementById('constants-toggle')
    .addEventListener('click', () => panelManager.toggle('constants'));
  document.getElementById('variables-toggle').addEventListener('click', () => {
    varsPanelMgr.render();
    panelManager.toggle('variables');
  });
  document
    .getElementById('table-toggle')
    .addEventListener('click', () => panelManager.toggle('table'));
  document
    .getElementById('spreadsheet-toggle')
    .addEventListener('click', () => panelManager.toggle('spreadsheet'));
  document
    .getElementById('spreadsheet-close')
    ?.addEventListener('click', () => panelManager.toggle('spreadsheet'));
  document
    .getElementById('spreadsheet-clear')
    ?.addEventListener('click', () => spreadsheetMgr.clearAll());
  document
    .getElementById('settings-toggle')
    .addEventListener('click', () => panelManager.toggle('settings'));
  document.getElementById('theme-toggle').addEventListener('click', () => toggleTheme());
  document.getElementById('undo-btn').addEventListener('click', () => handleUndo());
  document
    .getElementById('help-toggle')
    ?.addEventListener('click', () => panelManager.toggle('help'));
  document
    .getElementById('help-close')
    ?.addEventListener('click', () => panelManager.toggle('help'));
  document
    .getElementById('history-close')
    ?.addEventListener('click', () => panelManager.toggle('history'));
  document
    .getElementById('variables-close')
    ?.addEventListener('click', () => panelManager.toggle('variables'));
  document.getElementById('fraction-toggle').addEventListener('click', () => {
    setFractionMode(!getFractionMode());
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });
  document.getElementById('exact-toggle').addEventListener('click', () => {
    setExactMode(!getExactMode());
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
  document
    .getElementById('copy-result')
    .addEventListener('click', () => copyResult(uiState.get('lastResult')));

  // QR code
  const qrModal = document.getElementById('qr-modal');
  const qrImage = document.getElementById('qr-image');
  const qrText = document.getElementById('qr-text');
  document.getElementById('qr-btn').addEventListener('click', () => {
    const text = uiState.get('lastResult') || '0';
    const dataUrl = qrToDataURL(text);
    if (dataUrl && qrImage && qrText) {
      qrImage.src = dataUrl;
      qrText.textContent = text;
      qrModal.style.display = 'flex';
    }
  });
  document.getElementById('qr-close')?.addEventListener('click', () => {
    qrModal.style.display = 'none';
  });
  qrModal?.addEventListener('click', e => {
    if (e.target === qrModal) qrModal.style.display = 'none';
  });

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

  document.getElementById('exact-toggle-setting').addEventListener('click', () => {
    setExactMode(!getExactMode());
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });

  // Fraction type buttons
  document.getElementById('fraction-type-improper').addEventListener('click', () => {
    setFractionType('improper');
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });
  document.getElementById('fraction-type-mixed').addEventListener('click', () => {
    setFractionType('mixed');
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });

  // Language buttons
  document.getElementById('lang-zh').addEventListener('click', () => {
    setLanguage('zh');
    settingsManager.updateUI();
    settingsManager.save();
  });
  document.getElementById('lang-en').addEventListener('click', () => {
    setLanguage('en');
    settingsManager.updateUI();
    settingsManager.save();
  });

  // Decimal separator buttons
  document.getElementById('decimal-dot').addEventListener('click', () => {
    setDecimalSeparator('.');
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });
  document.getElementById('decimal-comma').addEventListener('click', () => {
    setDecimalSeparator(',');
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });

  // Thousand separator toggle
  document.getElementById('thousand-sep-toggle').addEventListener('click', () => {
    setThousandSeparator(!getThousandSeparator());
    settingsManager.updateUI();
    settingsManager.save();
    recalculateCurrent();
  });

  // Format buttons
  document.getElementById('format-norm1').addEventListener('click', () => setFormat('norm1'));
  document.getElementById('format-norm2').addEventListener('click', () => setFormat('norm2'));
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
  if (uiState.get('currentMode') === 'base') {
    recalculateCurrent();
  }
}

function insertText(text) {
  pushUndo();
  const insertValue = getHelperText(text);
  const currentInput = uiState.get('currentInput');
  const cursorIndex = uiState.get('cursorIndex');
  const newInput =
    currentInput.slice(0, cursorIndex) + insertValue + currentInput.slice(cursorIndex);
  uiState.batch({ currentInput: newInput, cursorIndex: cursorIndex + insertValue.length });
  updateDisplayWithCursor();
}

function handleBackspace() {
  const cursorIndex = uiState.get('cursorIndex');
  if (cursorIndex > 0) {
    pushUndo();
    const currentInput = uiState.get('currentInput');
    const newInput = currentInput.slice(0, cursorIndex - 1) + currentInput.slice(cursorIndex);
    uiState.batch({ currentInput: newInput, cursorIndex: cursorIndex - 1 });
  }
  updateDisplayWithCursor();
}

function handleClear() {
  if (uiState.get('currentInput')) pushUndo();
  uiState.batch({ currentInput: '', lastResult: '0', cursorIndex: 0 });
  clearError();
  updateDisplayWithCursor();
}

function moveCursorLeft() {
  const cursorIndex = uiState.get('cursorIndex');
  if (cursorIndex > 0) {
    uiState.set('cursorIndex', cursorIndex - 1);
    updateDisplayWithCursor();
  }
}

function moveCursorRight() {
  const cursorIndex = uiState.get('cursorIndex');
  const currentInput = uiState.get('currentInput');
  if (cursorIndex < currentInput.length) {
    uiState.set('cursorIndex', cursorIndex + 1);
    updateDisplayWithCursor();
  }
}

function handleAutoBracket() {
  if (settingsManager.getAutoBracketEnabled()) {
    const currentInput = uiState.get('currentInput');
    const newInput = autoCompleteBrackets(currentInput);
    uiState.batch({ currentInput: newInput, cursorIndex: newInput.length });
    updateDisplayWithCursor();
  }
}

function handleCalculate() {
  const currentInput = uiState.get('currentInput');
  if (!currentInput.trim()) {
    return;
  }

  let expr = currentInput;
  if (settingsManager.getAutoBracketEnabled()) {
    expr = autoCompleteBrackets(expr);
    uiState.batch({ currentInput: expr, cursorIndex: expr.length });
  }

  const result = evaluateExpression(expr, uiState.get('currentMode'));

  if (result.success) {
    const resultStr = result.result;
    uiState.set('lastResult', resultStr);
    setAns(resultStr);
    clearError();
    addHistory({ expression: expr, result: resultStr, mode: uiState.get('currentMode') });
    bus.emit('calculated', { expression: expr, result: resultStr });
    uiState.batch({ currentInput: resultStr, cursorIndex: resultStr.length });
    updateDisplayWithCursor();
  } else {
    const handled = errorHandler.handle(new Error(result.error));
    setError(handled.error);
    return;
  }
}

function recalculateCurrent() {
  const currentInput = uiState.get('currentInput');
  if (currentInput.trim()) {
    const result = evaluateExpression(currentInput, uiState.get('currentMode'));
    if (result.success) {
      uiState.set('lastResult', result.result);
      clearError();
    } else {
      // Suppress error for incomplete expressions (user still typing)
      const trimmed = currentInput.trim();
      const isIncomplete =
        /[+\-*/^(,]$|\b(sin|cos|tan|asin|acos|atan|log|ln|sqrt|abs|floor|ceil|exp|det|inv|transpose|trace|norm|dot|cross|mean|median|std|variance|sum|min|max)\($/.test(
          trimmed
        );
      if (!isIncomplete) {
        const handled = errorHandler.handle(new Error(result.error));
        setError(handled.error);
      } else {
        clearError();
      }
    }
    updateDisplayWithCursor();
  }
}

function updateDisplayWithCursor() {
  updateDisplay(uiState.get('currentInput'), uiState.get('lastResult'), uiState.get('cursorIndex'));
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
  uiState.batch({
    currentInput: historyItem.expression,
    cursorIndex: historyItem.expression.length,
    currentMode: historyItem.mode || 'standard',
    lastResult: historyItem.result || '0'
  });
  setActiveModeTab(uiState.get('currentMode'));
  renderHelperPanel(uiState.get('currentMode'), helperPanel);
  updateBaseKeyboard(getCurrentBase());
  updateDisplayWithCursor();
  panelManager.toggle('history');
}

function handleClearHistory() {
  if (confirm('确定要清空所有历史记录吗？')) {
    clearHistory();
  }
}

// ── 导出给其他模块使用 ──
export { bus, uiState };

// ── Start the app ──
init().catch(error => {
  const handled = errorHandler.handle(error);
  console.error('Failed to initialize app:', handled.error);
});
