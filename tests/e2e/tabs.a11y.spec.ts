import { test, expect } from '@playwright/test';

test('tabs: roving focus + activation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('treeitem', { name: 'index.html' }).click();

  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(2);
  await tabs.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
});
