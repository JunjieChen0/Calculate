export function initKeyboard({
  onInsert,
  onBackspace,
  onClear,
  onCalculate,
  onCursorLeft,
  onCursorRight,
  onToggleHistory,
  onToggleTheme,
  onClearHistory,
  onAutoBracket,
  getCurrentMode,
  isPanelOpen,
  closePanel,
  onToggleHelp
}) {
  document.addEventListener('keydown', event => {
    // Ignore when typing in editable fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key;

    // Tab key for auto-bracket completion
    if (key === 'Tab') {
      event.preventDefault();
      if (onAutoBracket) {
        onAutoBracket();
      }
      return;
    }

    // Cursor movement
    if (key === 'ArrowLeft') {
      event.preventDefault();
      if (onCursorLeft) {
        onCursorLeft();
      }
      return;
    }

    if (key === 'ArrowRight') {
      event.preventDefault();
      if (onCursorRight) {
        onCursorRight();
      }
      return;
    }

    // Numbers and operators
    if (/^[0-9.\-+*/^()%!=,]$/.test(key)) {
      event.preventDefault();
      onInsert(key);
      return;
    }

    // Parentheses
    if (key === '(' || key === ')') {
      event.preventDefault();
      onInsert(key);
      return;
    }

    // Letters for functions and constants
    if (/^[a-zA-Z]$/.test(key)) {
      event.preventDefault();
      onInsert(key);
      return;
    }

    // Special keys
    switch (key) {
      case 'Enter':
        event.preventDefault();
        onCalculate();
        break;
      case '=':
        event.preventDefault();
        if (getCurrentMode && getCurrentMode() === 'solve') {
          onInsert('=');
        } else {
          onCalculate();
        }
        break;
      case 'Backspace':
        event.preventDefault();
        onBackspace();
        break;
      case 'Escape':
        event.preventDefault();
        if (isPanelOpen && isPanelOpen() && closePanel) {
          closePanel();
        } else {
          onClear();
        }
        break;
      case ' ': {
        event.preventDefault();
        onInsert(' ');
        break;
      }
    }

    // Shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (key.toLowerCase()) {
        case 'h':
          event.preventDefault();
          onToggleHistory();
          break;
        case 't':
          event.preventDefault();
          onToggleTheme();
          break;
        case 'l':
          event.preventDefault();
          if (onClearHistory) {
            onClearHistory();
          }
          break;
        case '/':
        case '?':
          event.preventDefault();
          if (onToggleHelp) {
            onToggleHelp();
          }
          break;
      }
    }
  });
}

/**
 * Auto-complete unclosed parentheses in an expression.
 */
export function autoCompleteBrackets(expression) {
  if (!expression) {
    return '';
  }

  let openCount = 0;
  for (const char of expression) {
    if (char === '(') openCount++;
    else if (char === ')') openCount--;
  }

  if (openCount <= 0) {
    return expression;
  }

  return expression + ')'.repeat(openCount);
}
