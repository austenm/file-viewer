import { describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import user from '@testing-library/user-event';
import Tabs from '../components/Tabs';
import ActiveFileProvider from '../state/ActiveFileProvider';
import { nextFrame } from '../test/utils';
import { getAllTabs, oneTabbable } from '../test/utils';

function TabsHarness({
  open = [
    'app/README.md',
    'app/index.html',
    'app/vite.config.ts',
    'app/package.json',
    'app/src/main.tsx',
    'app/src/App.tsx',
    'app/src/styles/global.css',
    'app/src/components/Button.tsx',
  ],
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

const u = user.setup();
const k = async (key: string) => {
  await u.keyboard(key);
  await nextFrame();
};

describe('Tabs - roving and activation', () => {
  test('exactly one tabbable tab, roves with arrows', async () => {
    render(<TabsHarness />);

    expect(oneTabbable()).toHaveLength(1);

    (oneTabbable()[0] as HTMLElement).focus();
    expect(oneTabbable()[0]).toHaveFocus();

    // ArrowRight moves focus only (not selection)
    await k('{ArrowRight}');
    const tabsAfter = getAllTabs();
    expect(oneTabbable()).toHaveLength(1);
    expect(
      tabsAfter.some((t) => t.getAttribute('aria-selected') === 'true'),
    ).toBe(true);
    // Focus is on a tab, but aria-selected stays with the previously active one
    const focused = document.activeElement as HTMLElement;
    expect(focused).toHaveAttribute('role', 'tab');
  });

  test('Home/End jump to first/last', async () => {
    render(<TabsHarness />);
    (oneTabbable()[0] as HTMLElement).focus();

    await k('{End}');
    const all = getAllTabs();
    expect(all.at(-1)).toHaveFocus();

    await k('{Home}');
    expect(getAllTabs()[0]).toHaveFocus();
  });

  test('Enter activates the focused tab (selection flips), focus remains on that tab', async () => {
    render(<TabsHarness />);
    (oneTabbable()[0] as HTMLElement).focus();

    await k('{ArrowRight}'); // move focus to a different tab
    const focused = document.activeElement as HTMLElement;
    expect(focused).toHaveAttribute('role', 'tab');
    expect(focused).toHaveAttribute('aria-selected', 'false');

    await k('{Enter}'); // activate
    expect(focused).toHaveAttribute('aria-selected', 'true');
    expect(focused).toHaveFocus(); // focus stays put
  });

  test('Delete closes the focused tab and moves focus to its neighbor', async () => {
    render(<TabsHarness />);
    (oneTabbable()[0] as HTMLElement).focus();

    const tabs0 = getAllTabs();
    await k('{ArrowRight}');
    const mid = document.activeElement as HTMLElement;
    const beforeIdx = getAllTabs().findIndex((el) => el === mid);

    await k('{Delete}');
    const tabs1 = getAllTabs();
    // One fewer tab
    expect(tabs1.length).toBe(tabs0.length - 1);
    // Focus moved to neighbor (same index now points at the next one)
    const neighbor = tabs1[Math.min(beforeIdx, tabs1.length - 1)];
    expect(neighbor).toHaveFocus();
  });

  test('Ctrl/Cmd+W closes the focused tab', async () => {
    render(<TabsHarness />);
    const u = user.setup();
    (oneTabbable()[0] as HTMLElement).focus();

    const tabs0 = getAllTabs();
    const isMac = navigator.platform.includes('Mac');
    await u.keyboard(isMac ? '{Meta>}{w}{/Meta}' : '{Control>}{w}{/Control}');
    expect(getAllTabs().length).toBe(Math.max(0, tabs0.length - 1));
  });

  test('scrolls active tab into view when activePath changes', async () => {
    render(<TabsHarness />);
    const all = getAllTabs();

    // spy on scrollIntoView for a far tab
    const far = all.at(-1)! as HTMLElement;
    const spy = vi
      .spyOn(far, 'scrollIntoView' as any)
      .mockImplementation(() => {});

    // move focus to far tab then activate with Enter
    far.focus();
    await k('{Enter}');

    // effect runs in rAF; give it a tick
    await new Promise((r) => requestAnimationFrame(() => r(undefined)));
    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
