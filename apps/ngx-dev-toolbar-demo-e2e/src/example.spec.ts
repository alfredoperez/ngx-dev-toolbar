import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect page to show demo sections
  await expect(page.locator('h2').first()).toContainText('Feature Flags Demo');
});
