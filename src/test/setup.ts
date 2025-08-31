import { afterEach, expect, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

const matchers = (jestDomMatchers as any).default ?? jestDomMatchers;

expect.extend(matchers);

Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
  value: vi.fn(),
  writable: true,
});

afterEach(() => {
  cleanup();
});
