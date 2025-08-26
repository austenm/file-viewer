import { test, expect } from '@playwright/test';

test('boots + shows main landmarks', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tablist')).toBeVisible();
});
