import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActiveFileProvider from '../state/ActiveFileProvider';

import { Editor } from '../components';

describe('Editor tabpanel a11y', () => {
  it('links tabpanel to active tab via aria-labelledby', () => {
    const { rerender } = render(
      <ActiveFileProvider>
        <Editor activePath="/foo.ts" />
      </ActiveFileProvider>,
    );
    const panel = screen.getByRole('tabpanel');

    expect(panel).toHaveAttribute('id', 'editor-panel');
    expect(panel.getAttribute('aria-labelledby')).toMatch(/^tab-/);

    rerender(
      <ActiveFileProvider>
        <Editor activePath="bar.ts" />
      </ActiveFileProvider>,
    );
    expect(panel.getAttribute('aria-labelledby')).toContain('bar-ts');
  });
});
