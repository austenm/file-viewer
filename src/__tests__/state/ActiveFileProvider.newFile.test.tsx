import { describe, it, expect } from 'vitest';
import { useEffect } from 'react';
import { render, screen } from '@testing-library/react';
import ActiveFileProvider, {
  useFileActions,
  useFileState,
} from '../../state/ActiveFileProvider';
import { getContent, hasPath } from '../../lib/contentStore';

function DriveNewFile({ dir, name }: { dir: string; name: string }) {
  const { beginNewFileAt, setNewFileName, confirmNewFile } = useFileActions();
  const { activePath, openPaths } = useFileState();

  useEffect(() => {
    beginNewFileAt(dir);
    setNewFileName(name);
    confirmNewFile();
  }, [beginNewFileAt, setNewFileName, confirmNewFile, dir, name]);

  return (
    <div>
      <div data-testid="active">{activePath ?? ''}</div>
      <div data-testid="open">{openPaths.join('|')}</div>
    </div>
  );
}

describe('ActiveFileProvider new file', () => {
  it('creates, opens, and focuses a new empty file', () => {
    render(
      <ActiveFileProvider>
        <DriveNewFile dir="app" name="newfile.test.md" />
      </ActiveFileProvider>,
    );

    const expected = 'app/newfile.test.md';

    expect(hasPath(expected)).toBe(true);
    expect(getContent(expected)).toBe('');

    expect(screen.getByTestId('active').textContent).toBe(expected);
    expect(screen.getByTestId('open').textContent).toContain(expected);
  });
});
