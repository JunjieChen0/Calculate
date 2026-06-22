import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock DOM for SpreadsheetManager
const mockInputs = [];
const mockDisplays = [];

vi.stubGlobal('document', {
  getElementById: id => {
    if (id === 'spreadsheet-panel') return { style: {} };
    if (id === 'spreadsheet-table') {
      return {
        innerHTML: '',
        querySelectorAll: selector => {
          if (selector === '.ss-input') return mockInputs;
          if (selector === '.ss-display') return mockDisplays;
          return [];
        },
        addEventListener: vi.fn()
      };
    }
    if (id === 'spreadsheet-status') return { textContent: '' };
    return null;
  }
});

vi.stubGlobal(
  'TextEncoder',
  class {
    encode(str) {
      return new Uint8Array([...str].map(c => c.charCodeAt(0)));
    }
  }
);

import { SpreadsheetManager } from '../renderer/modules/spreadsheet.js';

describe('SpreadsheetManager', () => {
  let ss;

  beforeEach(() => {
    mockInputs.length = 0;
    mockDisplays.length = 0;
    ss = new SpreadsheetManager();
  });

  describe('Cell value storage', () => {
    it('stores and retrieves numeric values', () => {
      ss.cells['A1'] = '42';
      expect(ss.getCellValue('A1')).toBe(42);
    });

    it('returns 0 for empty cells', () => {
      expect(ss.getCellValue('B2')).toBe(0);
    });

    it('returns 0 for non-numeric cells', () => {
      ss.cells['A1'] = 'hello';
      expect(ss.getCellValue('A1')).toBe(0);
    });
  });

  describe('Formula evaluation', () => {
    it('evaluates simple arithmetic formula', () => {
      ss.cells['A1'] = '=1+2';
      expect(ss.getCellValue('A1')).toBe(3);
    });

    it('evaluates cell reference formula', () => {
      ss.cells['A1'] = '10';
      ss.cells['B1'] = '20';
      ss.cells['C1'] = '=A1+B1';
      expect(ss.getCellValue('C1')).toBe(30);
    });

    it('evaluates multiplication formula', () => {
      ss.cells['A1'] = '5';
      ss.cells['B1'] = '=A1*2';
      expect(ss.getCellValue('B1')).toBe(10);
    });

    it('evaluates nested cell references', () => {
      ss.cells['A1'] = '3';
      ss.cells['B1'] = '4';
      ss.cells['C1'] = '=A1^2+B1^2';
      expect(ss.getCellValue('C1')).toBe(25);
    });

    it('handles division by zero gracefully', () => {
      ss.cells['A1'] = '10';
      ss.cells['B1'] = '0';
      ss.cells['C1'] = '=A1/B1';
      // Should return Infinity which is a valid number
      const val = ss.getCellValue('C1');
      expect(typeof val).toBe('number');
    });
  });

  describe('SUM function', () => {
    it('calculates SUM of range', () => {
      ss.cells['A1'] = '1';
      ss.cells['A2'] = '2';
      ss.cells['A3'] = '3';
      ss.cells['B1'] = '=SUM(A1:A3)';
      expect(ss.getCellValue('B1')).toBe(6);
    });

    it('calculates SUM of 2D range', () => {
      ss.cells['A1'] = '1';
      ss.cells['A2'] = '2';
      ss.cells['B1'] = '3';
      ss.cells['B2'] = '4';
      ss.cells['C1'] = '=SUM(A1:B2)';
      expect(ss.getCellValue('C1')).toBe(10);
    });

    it('SUM of empty range returns 0', () => {
      ss.cells['A1'] = '=SUM(A2:A5)';
      expect(ss.getCellValue('A1')).toBe(0);
    });
  });

  describe('AVG function', () => {
    it('calculates AVG of range', () => {
      ss.cells['A1'] = '2';
      ss.cells['A2'] = '4';
      ss.cells['A3'] = '6';
      ss.cells['B1'] = '=AVG(A1:A3)';
      expect(ss.getCellValue('B1')).toBe(4);
    });
  });

  describe('COUNT function', () => {
    it('counts cells in range', () => {
      ss.cells['A1'] = '10';
      ss.cells['A2'] = '20';
      ss.cells['A3'] = '30';
      ss.cells['B1'] = '=COUNT(A1:A3)';
      expect(ss.getCellValue('B1')).toBe(3);
    });

    it('COUNT of empty range returns 0', () => {
      ss.cells['A1'] = '=COUNT(B1:B5)';
      expect(ss.getCellValue('A1')).toBe(0);
    });
  });

  describe('MAX and MIN functions', () => {
    it('finds MAX in range', () => {
      ss.cells['A1'] = '3';
      ss.cells['A2'] = '7';
      ss.cells['A3'] = '1';
      ss.cells['B1'] = '=MAX(A1:A3)';
      expect(ss.getCellValue('B1')).toBe(7);
    });

    it('finds MIN in range', () => {
      ss.cells['A1'] = '3';
      ss.cells['A2'] = '7';
      ss.cells['A3'] = '1';
      ss.cells['B1'] = '=MIN(A1:A3)';
      expect(ss.getCellValue('B1')).toBe(1);
    });
  });

  describe('Error handling', () => {
    it('returns #ERR for invalid formula', () => {
      ss.cells['A1'] = '=invalid++';
      expect(ss.getCellValue('A1')).toBe('#ERR');
    });

    it('handles circular-like references gracefully', () => {
      ss.cells['A1'] = '=B1+1';
      ss.cells['B1'] = '5';
      expect(ss.getCellValue('A1')).toBe(6);
    });
  });

  describe('clearAll', () => {
    it('clears all cell data', () => {
      ss.cells['A1'] = '10';
      ss.cells['B1'] = '20';
      ss.clearAll();
      expect(Object.keys(ss.cells).length).toBe(0);
      expect(ss.getCellValue('A1')).toBe(0);
    });
  });
});
