import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import user from '@testing-library/user-event';
import { Tab } from '../components/Tabs';
import { useState } from 'react';

describe('Tabs a11y semantics', () => {
  const files = ['/foo.ts', '/bar.ts', '/baz/ts'];

  it('marks only the active tab as tabbable and selected', () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(
      <div role="tablist" aria-label="Open files">
        <Tab path={files[0]} active onSelect={onSelect} onClose={onClose} />
        <Tab
          path={files[1]}
          active={false}
          onSelect={onSelect}
          onClose={onClose}
        />
        <Tab
          path={files[2]}
          active={false}
          onSelect={onSelect}
          onClose={onClose}
        />
      </div>,
    );

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabIndex', '0');
    expect(tabs[0]).toHaveAttribute('aria-controls', 'editor-panel');
    expect(tabs[0]).toHaveAttribute('id', 'tab--foo-ts');

    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('tabIndex', '-1');
  });

  it('activates on Enter/Space', async () => {
    const u = user.setup();
    const onClose = vi.fn();

    function StateHarness() {
      const [active, setActive] = useState('');
      return (
        <div role="tablist" aria-label="Open files">
          <Tab
            path="/foo.ts"
            active={active === '/foo.ts'}
            onSelect={setActive}
            onClose={onClose}
          />
          <Tab
            path="/bar.ts"
            active={active === '/bar.ts'}
            onSelect={setActive}
            onClose={onClose}
          />
        </div>
      );
    }

    render(<StateHarness />);

    const foo = screen.getByRole('tab', { name: /foo\.ts/i });
    const bar = screen.getByRole('tab', { name: /bar\.ts/i });

    foo.focus();
    expect(foo).toHaveAttribute('aria-selected', 'false');
    expect(foo).toHaveAttribute('tabindex', '-1');

    await u.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: /foo\.ts/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /foo\.ts/i })).toHaveAttribute(
      'tabindex',
      '0',
    );

    bar.focus();
    await u.keyboard(' ');
    expect(screen.getByRole('tab', { name: /bar\.ts/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /foo\.ts/i })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });
});
