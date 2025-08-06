import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('View Visualizations', () => {
  test('Admin can view dashboard charts and verify they update with incident creation', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing required environment variables for admin user');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.getByRole('button', { name: 'New Incident' }).click();
    await page.getByRole('textbox', { name: 'Brief description of the' }).fill('INC1 - Low Priority Test');
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('Test incident for dashboard visualization');
    await page.locator('div').filter({ hasText: /^PriorityLowMediumHighCritical$/ }).getByRole('combobox').selectOption('Low');
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).click();

    await page.getByRole('button', { name: 'New Incident' }).click();
    await page.getByRole('textbox', { name: 'Brief description of the' }).fill('INC2 - Medium Priority Test');
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('Test incident for dashboard visualization');
    await page.locator('div').filter({ hasText: /^PriorityLowMediumHighCritical$/ }).getByRole('combobox').selectOption('Medium');
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).click();

    await page.getByRole('button', { name: 'New Incident' }).click();
    await page.getByRole('textbox', { name: 'Brief description of the' }).fill('INC3 - Critical Priority Test');
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('Test incident for dashboard visualization');
    await page.locator('div').filter({ hasText: /^PriorityLowMediumHighCritical$/ }).getByRole('combobox').selectOption('Critical');
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).click();

    await page.getByText('INC1 - Low Priority Test').click();
    await page.getByRole('button', { name: 'Edit Incident' }).click();
    await page.locator('div').filter({ hasText: /^StatusOpenTriagedIn ProgressResolvedClosed$/ }).getByRole('combobox').selectOption('Closed');
    await page.getByRole('button', { name: 'Update Incident' }).click();

    await page.getByText('INC2 - Medium Priority Test').click();
    await page.getByRole('button', { name: 'Edit Incident' }).click();
    await page.locator('div').filter({ hasText: /^StatusOpenTriagedIn ProgressResolvedClosed$/ }).getByRole('combobox').selectOption('In Progress');
    await page.getByRole('button', { name: 'Update Incident' }).click();

    await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await page.reload();
    await page.waitForTimeout(2000);

    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.getByText('INC3 - Critical Priority Test').first().click();
    await page.getByRole('button', { name: 'Delete Incident' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.getByText('INC2 - Medium Priority Test').first().click();
    await page.getByRole('button', { name: 'Delete Incident' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.getByText('INC1 - Low Priority Test').first().click();
    await page.getByRole('button', { name: 'Delete Incident' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ View Visualizations Test Completed Successfully!');
  });
});
