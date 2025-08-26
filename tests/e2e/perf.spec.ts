import { test, expect } from '@playwright/test';

test('perf budgets: editor create/model set', async ({ page }) => {
  await page.goto('/');
  // open a second file via the tree to trigger setModel on a new file
  await page.getByRole('treeitem', { name: 'index.html' }).click();

  const metrics = await page.evaluate(() => {
    const first = (n: string) =>
      performance.getEntriesByName(n)[0]?.duration ?? null;
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    return {
      editorCreateMs: first('editor:create'),
      modelSetMs: first('editor:model:set'),
      domContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
    };
  });

  test.info().attach('perf.json', {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });

  // Generous budgets; tighten later once numbers stabilize
  if (metrics.editorCreateMs != null)
    expect(metrics.editorCreateMs).toBeLessThan(350);
  if (metrics.modelSetMs != null) expect(metrics.modelSetMs).toBeLessThan(250);
});
