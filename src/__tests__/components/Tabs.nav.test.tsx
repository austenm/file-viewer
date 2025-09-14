import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ActiveFileProvider from '../../state/ActiveFileProvider';
import Tabs from '../../components/Tabs';
import Editor from '../../components/Editor';
import { Probe } from '../../test/utils';

describe('Tests tabs key navigation in component', () => {
  function key(el: Element, init: KeyboardEventInit) {
    el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
  }

  it('tablist arrow nav + Home/End + Enter select', async () => {
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

    const tablist = screen.getByRole('tablist');
    const bTab = await screen.findByRole('tab', {
      name: /b\.ts/,
      selected: true,
    });
    (bTab as HTMLElement).focus();

    key(tablist, { key: 'ArrowRight' });

    const cTab = screen.getByRole('tab', { name: /c\.ts/ });
    fireEvent.keyDown(cTab, { key: 'Enter', bubbles: true });

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'c.ts',
    );

    key(tablist, { key: 'Home' });
    const aTab = screen.getByRole('tab', { name: /a\.ts/ });
    fireEvent.keyDown(aTab, { key: ' ', bubbles: true });

    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(
      'a.ts',
    );

    key(tablist, { key: 'End' });
    expect(screen.getByRole('tab', { name: /c\.ts/ })).toBeInTheDocument();
  });

  it('closes a tab on middle-click', async () => {
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

    fireEvent(
      bTab,
      new MouseEvent('auxclick', {
        button: 1,
        bubbles: true,
        cancelable: true,
      }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('tab', { name: /b\.ts/ })).toBeNull(),
    );
  });
});
