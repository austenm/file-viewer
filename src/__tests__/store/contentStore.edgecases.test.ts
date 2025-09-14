import { describe, it, expect, beforeEach } from 'vitest';
import {
  __resetStoreForTests as reset,
  renameFolder,
  renamePath,
  deleteTree,
  getPathsSnapshot,
} from '../../lib/contentStore';

describe('Test early returns, no-op deleteTree', () => {
  beforeEach(() => reset?.({ clearLocalStorage: true }));

  it('renameFolder returns false when no old dir exists', () => {
    expect(renameFolder('ghost', 'new')).toBe(false);
  });

  it('renameFolder returns false when target folder exists', () => {
    reset?.({ folders: ['old', 'new'] });
    expect(renameFolder('old', 'new')).toBe(false);
  });

  it('renamePath returns false when target exists', () => {
    reset?.({
      files: [
        { path: 'a.ts', content: '' },
        { path: 'b.ts', content: '' },
      ],
    });
    expect(renamePath('a.ts', 'b.ts')).toBe(false);
  });

  it('deleteTree no-ops when base not present', () => {
    reset?.({ files: [{ path: 'a.ts', content: '' }] });
    deleteTree('nope');
    const snap = getPathsSnapshot();
    expect(snap).toContain('a.ts');
  });
});
