import { test } from '@playwright/test';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variables for test user (no fallbacks - must be set)
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

test.describe('Recorded E2E Test - Login Flow', () => {
  test('User can login and access dashboard', async ({ page }) => {
    console.log('🚀 Starting recorded E2E test...');
    
    // Check if environment variables are set
    if (!TEST_USER_EMAIL || !TEST_USER_PASSWORD) {
      throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables must be set');
    }
    
    console.log('📋 Step 1: Navigate to application');
    await page.goto('http://localhost:5173/');
    
    console.log('📋 Step 2: Start login process');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    
    console.log('📋 Step 3: Enter credentials');
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(TEST_USER_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(TEST_USER_PASSWORD);
    
    console.log('📋 Step 4: Complete login');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    
    console.log('📋 Step 5: Verify dashboard access');
    await page.locator('div').filter({ hasText: 'DashboardYour organization\'s' }).nth(2).click();
    
    console.log('✅ Recorded E2E test completed successfully!');
    console.log('📊 Successfully tested: FR01 - User Authentication & Dashboard Access');
  });
});
