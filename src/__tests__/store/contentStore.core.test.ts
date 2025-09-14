import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setContent,
  deleteContent,
  getPathsSnapshot,
  subscribePaths,
  __resetStoreForTests,
  renamePath,
} from '../../lib/contentStore';

describe('contentStore path topology', () => {
  beforeEach(() => {
    __resetStoreForTests({
      clearLocalStorage: true,
      files: [{ path: 'a/x.ts' }, { path: 'a/y.ts' }],
    });
  });

  it('adds a new file and emits once', () => {
    const calls: number[] = [];
    const unsub = subscribePaths(() => calls.push(1));
    setContent('a/z.ts', '');
    expect(getPathsSnapshot()).toEqual(expect.arrayContaining(['a/z.ts']));
    expect(calls.length).toBe(1);
    unsub();
  });

  it('emits only on add/remove (not on content edit)', () => {
    const cb = vi.fn();
    const unsub = subscribePaths(cb);

    const p = 'app/test-new-file.txt';

    const beforeLen = getPathsSnapshot().length;

    setContent(p, '');
    expect(cb).toHaveBeenCalledTimes(1);
    expect(getPathsSnapshot().length).toBe(beforeLen + 1);

    setContent(p, 'changed');
    expect(cb).toHaveBeenCalledTimes(1);

    deleteContent(p);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(getPathsSnapshot().length).toBe(beforeLen);

    unsub();
  });

  it('renamePath moves a file and updates snapshot', () => {
    const cb = vi.fn();
    const unsub = subscribePaths(cb);
    renamePath('a/x.ts', 'a/a.ts');
    const snap = getPathsSnapshot();
    expect(snap).toEqual(expect.arrayContaining(['a/a.ts', 'a/y.ts']));
    expect(snap).not.toContain('a/x.ts');
    expect(cb).toHaveBeenCalledTimes(1);
    unsub();
  });

  it('returns a stable array reference when nothing changed', () => {
    const a = getPathsSnapshot();
    const b = getPathsSnapshot();
    expect(a).toBe(b);
  });
});
