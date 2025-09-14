import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

const strict = process.env.COVERAGE_STRICT === '1';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'monaco-editor': '/src/test/mocks/monaco-editor.ts',
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'tests/e2e/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
    ],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: strict
        ? { lines: 60, functions: 60, branches: 50, statements: 60 }
        : undefined,
      exclude: [
        '**/*.d.ts',
        'src/test/**',
        'src/test/mocks/**',
        'src/**/index.ts',
        'playwright.config.ts',
        'src/main.tsx',
        'src/App.tsx',
        'src/lib/monaco/monacoSetup.ts',
        'src/utils/types.ts',
      ],
      all: false,
      cleanOnRerun: true,
    },
  },
});
