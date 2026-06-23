import { inputToLatex, renderFormula, renderResult } from '../formula-renderer.js';

const formulaPreview = document.getElementById('formula-preview');
const resultDisplay = document.getElementById('result-display');
const errorDisplay = document.getElementById('error-display');

// ── rAF 节流：合并同帧内的多次渲染请求 ──
let renderPending = false;
let pendingInput = null;
let pendingResult = null;
let pendingCursor = null;

function flushRender() {
  renderPending = false;
  doUpdateDisplay(pendingInput, pendingResult, pendingCursor);
  pendingInput = null;
  pendingResult = null;
  pendingCursor = null;
}

function doUpdateDisplay(currentInput, lastResult, cursorIndex) {
  if (!formulaPreview || !resultDisplay) return;

  if (!currentInput || currentInput.trim() === '') {
    if (!lastResult || lastResult === '0') {
      formulaPreview.innerHTML = '';
    }
    resultDisplay.textContent = '0';
  } else {
    const cleanInput = currentInput.replace(/\u200B/g, '');
    const latex = inputToLatex(cleanInput);
    renderFormula(formulaPreview, latex);
    if (cursorIndex !== null) {
      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'formula-cursor';
      formulaPreview.appendChild(cursorSpan);
    }
  }

  if (lastResult !== undefined && lastResult !== null) {
    renderResult(resultDisplay, String(lastResult));
  }
}

export function updateDisplay(currentInput, lastResult, cursorIndex = null) {
  pendingInput = currentInput;
  pendingResult = lastResult;
  pendingCursor = cursorIndex;
  if (!renderPending) {
    renderPending = true;
    requestAnimationFrame(flushRender);
  }
}

export function setError(message) {
  if (errorDisplay) {
    errorDisplay.textContent = message || '';
  }
}

export function clearError() {
  setError('');
}

export async function copyResult(lastResult) {
  if (!lastResult && lastResult !== '0' && lastResult !== 0) {
    return;
  }

  try {
    await navigator.clipboard.writeText(String(lastResult));
  } catch {
    console.error('Failed to copy result');
  }
}
