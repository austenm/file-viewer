import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFilesList from '../hooks/useFilesList';
import {
  __resetStoreForTests,
  setContent,
  deleteContent,
} from '../lib/contentStore';

beforeEach(() => {
  __resetStoreForTests({
    clearLocalStorage: true,
    files: [
      { path: 'app/README.md', content: '# seed' },
      { path: 'app/main.tsx', content: 'export {}' },
    ],
  });
});

describe('useFilesList', () => {
  it('re-renders when a new file is added/removed', () => {
    const { result } = renderHook(() => useFilesList());
    const initial = result.current.length;

    const p = 'app/xyz-new.md';

    act(() => {
      setContent(p, '');
    });

    expect(result.current.length).toBe(initial + 1);
    expect(result.current).toContain(p);

    act(() => {
      deleteContent(p);
    });

    expect(result.current.length).toBe(initial);
    expect(result.current).not.toContain(p);
  });
});
