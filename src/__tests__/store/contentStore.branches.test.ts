import { describe, it, expect } from 'vitest';
import {
  __resetStoreForTests as reset,
  setContent,
  addFolder,
  renameFolder,
  renamePath,
  deleteTree,
  getPathsSnapshot,
} from '../../lib/contentStore';

describe('contentStore branches', () => {
  it('renamePath collision and file→file rename edge (line ~120)', () => {
    reset();
    setContent('a.ts', '1');
    setContent('b.ts', '2');
    renamePath('a.ts', 'b.ts');
    const snap = getPathsSnapshot();
    expect(snap.filter((p) => p === 'b.ts').length).toBe(1);
  });

  it('renameFolder remaps descendants (173–195)', () => {
    reset();
    addFolder('src');
    setContent('src/index.ts', 'i');
    setContent('src/util.ts', 'u');
    renameFolder('src', 'pkg');
    const snap = getPathsSnapshot();
    expect(snap).toEqual(
      expect.arrayContaining(['pkg/', 'pkg/index.ts', 'pkg/util.ts']),
    );
  });

  it('deleteTree removes implicit descendants (216–218)', () => {
    reset();
    setContent('docs/readme.md', '# hi');
    setContent('docs/a.md', 'a');
    deleteTree('docs');
    const snap = getPathsSnapshot();
    expect(snap.some((p) => p.startsWith('docs'))).toBe(false);
  });
});
