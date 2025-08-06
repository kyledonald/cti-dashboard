import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('Create Incident with AI Summary', () => {
  test('User can create incident, add comments, generate AI summary, and delete incident', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing required environment variables for admin user');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'CVEs Explore vulnerabilities' }).click();
    await page.getByRole('button', { name: 'No Action Required', exact: true }).first().click();
    await page.getByRole('button', { name: 'No Action Required 1' }).click();
    await page.getByRole('button', { name: 'Restore' }).click();
    await page.getByRole('button', { name: 'Active Vulnerabilities' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).first().click();
    await page.getByRole('dialog', { name: 'Create New Incident' }).click();
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).click();

    await page.locator('div').filter({ hasText: 'Security IncidentsTrack and manage security incidents in your organizationNew' }).nth(2).click();
    await page.locator('.p-5').click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('Investigating this one!');
    await page.getByRole('button', { name: 'Add Comment' }).click();

    await page.getByRole('button', { name: 'Edit Incident' }).click();
    await page.getByRole('button', { name: 'Back to View' }).click();
    await page.getByRole('button', { name: 'Close' }).first().click();
    await page.locator('.p-5').click();

    await page.getByRole('button', { name: 'AI Summary' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('dialog', { name: 'AI Threat Intelligence Summary' }).click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export PDF' }).click();
    const download = await downloadPromise;

    await page.getByRole('button', { name: 'Close' }).first().click();

    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('AI summary generated and downloaded!');
    await page.getByRole('button', { name: 'Add Comment' }).click();
    await page.waitForTimeout(3000);

    await page.getByRole('button', { name: 'Delete Incident' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ Create Incident with AI Summary Test Completed Successfully!');
  });
});
