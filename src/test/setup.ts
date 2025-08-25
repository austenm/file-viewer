import { afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

const matchers = (jestDomMatchers as any).default ?? jestDomMatchers;

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
