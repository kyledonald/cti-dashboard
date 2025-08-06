import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('Search CVEs by Software Name', () => {
  test('User can search for CVEs using CVE names', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing required environment variables for admin user');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'CVEs', exact: true }).click();
    await page.waitForTimeout(2000);

    const initialCVEs = page.locator('h3');
    const initialCount = await initialCVEs.count();

    const firstCVE = page.locator('h3').first();
    const cveTitle = await firstCVE.textContent();

    await page.getByRole('textbox', { name: 'Search CVEs by ID,' }).click();
    await page.getByRole('textbox', { name: 'Search CVEs by ID,' }).fill(cveTitle || '');
    await page.waitForTimeout(2000);

    const searchResults = page.locator('h3');
    const resultCount = await searchResults.count();
    expect(resultCount).toBe(1);

    const firstResult = await searchResults.first().textContent();
    expect(firstResult).toBe(cveTitle);

    await page.getByRole('button', { name: 'Clear' }).click();
    await page.waitForTimeout(2000);

    const clearedResults = page.locator('h3');
    const clearedCount = await clearedResults.count();
    expect(clearedCount).toBe(initialCount);

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ Search CVEs by CVE Name Test Completed Successfully!');
  });
});
