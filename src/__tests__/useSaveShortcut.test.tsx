// src/hooks/useSaveShortcut.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import useSaveShortcut from '../hooks/useSaveShortcut';

function Harness({
  enabled,
  onSave,
}: {
  enabled: boolean;
  onSave: () => void;
}) {
  useSaveShortcut(enabled, onSave);
  return <div>ok</div>;
}

const fireKey = (init: KeyboardEventInit) => {
  const ev = new KeyboardEvent('keydown', { cancelable: true, ...init });
  const ok = window.dispatchEvent(ev);
  return { ev, ok };
};

describe('useSaveShortcut', () => {
  beforeEach(() => {
    // ensure focus not in an input/textarea
    (document.activeElement as HTMLElement | null)?.blur?.();
  });

  it('calls onSave for Cmd/Ctrl+S and prevents default', () => {
    const spy = vi.fn();
    render(<Harness enabled={true} onSave={spy} />);

    const { ev } = fireKey({ key: 's', metaKey: true });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(ev.defaultPrevented).toBe(true);

    const { ev: ev2 } = fireKey({ key: 'S', ctrlKey: true });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(ev2.defaultPrevented).toBe(true);
  });

  it('does nothing when disabled', () => {
    const spy = vi.fn();
    render(<Harness enabled={false} onSave={spy} />);
    fireKey({ key: 's', metaKey: true });
    expect(spy).not.toHaveBeenCalled();
  });

  it('ignores repeats', () => {
    const spy = vi.fn();
    render(<Harness enabled={true} onSave={spy} />);
    fireKey({ key: 's', metaKey: true, repeat: true });
    expect(spy).not.toHaveBeenCalled();
  });
});
