import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('View and Filter High-Risk CVEs', () => {
  test('User can view and filter high-risk CVEs with different priority levels', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing required environment variables for admin user');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'CVEs', exact: true }).click();
    await page.getByRole('heading', { name: 'Critical Vulnerabilities' }).click();
    await page.getByLabel('Priority:').selectOption('9');
    await page.getByLabel('Sort by:').selectOption('date');
    await page.getByLabel('Priority:').selectOption('kev');

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ View and Filter High-Risk CVEs Test Completed Successfully!');
  });
});
