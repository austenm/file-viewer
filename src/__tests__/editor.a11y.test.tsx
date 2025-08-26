import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Editor } from '../components';

describe('Editor tabpanel a11y', () => {
  it('links tabpanel to active tab via aria-labelledby', () => {
    const { rerender } = render(<Editor activePath="/foo.ts" />);
    const panel = screen.getByRole('tabpanel');

    expect(panel).toHaveAttribute('id', 'editor-panel');
    expect(panel.getAttribute('aria-labelledby')).toMatch(/^tab-/);

    rerender(<Editor activePath="bar.ts" />);
    expect(panel.getAttribute('aria-labelledby')).toContain('bar-ts');
  });
});
