import { inputToLatex, renderFormula, renderResult } from '../formula-renderer.js';

const formulaPreview = document.getElementById('formula-preview');
const resultDisplay = document.getElementById('result-display');
const errorDisplay = document.getElementById('error-display');

export function updateDisplay(currentInput, lastResult, cursorIndex = null) {
  if (!formulaPreview || !resultDisplay) {
    return;
  }

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
