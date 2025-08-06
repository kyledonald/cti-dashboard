import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
const VIEWER_EMAIL = process.env.PLAYWRIGHT_VIEWER_EMAIL;
const VIEWER_PASSWORD = process.env.PLAYWRIGHT_VIEWER_PASSWORD;
const EDITOR_EMAIL = process.env.PLAYWRIGHT_EDITOR_EMAIL;
const EDITOR_PASSWORD = process.env.PLAYWRIGHT_EDITOR_PASSWORD;

test.describe('Custom Notification Service', () => {
  test('Admin can send notifications and users can view/manage them', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !VIEWER_EMAIL || !VIEWER_PASSWORD || !EDITOR_EMAIL || !EDITOR_PASSWORD) {
      throw new Error('Missing required environment variables for test users');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'Organization', exact: true }).click();
    await page.getByRole('button', { name: 'Add User by Email' }).click();
    await page.getByRole('textbox', { name: 'user@example.com' }).fill(VIEWER_EMAIL);
    await page.getByRole('button', { name: 'Add User' }).click();
    await page.getByRole('button', { name: 'Add User by Email' }).click();
    await page.getByRole('textbox', { name: 'user@example.com' }).fill(EDITOR_EMAIL);
    await page.getByRole('combobox').selectOption('editor');
    await page.getByRole('button', { name: 'Add User' }).click();

    await page.getByRole('button', { name: 'Trigger Password Reset' }).click();
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('heading', { name: 'Notifications (1)' }).click();
    await page.getByRole('button', { name: '1' }).click();
    await page.getByRole('textbox', { name: 'Notification title...' }).fill('This is a custom notification!');
    await page.getByRole('textbox', { name: 'Notification message...' }).fill('Hey, fellow testers.');
    await page.getByRole('checkbox', { name: 'Select All' }).check();
    await page.getByRole('button', { name: 'Send Notification' }).click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(EDITOR_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(EDITOR_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('button', { name: '2' }).click();
    await page.getByRole('button', { name: 'Mark all read' }).click();
    await page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).nth(2).click();
    await page.locator('div').filter({ hasText: /^No notifications yet$/ }).nth(1).click();
    await page.getByRole('button').nth(2).click();

    await page.getByRole('button', { name: 'P playwright.editor' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.getByRole('link', { name: 'Organization', exact: true }).click();
    await page.locator('div').filter({ hasText: /^viewerEdit$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Remove from Org' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();
    await page.locator('div').filter({ hasText: /^editorEdit$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Remove from Org' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ Custom Notification Service Test Completed Successfully!');
  });
});
