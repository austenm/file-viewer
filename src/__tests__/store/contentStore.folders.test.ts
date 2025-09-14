import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPathsSnapshot,
  renameFolder,
  __resetStoreForTests,
  addFolder,
  deleteTree,
} from '../../lib/contentStore';

describe('contentStore folder operations', () => {
  beforeEach(() => {
    __resetStoreForTests({
      clearLocalStorage: true,
      files: [{ path: 'a/x.ts' }, { path: 'a/b/y.ts' }],
      folders: ['a', 'a/b'],
    });
  });

  it('addFolder creates new empty folder', () => {
    const beforeLen = getPathsSnapshot().length;
    addFolder('q');
    const snap = getPathsSnapshot();
    expect(snap).toContain('q/');
    expect(getPathsSnapshot().length).toEqual(beforeLen + 1);
  });

  it('renameFolder moves files & subfolders in one action', () => {
    const before = getPathsSnapshot();
    expect(before).toEqual(
      expect.arrayContaining(['a/', 'a/b/', 'a/x.ts', 'a/b/y.ts']),
    );
    renameFolder('a', 'z');
    const after = getPathsSnapshot();
    expect(after).toEqual(
      expect.arrayContaining(['z/', 'z/b/', 'z/x.ts', 'z/b/y.ts']),
    );
    expect(after).not.toEqual(expect.arrayContaining(['a/', 'a/b']));
  });

  it('deleteTree removes folder and children', () => {
    deleteTree('a');
    expect(getPathsSnapshot()).toEqual([]);
  });
});
