import { expect } from 'vitest';
import { within, screen } from '@testing-library/react';

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
