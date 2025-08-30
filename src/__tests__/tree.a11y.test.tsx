import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import user from '@testing-library/user-event';
import ActiveFileProvider from '../state/ActiveFileProvider';
import { FileTree } from '../components';
import buildTree from '../lib/buildTree';
import {
  focusFirstTabbable,
  expectOneTabbable,
  getItems,
  nextFrame,
} from '../test/utils';

describe('FileTreeNode a11y semantics', () => {
  const project = {
    name: 'test-project',
    files: [
      { path: 'app/README.md' },
      { path: 'app/src/index.ts' },
      { path: 'app/public/favicon.ico' },
    ],
  };

  const rootNode = buildTree(project.files);

  function TreeHarness() {
    return (
      <ActiveFileProvider>
        <FileTree projectName={project.name} rootNode={rootNode} />
      </ActiveFileProvider>
    );
  }

  it('click toggles folder, click opens file', async () => {
    render(<TreeHarness />);
    const u = user.setup();

    const folderToToggle = screen.getByRole('treeitem', { name: 'app/public' });
    expect(folderToToggle).toHaveAttribute('aria-expanded', 'false');

    await u.click(folderToToggle);
    await nextFrame();
    expect(folderToToggle).toHaveAttribute('aria-expanded', 'true');
    const fileToOpen = screen.getByRole('treeitem', {
      name: 'app/public/favicon.ico',
    });

    await u.click(fileToOpen);
    await nextFrame();
    expect(fileToOpen).toHaveAttribute('aria-selected', 'true');
  });

  it('arrows move focus, not selection', async () => {
    render(<TreeHarness />);
    const u = user.setup();

    focusFirstTabbable();
    expectOneTabbable();

    const beforeArrowPress = getItems();
    expect(beforeArrowPress[1]).not.toHaveAttribute('aria-selected', 'true');

    await u.keyboard('{ArrowDown}');
    await nextFrame();

    const afterArrowPress = getItems();
    expect(afterArrowPress[1]).not.toHaveAttribute('aria-selected', 'true');
  });

  it('marks only one treeitem as selected', () => {
    render(<TreeHarness />);
    const items = getItems();
    const selected = items.filter(
      (el) => el.getAttribute('aria-selected') === 'true',
    );
    expect(selected).toHaveLength(1);
  });

  it('ArrowLeft collapses folders (keeps focus), ArrowRight expands then first child', async () => {
    render(<TreeHarness />);
    const u = user.setup();
    const k = async (key: string) => {
      await u.keyboard(key);
      await nextFrame();
    };

    const appFolder = focusFirstTabbable();
    expect(appFolder).toHaveAttribute('aria-expanded', 'true');

    await k('{ArrowLeft}');
    expect(document.activeElement).toBe(appFolder);
    expect(appFolder).toHaveAttribute('aria-expanded', 'false');

    await k('{ArrowRight}');
    expect(document.activeElement).toBe(appFolder);
    expect(appFolder).toHaveAttribute('aria-expanded', 'true');

    await k('{ArrowRight}');
    const child = document.activeElement as HTMLElement;
    expect(child).toHaveAttribute('role', 'treeitem');
    expect(child).toHaveAttribute('aria-level', '2');

    await k('{ArrowLeft}');
    expect(document.activeElement).toBe(appFolder);
    expect(appFolder).toHaveAttribute('aria-expanded', 'true');

    await k('{ArrowLeft}');
    expect(document.activeElement).toBe(appFolder);
    expect(appFolder).toHaveAttribute('aria-expanded', 'false');
  });

  it('Enter/Space: dir toggles, file opens (selection flips', async () => {
    render(<TreeHarness />);
    const u = user.setup();
    const k = async (key: string) => {
      await u.keyboard(key);
      await nextFrame();
    };

    focusFirstTabbable();
    await k('{ArrowRight}'); // to child
    const child = document.activeElement as HTMLElement;
    expect(child).toHaveAttribute('aria-expanded', 'false');
    await k(' '); // toggle dir
    expect(child).toHaveAttribute('aria-expanded', 'true');
    await k('{ArrowDown}'); // to file
    await k('{Enter}'); // select
    const focused = document.activeElement as HTMLElement;
    expect(focused).toHaveAttribute('aria-selected', 'true');
  });
});
