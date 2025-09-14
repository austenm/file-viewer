import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActiveFileProvider from '../../state/ActiveFileProvider';
import Tabs from '../../components/Tabs';
import Editor from '../../components/Editor';
import { Probe } from '../../test/utils';
import { vi, describe, it, expect } from 'vitest';

describe('Tabs behavior', () => {
  it('close activates nearest-right else left; supports keyboard close', async () => {
    const user = userEvent.setup();

    let api: any;
    render(
      <ActiveFileProvider initial={{ activePath: null, openPaths: [] }}>
        <Probe onReady={(a) => (api = a)} />
        <Tabs />
        <Editor />
      </ActiveFileProvider>,
    );

    ['a.ts', 'b.ts', 'c.ts'].forEach((p) => api.actions.openFile(p));
    api.actions.setActivePath('b.ts');

    const bTab = await screen.findByRole('tab', { name: /b\.ts/ });
    bTab.focus();

    await user.keyboard('{Delete}');
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'c.ts',
    );

    const activeTab = screen.getByRole('tab', {
      selected: true,
    }) as HTMLElement;
    activeTab.focus();

    const chord = navigator.platform.includes('Mac')
      ? { key: 'w', metaKey: true, bubbles: true }
      : { key: 'w', ctrlKey: true, bubbles: true };

    fireEvent.keyDown(activeTab, chord);

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'a.ts',
    );
  });

  it('requests a frame to scroll when active changes', async () => {
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: any) => {
        cb(0);
        return 1 as any;
      });

    let api: any;
    render(
      <ActiveFileProvider>
        <Probe onReady={(a) => (api = a)} />
        <Tabs />
        <Editor />
      </ActiveFileProvider>,
    );

    const paths = ['a.ts', 'b.ts', 'c.ts'];
    paths.forEach((p) => api.actions.openFile(p));

    await screen.findByRole('tab', { name: /a\.ts/ });
    api.actions.setActivePath('a.ts');
    api.actions.setActivePath('c.ts');

    await waitFor(() => expect(rafSpy).toHaveBeenCalled());
    rafSpy.mockRestore();
  });
});
