import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const PLAYWRIGHT_ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const PLAYWRIGHT_ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('User Login Journey', () => {
  test('User can login and access dashboard', async ({ page }) => {
    if (!PLAYWRIGHT_ADMIN_EMAIL || !PLAYWRIGHT_ADMIN_PASSWORD) {
      throw new Error('Missing required environment variables for admin user');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(PLAYWRIGHT_ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(PLAYWRIGHT_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.locator('div').filter({ hasText: 'DashboardYour organization\'s' }).nth(2).click();

    console.log('✅ User Login Journey Test Completed Successfully!');
  });
});
