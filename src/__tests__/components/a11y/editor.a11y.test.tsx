import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ActiveFileProvider from '../../../state/ActiveFileProvider';
import Tabs from '../../../components/Tabs';
import Editor from '../../../components/Editor';
import { Probe } from '../../../test/utils';

describe('Editor tabpanel a11y', () => {
  it('links tabpanel to active tab via aria-labelledby and updates on change', async () => {
    let api: any;

    render(
      <ActiveFileProvider
        initial={{
          activePath: 'foo.ts',
          openPaths: ['foo.ts', 'bar.ts'],
        }}
      >
        <Probe onReady={(a) => (api = a)} />
        <Tabs />
        <Editor />
      </ActiveFileProvider>,
    );

    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('id', 'editor-panel');
    expect(panel.getAttribute('aria-labelledby')).toMatch(/^tab-/);

    api.actions.setActivePath('bar.ts');

    await waitFor(() => {
      expect(panel.getAttribute('aria-labelledby')).toContain('bar-ts');
    });
  });
});
