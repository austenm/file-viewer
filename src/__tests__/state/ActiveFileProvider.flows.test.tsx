import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  act,
  waitFor,
  render,
  fireEvent,
  screen,
} from '@testing-library/react';
import { Probe, renderWithProvider } from '../../test/utils';
import { __resetStoreForTests } from '../../lib/contentStore';
import * as store from '../../lib/contentStore';
import { FileTree } from '../../components';
import ActiveFileProvider from '../../state/ActiveFileProvider';

describe('test complex ActiveFileProvider flows', () => {
  beforeEach(() => {
    try {
      localStorage.clear();
    } catch {}
    __resetStoreForTests({
      clearLocalStorage: true,
      files: [
        { path: 'app/README.md', content: '# readme' },
        { path: 'app/src/main.tsx', content: 'export {}' }, // <-- seed it
      ],
      folders: ['app', 'app/src'],
    });
  });

  it('deletePathAt prompts when any descendant is dirty', async () => {
    let api: any;
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    renderWithProvider(<Probe onReady={(a) => (api = a)} />);

    await act(async () => {
      api.actions.openFile('app/src/main.tsx');
    });
    await act(async () => {
      api.actions.setIsDirty('app/src/main.tsx', true);
    });
    await waitFor(() => {
      expect(api.getState().dirtyByPath.get('app/src/main.tsx')).toBe(true);
    });

    await act(async () => {
      api.actions.deletePathAt('app');
    });
    await waitFor(() => {
      expect(confirm).toHaveBeenCalledTimes(1);
    });

    confirm.mockRestore();
  });

  it('renames a file and remaps tabs/active/dirty', async () => {
    let api: any;
    renderWithProvider(<Probe onReady={(a) => (api = a)} />);

    const from = 'app/src/main.tsx';
    const to = 'app/src/main.new.tsx';

    await act(async () => {
      api.actions.openFile(from);
    });
    await act(async () => {
      api.actions.setIsDirty(from, true);
    });
    await waitFor(async () => {
      expect(api.getState().dirtyByPath.get(from)).toBe(true);
    });

    await act(async () => {
      api.actions.beginRenameAt(from);
    });
    await act(async () => {
      api.actions.setRenameName('main.new.tsx');
    });
    await act(async () => {
      api.actions.confirmRename();
    });

    await waitFor(async () => {
      expect(api.getState().activePath).toBe(to);
      expect(api.getState().openPaths).toContain(to);
      expect(api.getState().openPaths).not.toContain(from);
      expect(api.getState().dirtyByPath.get(to)).toBe(true);
      expect(api.getState().dirtyByPath.has(from)).toBe(false);
    });
  });

  it('renames a folder and moves descendants', async () => {
    let api: any;
    renderWithProvider(<Probe onReady={(a) => (api = a)} />);

    const spy = vi.spyOn(store, 'renameFolder');

    const oldDir = 'app/src';
    const newDirName = 'src-renamed';
    const movedFile = 'app/src/main.tsx';
    const expected = 'app/src-renamed/main.tsx';

    await act(async () => {
      api.actions.openFile(movedFile);
    });
    await act(async () => {
      api.actions.beginRenameAt(oldDir);
    });
    await act(async () => {
      api.actions.setRenameName(newDirName);
    });
    await act(async () => {
      api.actions.confirmRename();
    });

    await waitFor(() =>
      expect(spy).toHaveBeenCalledWith('app/src', 'app/src-renamed'),
    );

    await waitFor(() => {
      expect(api.getState().openPaths).toContain(expected);
    });
  });

  it('registers beforeunload when any dirty, removes when clean', async () => {
    let api: any;
    renderWithProvider(<Probe onReady={(a) => (api = a)} />);
    const add = vi.spyOn(window, 'addEventListener');
    const rem = vi.spyOn(window, 'removeEventListener');

    await act(async () => {
      api.actions.setIsDirty('app/README.md', true);
    });
    await waitFor(() => {
      expect(api.getState().dirtyByPath.get('app/README.md')).toBe(true);
      expect(add).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    await act(async () => {
      api.actions.setIsDirty('app/README.md', false);
    });
    await waitFor(() => {
      expect(rem).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });

  it('saveFile clears dirty and persists (debounced)', async () => {
    let api: any;
    renderWithProvider(<Probe onReady={(a) => (api = a)} />);
    const p = 'app/src/main.tsx';

    await act(async () => {
      api.actions.setIsDirty(p, true);
    });
    await waitFor(() => {
      expect(api.getState().dirtyByPath.get(p)).toBe(true);
    });

    vi.useFakeTimers();
    await act(async () => {
      api.actions.saveFile(p);
    });

    expect(api.getState().dirtyByPath.get(p)).toBe(false);

    vi.runAllTimers();
    vi.useRealTimers();

    const raw = localStorage.getItem('fv:files:v1');
    expect(raw).toContain(p);
  });

  it('context menu opens and New File starts draft', () => {
    render(
      <ActiveFileProvider>
        <FileTree />
      </ActiveFileProvider>,
    );
    const row = screen.getAllByRole('treeitem')[0];
    fireEvent.contextMenu(row);

    const newFile = screen.getByRole('menuitem', { name: /new file/i });
    fireEvent.click(newFile);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
