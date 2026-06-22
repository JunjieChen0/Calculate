import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM before importing MemoryManager
const mockErrorDisplay = { textContent: '' };
const mockButtons = [];

vi.stubGlobal(
  'document',
  {
    getElementById: id => {
      if (id === 'error-display') return mockErrorDisplay;
      return null;
    },
    querySelectorAll: selector => {
      if (selector === '.memory-btn') return mockButtons;
      return [];
    }
  }
);

import { MemoryManager } from '../renderer/modules/memory.js';

function createMockStore(data = {}) {
  return {
    get: vi.fn(async (key, defaultVal) => (key in data ? data[key] : defaultVal)),
    set: vi.fn(async () => {})
  };
}

describe('MemoryManager', () => {
  let manager;
  let store;

  beforeEach(() => {
    mockErrorDisplay.textContent = '';
    store = createMockStore();
    manager = new MemoryManager(store);
  });

  describe('initial state', () => {
    it('starts with value=0 and hasMemory=false', () => {
      expect(manager.value).toBe(0);
      expect(manager.hasMemory).toBe(false);
    });
  });

  describe('load', () => {
    it('loads saved memory from store', async () => {
      store = createMockStore({ calculator_memory: { value: 42, hasMemory: true } });
      manager = new MemoryManager(store);
      await manager.load();
      expect(manager.value).toBe(42);
      expect(manager.hasMemory).toBe(true);
    });

    it('defaults to 0/false when no saved data', async () => {
      await manager.load();
      expect(manager.value).toBe(0);
      expect(manager.hasMemory).toBe(false);
    });

    it('handles load error gracefully', async () => {
      store = { get: vi.fn(async () => { throw new Error('fail'); }), set: vi.fn() };
      manager = new MemoryManager(store);
      await manager.load();
      expect(manager.value).toBe(0);
    });
  });

  describe('MS (Memory Store)', () => {
    it('stores a numeric value', () => {
      manager.handleAction('MS', '42');
      expect(manager.value).toBe(42);
      expect(manager.hasMemory).toBe(true);
    });

    it('stores a number type directly', () => {
      manager.handleAction('MS', 100);
      expect(manager.value).toBe(100);
      expect(manager.hasMemory).toBe(true);
    });

    it('rejects non-numeric string', () => {
      manager.handleAction('MS', '3 + 4i');
      expect(manager.hasMemory).toBe(false);
    });

    it('rejects matrix-like string', () => {
      manager.handleAction('MS', '[[1,2],[3,4]]');
      expect(manager.hasMemory).toBe(false);
    });

    it('shows feedback for invalid values', () => {
      manager.handleAction('MS', 'not a number');
      expect(mockErrorDisplay.textContent).toBe('无法存储非数值结果');
    });
  });

  describe('MR (Memory Recall)', () => {
    it('recalls stored value via onRecall callback', () => {
      manager.handleAction('MS', '10');
      const onRecall = vi.fn();
      manager.handleAction('MR', '0', onRecall);
      expect(onRecall).toHaveBeenCalledWith('10');
    });

    it('does not call onRecall when no memory', () => {
      const onRecall = vi.fn();
      manager.handleAction('MR', '0', onRecall);
      expect(onRecall).not.toHaveBeenCalled();
    });
  });

  describe('M+ (Memory Add)', () => {
    it('adds current value to memory', () => {
      manager.handleAction('MS', '10');
      manager.handleAction('M+', '5');
      expect(manager.value).toBe(15);
    });

    it('activates memory on M+ even from zero', () => {
      manager.handleAction('M+', '7');
      expect(manager.value).toBe(7);
      expect(manager.hasMemory).toBe(true);
    });

    it('rejects non-numeric and shows feedback', () => {
      manager.handleAction('M+', 'NaN_string');
      expect(manager.hasMemory).toBe(false);
      expect(mockErrorDisplay.textContent).toBe('无法存储非数值结果');
    });
  });

  describe('M- (Memory Subtract)', () => {
    it('subtracts current value from memory', () => {
      manager.handleAction('MS', '20');
      manager.handleAction('M-', '8');
      expect(manager.value).toBe(12);
    });

    it('rejects non-numeric', () => {
      manager.handleAction('MS', '20');
      manager.handleAction('M-', 'abc');
      expect(manager.value).toBe(20);
    });
  });

  describe('MC (Memory Clear)', () => {
    it('clears memory value and flag', () => {
      manager.handleAction('MS', '50');
      expect(manager.hasMemory).toBe(true);

      manager.handleAction('MC', '0');
      expect(manager.value).toBe(0);
      expect(manager.hasMemory).toBe(false);
    });
  });

  describe('save and load round-trip', () => {
    it('persists memory state to store', async () => {
      manager.handleAction('MS', '99');
      expect(store.set).toHaveBeenCalledWith('calculator_memory', {
        value: 99,
        hasMemory: true
      });
    });
  });

  describe('Number() rejection of complex numbers', () => {
    it('parseFloat silently truncates "3 + 4i" to 3 (known pitfall)', () => {
      // This test documents WHY we use Number() instead of parseFloat()
      expect(parseFloat('3 + 4i')).toBe(3); // silent truncation!
      expect(Number('3 + 4i')).toBeNaN(); // correct rejection
    });

    it('rejects complex number results via Number()', () => {
      manager.handleAction('MS', '3 + 4i');
      expect(manager.hasMemory).toBe(false);
    });
  });

  describe('handleAction with special numeric values', () => {
    it('rejects Infinity', () => {
      manager.handleAction('MS', 'Infinity');
      expect(manager.hasMemory).toBe(false);
    });

    it('rejects NaN', () => {
      manager.handleAction('MS', 'NaN');
      expect(manager.hasMemory).toBe(false);
    });

    it('accepts negative numbers', () => {
      manager.handleAction('MS', '-42');
      expect(manager.value).toBe(-42);
      expect(manager.hasMemory).toBe(true);
    });

    it('accepts decimal numbers', () => {
      manager.handleAction('MS', '3.14159');
      expect(manager.value).toBeCloseTo(3.14159);
      expect(manager.hasMemory).toBe(true);
    });

    it('accepts scientific notation', () => {
      manager.handleAction('MS', '1.5e10');
      expect(manager.value).toBe(1.5e10);
      expect(manager.hasMemory).toBe(true);
    });
  });
});
