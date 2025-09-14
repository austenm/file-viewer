import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import Tabs from '../../../components/Tabs';
import ActiveFileProvider from '../../../state/ActiveFileProvider';

describe('Tabs a11y semantics', () => {
  function TabsHarness({
    open = ['app/README.md', 'app/index.html', 'app/vite.config.ts'],
    active = 'app/README.md',
  }: {
    open?: string[];
    active?: string;
  }) {
    return (
      <ActiveFileProvider initial={{ openPaths: open, activePath: active }}>
        <Tabs />
      </ActiveFileProvider>
    );
  }

  it('marks only the active tab as tabbable and selected', () => {
    render(<TabsHarness />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabIndex', '0');
    expect(tabs[0]).toHaveAttribute('aria-controls', 'editor-panel');

    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('tabIndex', '-1');
  });

  it('activates on Enter/Space', async () => {
    render(<TabsHarness />);
    const u = user.setup();

    const viteConfig = screen.getByRole('tab', { name: 'app/vite.config.ts' });
    const indexFile = screen.getByRole('tab', { name: 'app/index.html' });

    viteConfig.focus();
    expect(viteConfig).toHaveAttribute('aria-selected', 'false');
    expect(viteConfig).toHaveAttribute('tabindex', '-1');

    await u.keyboard('{Enter}');
    expect(
      screen.getByRole('tab', { name: 'app/vite.config.ts' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('tab', { name: 'app/vite.config.ts' }),
    ).toHaveAttribute('tabindex', '0');

    indexFile.focus();
    await u.keyboard(' ');
    expect(screen.getByRole('tab', { name: 'app/index.html' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('tab', { name: 'app/vite.config.ts' }),
    ).toHaveAttribute('aria-selected', 'false');
  });
});
