import { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import ActiveFileProvider, {
  useFileActions,
  useFileState,
} from '../state/ActiveFileProvider';
import { expect } from 'vitest';
import {
  within,
  screen,
  render,
  type RenderResult,
} from '@testing-library/react';

export const getTree = () => screen.getByRole('tree', { name: /files/i });
export const getItems = () => within(getTree()).getAllByRole('treeitem');

export const focusFirstTabbable = () => {
  const row = getItems().find(
    (el) => (el as HTMLElement).tabIndex === 0,
  )! as HTMLElement;
  row.focus();
  return row;
};

export const getFocused = () => document.activeElement as HTMLElement;

export const nextFrame = () =>
  new Promise((r) => requestAnimationFrame(() => r(undefined)));

export const expectOneTabbable = () => {
  const tabbables = getItems().filter(
    (el) => (el as HTMLElement).tabIndex === 0,
  );
  expect(tabbables).toHaveLength(1);
};
export const getSelected = () =>
  getItems().filter((el) => el.getAttribute('aria-selected') === 'true');

export const getTabs = () =>
  screen.getByRole('tablist', { name: /open files/i });
export const getAllTabs = () => within(getTabs()).getAllByRole('tab');
export const oneTabbable = () =>
  getAllTabs().filter((el) => (el as HTMLElement).tabIndex === 0);

export function renderWithProvider(ui: ReactNode): RenderResult {
  return render(<ActiveFileProvider>{ui}</ActiveFileProvider>);
}

type ProviderAPI = {
  actions: ReturnType<typeof useFileActions>;
  getState: () => ReturnType<typeof useFileState>;
};

export function Probe({ onReady }: { onReady: (api: ProviderAPI) => void }) {
  const actions = useFileActions();
  const state = useFileState();
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  useLayoutEffect(() => {
    onReady({
      actions,
      getState: () => stateRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
