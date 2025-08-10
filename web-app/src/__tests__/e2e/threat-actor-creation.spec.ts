import { test } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('Threat Actor Management', () => {
  test('Admin can create and delete threat actors', async ({ page }) => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error('Missing required environment variables for admin user');
    }

    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.getByRole('link', { name: 'Threat Actors See known' }).click();
    await page.locator('div').filter({ hasText: /^Total Actors0$/ }).nth(1).click();
    await page.getByRole('button', { name: 'Add Threat Actor' }).click();
    await page.getByRole('textbox', { name: 'APT28, Lazarus Group, etc.' }).fill('Test Threat Actor');
    await page.getByRole('textbox', { name: 'Country of origin' }).fill('Russia');
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('This is a test threat actor originating from Russia.');
    await page.locator('div').filter({ hasText: /^Resource LevelUnknownIndividualTeamOrganizationGovernment$/ }).getByRole('combobox').selectOption('Government');
    await page.locator('div').filter({ hasText: /^First Seen$/ }).getByRole('textbox').fill('2019-01-01');
    await page.locator('div').filter({ hasText: /^Last Seen$/ }).getByRole('textbox').fill('2025-08-06');
    await page.getByRole('textbox', { name: 'Financial, Espionage,' }).fill('Hacktivism');
    await page.getByRole('textbox', { name: 'Add alias...' }).fill('BadGuys');
    await page.locator('div').filter({ hasText: /^AliasesAdd$/ }).getByRole('button').click();
    await page.getByRole('textbox', { name: 'Add target sector...' }).fill('Financial Services');
    await page.locator('div').filter({ hasText: /^Primary TargetsAdd$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Create Threat Actor' }).click();
    await page.waitForTimeout(1000);
    await page.reload();

    await page.locator('.p-6.flex').click();
    await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
    await page.getByRole('button', { name: 'Delete' }).click();

    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    console.log('✅ Threat Actor Management Test Completed Successfully!');
  });
});
