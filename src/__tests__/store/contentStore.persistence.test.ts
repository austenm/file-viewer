import { describe, expect, it, vi, beforeEach } from 'vitest';
import { __resetStoreForTests, setContent } from '../../lib/contentStore';

describe('tests persistence in localStorage', () => {
  beforeEach(() => {
    __resetStoreForTests({
      clearLocalStorage: true,
      files: [],
    });
  });

  it('debounces localStorage writes', () => {
    vi.useFakeTimers();
    setContent('a/x.ts', '');
    setContent('a/y.ts', '');
    vi.runAllTimers();
    const raw = localStorage.getItem('fv:files:v1');
    expect(raw).toMatch(/"a\/x\.ts"/);
    expect(raw).toMatch(/"a\/y\.ts"/);
    vi.useRealTimers();
  });

  it('coalesces persist calls via schedulePersist', () => {
    __resetStoreForTests?.({ clearLocalStorage: true });

    vi.useFakeTimers();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    setContent('a.ts', '1');
    setContent('b.ts', '2');

    vi.advanceTimersByTime(240);
    expect(
      setItemSpy.mock.calls.filter(([k]) => k === 'fv:files:v1').length,
    ).toBe(0);

    vi.advanceTimersByTime(20);
    const calls = setItemSpy.mock.calls.filter(([k]) => k === 'fv:files:v1');
    expect(calls.length).toBe(1);

    vi.useRealTimers();
    setItemSpy.mockRestore();
  });
});
