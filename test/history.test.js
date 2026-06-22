import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initHistory,
  addHistory,
  clearHistory,
  deleteHistoryItem,
  getHistoryItems,
  getFilteredHistory,
  setSearchQuery
} from '../renderer/history.js';
import { escapeAttr } from '../renderer/utils/escape.js';

// Mock DOM
const mockListElement = { innerHTML: '', prepend: vi.fn() };
const originalGetElementById = globalThis.document?.getElementById;

beforeEach(() => {
  mockListElement.innerHTML = '';
  vi.stubGlobal(
    'document',
    originalGetElementById
      ? document
      : {
          getElementById: id => (id === 'history-list' ? mockListElement : null),
          createElement: tag => {
            if (tag === 'div') {
              const el = { _text: '', set textContent(v) { this._text = v; }, get textContent() { return this._text; }, get innerHTML() { return this._text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); } };
              return el;
            }
            return { click: vi.fn(), href: '', download: '' };
          },
          body: { appendChild: vi.fn(), removeChild: vi.fn() }
        }
  );
});

function createMockStore(data = {}) {
  return {
    get: vi.fn(async (key, defaultVal) => (key in data ? data[key] : defaultVal)),
    set: vi.fn(async () => {})
  };
}

describe('initHistory', () => {
  it('loads empty array when store has no data', async () => {
    const store = createMockStore();
    await initHistory(store);
    expect(getHistoryItems()).toEqual([]);
  });

  it('loads saved history items', async () => {
    const items = [
      { id: 1, expression: '1+1', result: '2', mode: 'standard', timestamp: '2026-01-01T00:00:00Z' }
    ];
    const store = createMockStore({ calculator_history: items });
    await initHistory(store);
    expect(getHistoryItems()).toHaveLength(1);
    expect(getHistoryItems()[0].expression).toBe('1+1');
  });

  it('trims loaded items to MAX_HISTORY_ITEMS (100)', async () => {
    const items = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      expression: `expr${i}`,
      result: String(i),
      mode: 'standard',
      timestamp: new Date().toISOString()
    }));
    const store = createMockStore({ calculator_history: items });
    await initHistory(store);
    expect(getHistoryItems()).toHaveLength(100);
  });

  it('handles non-array saved data gracefully', async () => {
    const store = createMockStore({ calculator_history: 'not an array' });
    await initHistory(store);
    expect(getHistoryItems()).toEqual([]);
  });

  it('handles store.get error gracefully', async () => {
    const store = { get: vi.fn(async () => { throw new Error('fail'); }), set: vi.fn() };
    await initHistory(store);
    expect(getHistoryItems()).toEqual([]);
  });
});

describe('addHistory', () => {
  let store;

  beforeEach(async () => {
    store = createMockStore();
    await initHistory(store);
  });

  it('adds a valid history item', () => {
    addHistory({ expression: '2+3', result: '5', mode: 'standard' });
    const items = getHistoryItems();
    expect(items).toHaveLength(1);
    expect(items[0].expression).toBe('2+3');
    expect(items[0].result).toBe('5');
    expect(items[0].mode).toBe('standard');
    expect(items[0].id).toBeDefined();
    expect(items[0].timestamp).toBeDefined();
  });

  it('trims expression whitespace', () => {
    addHistory({ expression: '  2+3  ', result: '5' });
    expect(getHistoryItems()[0].expression).toBe('2+3');
  });

  it('rejects null or non-object input', () => {
    addHistory(null);
    addHistory(undefined);
    addHistory('string');
    expect(getHistoryItems()).toHaveLength(0);
  });

  it('rejects empty expression', () => {
    addHistory({ expression: '', result: '5' });
    addHistory({ expression: '   ', result: '5' });
    expect(getHistoryItems()).toHaveLength(0);
  });

  it('deduplicates consecutive identical expressions', () => {
    addHistory({ expression: '1+1', result: '2' });
    addHistory({ expression: '1+1', result: '2' });
    addHistory({ expression: '1+1', result: '2' });
    expect(getHistoryItems()).toHaveLength(1);
  });

  it('allows same expression with different intervening entries', () => {
    addHistory({ expression: '1+1', result: '2' });
    addHistory({ expression: '2+2', result: '4' });
    addHistory({ expression: '1+1', result: '2' });
    expect(getHistoryItems()).toHaveLength(3);
  });

  it('converts result to string', () => {
    addHistory({ expression: 'pi', result: 3.14159 });
    expect(getHistoryItems()[0].result).toBe('3.14159');
  });

  it('defaults mode to standard', () => {
    addHistory({ expression: '1+1', result: '2' });
    expect(getHistoryItems()[0].mode).toBe('standard');
  });

  it('saves to store', () => {
    addHistory({ expression: '1+1', result: '2' });
    expect(store.set).toHaveBeenCalledWith('calculator_history', expect.any(Array));
  });

  it('enforces MAX_HISTORY_ITEMS limit', () => {
    for (let i = 0; i < 110; i++) {
      addHistory({ expression: `expr${i}`, result: String(i) });
    }
    expect(getHistoryItems()).toHaveLength(100);
  });
});

describe('clearHistory', () => {
  it('removes all items', async () => {
    const store = createMockStore();
    await initHistory(store);
    addHistory({ expression: '1+1', result: '2' });
    addHistory({ expression: '2+2', result: '4' });
    expect(getHistoryItems()).toHaveLength(2);

    clearHistory();
    expect(getHistoryItems()).toEqual([]);
  });
});

describe('deleteHistoryItem', () => {
  it('removes a specific item by id', async () => {
    const store = createMockStore();
    await initHistory(store);

    // Ensure unique ids by mocking Date.now
    let now = 1000000;
    vi.spyOn(Date, 'now').mockImplementation(() => (now += 1));

    addHistory({ expression: '1+1', result: '2' });
    addHistory({ expression: '2+2', result: '4' });

    const items = getHistoryItems();
    // items[0] is '2+2' (most recent), items[1] is '1+1'
    const idToDelete = items[0].id;
    deleteHistoryItem(idToDelete);

    const remaining = getHistoryItems();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].expression).toBe('1+1');

    vi.restoreAllMocks();
  });
});

describe('getFilteredHistory', () => {
  beforeEach(async () => {
    const store = createMockStore();
    await initHistory(store);
    addHistory({ expression: 'sin(pi/2)', result: '1', mode: 'standard' });
    addHistory({ expression: '2+3', result: '5', mode: 'standard' });
    addHistory({ expression: 'cos(0)', result: '1', mode: 'standard' });
  });

  it('returns all items when no search query', () => {
    setSearchQuery('');
    expect(getFilteredHistory()).toHaveLength(3);
  });

  it('filters by expression substring', () => {
    setSearchQuery('sin');
    const filtered = getFilteredHistory();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].expression).toBe('sin(pi/2)');
  });

  it('filters by result value', () => {
    setSearchQuery('5');
    const filtered = getFilteredHistory();
    expect(filtered).toHaveLength(1);
    expect(filtered[0].expression).toBe('2+3');
  });

  it('search is case-insensitive', () => {
    setSearchQuery('SIN');
    expect(getFilteredHistory()).toHaveLength(1);
  });

  it('returns empty for no matches', () => {
    setSearchQuery('xyz_no_match');
    expect(getFilteredHistory()).toHaveLength(0);
  });
});

describe('escapeAttr utility', () => {
  it('escapes double quotes', () => {
    expect(escapeAttr('he said "hello"')).toBe('he said &quot;hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(escapeAttr("it's")).toBe('it&#39;s');
  });

  it('escapes angle brackets', () => {
    expect(escapeAttr('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes ampersands', () => {
    expect(escapeAttr('a&b')).toBe('a&amp;b');
  });

  it('converts non-string to string', () => {
    expect(escapeAttr(123)).toBe('123');
    expect(escapeAttr(null)).toBe('null');
  });
});

describe('getHistoryItems returns a copy', () => {
  it('mutations to returned array do not affect internal state', async () => {
    const store = createMockStore();
    await initHistory(store);
    addHistory({ expression: 'test', result: '1' });

    const items = getHistoryItems();
    items.length = 0;

    expect(getHistoryItems()).toHaveLength(1);
  });
});
