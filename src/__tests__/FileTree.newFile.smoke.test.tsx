import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActiveFileProvider from '../state/ActiveFileProvider';
import FileTree from '../components/FileTree';
import { hasPath } from '../lib/contentStore';

describe('FileTree inline new file', () => {
  it('creates a file under the selected directory', () => {
    render(
      <ActiveFileProvider>
        <div role="tree">
          <FileTree />
        </div>
      </ActiveFileProvider>,
    );

    // adjust selectors to your UI
    const addBtn = screen.getByLabelText('add-file');
    fireEvent.click(addBtn);

    const input = screen.getByRole('textbox'); // the inline input
    fireEvent.change(input, { target: { value: 'from-test.md' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(hasPath('app/from-test.md')).toBe(true);
  });
});
