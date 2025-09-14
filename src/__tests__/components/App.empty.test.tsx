import { screen, render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ActiveFileProvider from '../../state/ActiveFileProvider';
import App from '../../App';
import { Probe } from '../../test/utils';

describe('App empty editor', () => {
  it('shows EmptyEditor when no activePath and no open tabs', async () => {
    let api: any;
    render(
      <ActiveFileProvider>
        <Probe onReady={(a) => (api = a)} />
        <App />
      </ActiveFileProvider>,
    );

    api.actions.setActivePath(null);
    api.actions.closeFile?.('app/README.md');

    await waitFor(() => {
      const st = api.getState?.() ?? api.state;
      if (!st) throw new Error('state missing');
      expect(st.activePath).toBeNull();
      const openCount = Array.isArray(st.openPaths)
        ? st.openPaths.length
        : (st.openPaths?.size ?? 0);
      expect(openCount).toBe(0);
    });

    expect(await screen.findByTestId('empty-editor')).toBeInTheDocument();
  });
});
