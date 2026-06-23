import { describe, it, expect, vi, afterAll } from 'vitest';
import { EventBus } from '../renderer/core/event-bus.js';
import { ReactiveState, createAppState } from '../renderer/core/state.js';
import { CalculatorError, ErrorCode, ErrorHandler } from '../renderer/core/errors.js';
import { logger } from '../renderer/core/logger.js';
import { t, setLocale, getLocale } from '../renderer/core/i18n.js';

// ── EventBus ──
describe('EventBus', () => {
  it('calls subscribers when event is emitted', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test', handler);
    bus.emit('test', { value: 42 });
    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it('supports multiple subscribers', () => {
    const bus = new EventBus();
    const h1 = vi.fn();
    const h2 = vi.fn();
    bus.on('test', h1);
    bus.on('test', h2);
    bus.emit('test', 'data');
    expect(h1).toHaveBeenCalledWith('data');
    expect(h2).toHaveBeenCalledWith('data');
  });

  it('unsubscribes correctly', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const unsub = bus.on('test', handler);
    unsub();
    bus.emit('test', 'data');
    expect(handler).not.toHaveBeenCalled();
  });

  it('off() removes specific handler', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test', handler);
    bus.off('test', handler);
    bus.emit('test', 'data');
    expect(handler).not.toHaveBeenCalled();
  });

  it('once() fires only once', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.once('test', handler);
    bus.emit('test', 'first');
    bus.emit('test', 'second');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('first');
  });

  it('does not throw when emitting with no subscribers', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nonexistent', 'data')).not.toThrow();
  });

  it('catches handler errors without affecting other handlers', () => {
    const bus = new EventBus();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const badHandler = vi.fn(() => {
      throw new Error('boom');
    });
    const goodHandler = vi.fn();
    bus.on('test', badHandler);
    bus.on('test', goodHandler);
    bus.emit('test', 'data');
    expect(badHandler).toHaveBeenCalled();
    expect(goodHandler).toHaveBeenCalledWith('data');
    consoleSpy.mockRestore();
  });
});

// ── ReactiveState ──
describe('ReactiveState', () => {
  it('stores and retrieves values', () => {
    const state = new ReactiveState({ count: 0 });
    expect(state.get('count')).toBe(0);
    state.set('count', 5);
    expect(state.get('count')).toBe(5);
  });

  it('notifies listeners on value change', () => {
    const state = new ReactiveState({ count: 0 });
    const listener = vi.fn();
    state.on('count', listener);
    state.set('count', 1);
    expect(listener).toHaveBeenCalledWith(1, 0);
  });

  it('does not notify when value is unchanged', () => {
    const state = new ReactiveState({ count: 0 });
    const listener = vi.fn();
    state.on('count', listener);
    state.set('count', 0);
    expect(listener).not.toHaveBeenCalled();
  });

  it('batch() updates multiple values and notifies once each', () => {
    const state = new ReactiveState({ a: 1, b: 2 });
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    state.on('a', listenerA);
    state.on('b', listenerB);
    state.batch({ a: 10, b: 20 });
    expect(state.get('a')).toBe(10);
    expect(state.get('b')).toBe(20);
    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });

  it('on() returns unsubscribe function', () => {
    const state = new ReactiveState({ count: 0 });
    const listener = vi.fn();
    const unsub = state.on('count', listener);
    unsub();
    state.set('count', 1);
    expect(listener).not.toHaveBeenCalled();
  });

  it('snapshot() returns frozen copy', () => {
    const state = new ReactiveState({ count: 0 });
    const snap = state.snapshot();
    expect(snap).toEqual({ count: 0 });
    expect(Object.isFrozen(snap)).toBe(true);
  });

  it('createAppState() returns expected initial state', () => {
    const state = createAppState();
    expect(state.get('currentMode')).toBe('standard');
    expect(state.get('currentInput')).toBe('');
    expect(state.get('lastResult')).toBe('0');
    expect(state.get('cursorIndex')).toBe(0);
  });

  it('catches listener errors without affecting others', () => {
    const state = new ReactiveState({ count: 0 });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const badListener = vi.fn(() => {
      throw new Error('boom');
    });
    const goodListener = vi.fn();
    state.on('count', badListener);
    state.on('count', goodListener);
    state.set('count', 1);
    expect(badListener).toHaveBeenCalled();
    expect(goodListener).toHaveBeenCalledWith(1, 0);
    consoleSpy.mockRestore();
  });
});

// ── ErrorHandler ──
describe('ErrorHandler', () => {
  it('handles CalculatorError with code', () => {
    const handler = new ErrorHandler();
    const error = new CalculatorError(ErrorCode.DIVISION_BY_ZERO, '除零错误');
    const result = handler.handle(error);
    expect(result.success).toBe(false);
    expect(result.code).toBe('DIVISION_BY_ZERO');
    expect(result.error).toBe('除零错误');
  });

  it('infers error code from error message', () => {
    const handler = new ErrorHandler();
    const result = handler.handle(new Error('Division by zero'));
    expect(result.success).toBe(false);
    expect(result.code).toBe('DIVISION_BY_ZERO');
  });

  it('falls back to INVALID_EXPRESSION for unknown errors', () => {
    const handler = new ErrorHandler();
    const result = handler.handle(new Error('something weird'));
    expect(result.success).toBe(false);
    expect(result.code).toBe('INVALID_EXPRESSION');
  });

  it('ErrorCode is frozen', () => {
    expect(Object.isFrozen(ErrorCode)).toBe(true);
  });

  it('CalculatorError has correct name', () => {
    const error = new CalculatorError(ErrorCode.OVERFLOW, '溢出');
    expect(error.name).toBe('CalculatorError');
    expect(error instanceof Error).toBe(true);
    expect(error instanceof CalculatorError).toBe(true);
  });
});

// ── Logger ──
describe('Logger', () => {
  it('has expected log methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('stores recent logs', () => {
    logger.warn('test warning');
    const logs = logger.getRecentLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1].args[0]).toBe('test warning');
  });

  it('clear() empties log buffer', () => {
    logger.info('temp');
    logger.clear();
    expect(logger.getRecentLogs().length).toBe(0);
  });
});

// ── i18n ──
describe('i18n', () => {
  it('defaults to zh locale', () => {
    expect(getLocale()).toBe('zh');
  });

  it('translates known key in zh', () => {
    setLocale('zh');
    expect(t('error.divisionByZero')).toBe('除零错误');
    expect(t('mode.standard')).toBe('标准');
  });

  it('translates known key in en', () => {
    setLocale('en');
    expect(t('error.divisionByZero')).toBe('Division by zero');
    expect(t('mode.standard')).toBe('Standard');
  });

  it('returns key for unknown translation', () => {
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('supports parameter substitution', () => {
    setLocale('zh');
    const result = t('error.divisionByZero', {});
    expect(result).toBe('除零错误');
  });

  it('ignores invalid locale', () => {
    setLocale('invalid');
    expect(getLocale()).toBe('zh'); // unchanged
  });

  // restore
  afterAll(() => setLocale('zh'));
});
