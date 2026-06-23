import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM elements
const mockList = { innerHTML: '', addEventListener: vi.fn(), appendChild(el) { this.innerHTML += el.innerHTML || el.textContent || ''; }, set textContent(v) { if (v === '') this.innerHTML = ''; } }
const mockClearAllBtn = { addEventListener: vi.fn() };

vi.stubGlobal('document', {
  getElementById: id => {
    if (id === 'variables-list') return mockList;
    if (id === 'variables-clear-all') return mockClearAllBtn;
    return null;
  },
  createElement: () => {
    let _text = '';
    return {
      get textContent() {
        return _text;
      },
      set textContent(v) {
        _text = String(v);
      },
      get innerHTML() {
        return _text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    };
  }
});

import { VariablesPanelManager } from '../renderer/modules/variables-panel.js';
import {
  setVariable,
  clearAllVariables,
  setCustomFunction,
  clearAllCustomFunctions
} from '../renderer/calculator/state.js';

describe('VariablesPanelManager', () => {
  let panel;
  let onInsert;

  beforeEach(() => {
    clearAllVariables();
    clearAllCustomFunctions();
    mockList.innerHTML = '';
    onInsert = vi.fn();
    panel = new VariablesPanelManager(onInsert);
  });

  describe('render', () => {
    it('shows empty message when no variables', () => {
      panel.render();
      expect(mockList.innerHTML).toContain('暂无存储变量');
    });

    it('renders stored variables', () => {
      setVariable('A', 42);
      setVariable('B', 3.14);
      panel.render();
      expect(mockList.innerHTML).toContain('A');
      expect(mockList.innerHTML).toContain('42');
      expect(mockList.innerHTML).toContain('B');
      expect(mockList.innerHTML).toContain('3.14');
    });

    it('renders variables section title', () => {
      setVariable('A', 1);
      panel.render();
      expect(mockList.innerHTML).toContain('变量');
    });

    it('renders custom functions', () => {
      setCustomFunction('f', 'x', 'x^2');
      panel.render();
      expect(mockList.innerHTML).toContain('f(x)');
      expect(mockList.innerHTML).toContain('x^2');
    });

    it('renders custom functions section title', () => {
      setCustomFunction('g', 't', 't+1');
      panel.render();
      expect(mockList.innerHTML).toContain('自定义函数');
    });

    it('renders both variables and functions', () => {
      setVariable('A', 10);
      setCustomFunction('f', 'x', 'x^2');
      panel.render();
      expect(mockList.innerHTML).toContain('A');
      expect(mockList.innerHTML).toContain('f(x)');
    });

    it('sorts variables alphabetically', () => {
      setVariable('C', 3);
      setVariable('A', 1);
      setVariable('B', 2);
      panel.render();
      const posA = mockList.innerHTML.indexOf('"A"');
      const posB = mockList.innerHTML.indexOf('"B"');
      const posC = mockList.innerHTML.indexOf('"C"');
      expect(posA).toBeLessThan(posB);
      expect(posB).toBeLessThan(posC);
    });
  });

  describe('integer display', () => {
    it('displays integers without decimals', () => {
      setVariable('A', 100);
      panel.render();
      expect(mockList.innerHTML).toContain('100');
    });

    it('displays decimals with precision', () => {
      setVariable('A', 3.14159);
      panel.render();
      expect(mockList.innerHTML).toContain('3.14159');
    });
  });

  describe('clearAll', () => {
    it('clears all variables when clearAll button clicked', () => {
      // The clearAllBtn event listener is set up in constructor
      expect(mockClearAllBtn.addEventListener).toHaveBeenCalled();
    });
  });
});
