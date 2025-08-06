import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
const VIEWER_EMAIL = process.env.PLAYWRIGHT_VIEWER_EMAIL;
const VIEWER_PASSWORD = process.env.PLAYWRIGHT_VIEWER_PASSWORD;
const EDITOR_EMAIL = process.env.PLAYWRIGHT_EDITOR_EMAIL;
const EDITOR_PASSWORD = process.env.PLAYWRIGHT_EDITOR_PASSWORD;

test.describe('Role-Based Access Control', () => {
  test('Admin can assign users with different roles and test access permissions', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !VIEWER_EMAIL || !VIEWER_PASSWORD || !EDITOR_EMAIL || !EDITOR_PASSWORD) {
      throw new Error('Missing required environment variables for test users');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.getByRole('button', { name: 'New Incident' }).click();
    await page.getByRole('textbox', { name: 'Brief description of the' }).fill('User Story 2 - Role Access Test');
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('Testing role-based access control for different user types.');
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).click();

    await page.getByRole('link', { name: 'Organization' }).click();
    await page.getByRole('button', { name: 'Add User by Email' }).click();
    await page.getByRole('textbox', { name: 'user@example.com' }).fill(VIEWER_EMAIL);
    await page.getByRole('button', { name: 'Add User' }).click();
    await page.getByRole('button', { name: 'Add User by Email' }).click();
    await page.getByRole('textbox', { name: 'user@example.com' }).fill(EDITOR_EMAIL);
    await page.getByRole('combobox').selectOption('editor');
    await page.getByRole('button', { name: 'Add User' }).click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(VIEWER_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(VIEWER_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.locator('.p-5').click();
    await page.locator('div').filter({ hasText: /^Close$/ }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('I can only view this incident as a viewer.');
    await page.getByRole('button', { name: 'Add Comment' }).click();
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: 'P playwright.viewer' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(EDITOR_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(EDITOR_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.locator('.p-5').click();
    await page.getByText('CloseEdit IncidentAI').click();
    await page.getByRole('button', { name: 'Back to View' }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('I can see edit options and make changes as an editor.');
    await page.getByRole('button', { name: 'Add Comment' }).click();
    await page.getByRole('button', { name: 'Edit Incident' }).click();
    await page.getByRole('textbox', { name: 'Detailed description of the' }).click();
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('Testing role-based access control for different user types.\n\nI can make edits as an editor!');
    await page.getByRole('button', { name: 'Update Incident' }).click();

    await page.getByRole('button', { name: 'P playwright.editor' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.locator('.p-5').click();
    await page.getByRole('button', { name: 'Delete Incident' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.getByRole('link', { name: 'Organization' }).click();
    await page.locator('div').filter({ hasText: /^viewerEdit$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Remove from Org' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();
    await page.locator('div').filter({ hasText: /^editorEdit$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Remove from Org' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ Role-Based Access Control Test Completed Successfully!');
  });
});
