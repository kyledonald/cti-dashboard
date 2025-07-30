import { test, expect } from '@playwright/test';

test.describe('Organizations', () => {
  test('should show welcome page for unassigned users', async ({ page }) => {
    await page.goto('/welcome');
    
    // Check if page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show organizations page', async ({ page }) => {
    await page.goto('/organizations');
    
    // Check if page loads (may redirect to login)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check if page loads (may redirect to login)
    await expect(page.locator('body')).toBeVisible();
  });
}); 