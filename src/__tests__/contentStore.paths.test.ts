import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  setContent,
  deleteContent,
  getPathsSnapshot,
  subscribePaths,
} from '../lib/contentStore';

describe('contentStore path topology', () => {
  it('emits only on add/remove (not on content edit)', () => {
    const cb = vi.fn();
    const unsub = subscribePaths(cb);

    const p = 'app/test-new-file.txt';

    const beforeLen = getPathsSnapshot().length;

    setContent(p, ''); // ADD → emit
    expect(cb).toHaveBeenCalledTimes(1);
    expect(getPathsSnapshot().length).toBe(beforeLen + 1);

    setContent(p, 'changed'); // EDIT → no emit
    expect(cb).toHaveBeenCalledTimes(1);

    deleteContent(p); // REMOVE → emit
    expect(cb).toHaveBeenCalledTimes(2);
    expect(getPathsSnapshot().length).toBe(beforeLen);

    unsub();
  });

  it('returns a stable array reference when nothing changed', () => {
    const a = getPathsSnapshot();
    const b = getPathsSnapshot();
    expect(a).toBe(b); // referential equality
  });
});
