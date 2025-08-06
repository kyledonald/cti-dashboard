import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('Vulnerable Software Scanning', () => {
  test('User can add software to inventory and view potential vulnerabilities', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing required environment variables for admin user');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'My Software', exact: true }).click();
    await page.getByText('No software added yetAdd your').click();
    await page.getByRole('button', { name: '+ Add Software' }).click();
    await page.getByRole('textbox', { name: 'e.g., Microsoft Office, Adobe' }).fill('a');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('heading', { name: 'Vulnerabilities Potentially' }).click();
    await page.getByText('Software Inventory (1)EditaRemove').click();
    await page.getByRole('button', { name: 'Remove' }).click();
    await page.getByText('Software Inventory (0)+ Add SoftwareNo software added yetAdd your organization\'').click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ Vulnerable Software Scanning Test Completed Successfully!');
  });
});
