import { test, expect } from '@playwright/test';

test.describe('App', () => {
  test('loads and shows ActOne heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /ActOne/i })).toBeVisible();
  });

  test('shows API health ok after fetch', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/API health:/i)).toBeVisible();
    await expect(page.getByText('ok')).toBeVisible({ timeout: 5000 });
  });

  test('shows WebSocket connected', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/WebSocket:/i)).toBeVisible();
    await expect(page.getByText('connected')).toBeVisible({ timeout: 5000 });
  });
});
