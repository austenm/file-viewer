import { describe, it, expect } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { renderWithProvider, Probe } from '../../test/utils';

describe('ActiveFileProvider core functions', () => {
  it('opens and closes files, updates activePath', async () => {
    let api: any;
    renderWithProvider(<Probe onReady={(a) => (api = a)} />);
    await act(async () => {
      api.actions.openFile('app/README.md');
      api.actions.openFile('app/src/main.tsx');
      api.actions.closeFile('app/README.md');
    });
    await waitFor(() => {
      expect(api.getState().activePath).toBe('app/src/main.tsx');
    });
  });

  it('setIsDirty toggles and saveFile clears dirty', async () => {
    let api: any;
    renderWithProvider(<Probe onReady={(a) => (api = a)} />);
    await act(async () => {
      api.actions.openFile('app/src/main.tsx');
      api.actions.setIsDirty('app/src/main.tsx', true);
    });
    await waitFor(() => {
      expect(api.getState().dirtyByPath.get('app/src/main.tsx')).toBe(true);
    });
    await act(async () => {
      api.actions.saveFile('app/src/main.tsx');
    });
    await waitFor(() => {
      expect(api.getState().dirtyByPath.get('app/src/main.tsx')).toBe(false);
    });
  });
});
