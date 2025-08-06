import { test } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment variables for test user (no fallbacks - must be set)
const PLAYWRIGHT_ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const PLAYWRIGHT_ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

test.describe('Comprehensive Incident Management Journey', () => {
  test('User can create incident, add comments, generate AI summary, and delete incident', async ({ page }) => {
    console.log('🚀 Starting comprehensive incident management E2E test...');
    
    // Check if environment variables are set
    // Check if environment variables are set
    if (!PLAYWRIGHT_ADMIN_EMAIL || !PLAYWRIGHT_ADMIN_PASSWORD) {
      throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables must be set');
    }
    
    console.log('📋 Step 1: Login to application');
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(PLAYWRIGHT_ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(PLAYWRIGHT_ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    console.log('✅ Login successful');
    
    console.log('📋 Step 2: Navigate to CVEs and create incident');
    await page.getByRole('link', { name: 'CVEs Explore vulnerabilities' }).click();
    await page.getByRole('button', { name: 'No Action Required', exact: true }).first().click();
    await page.getByRole('button', { name: 'No Action Required 1' }).click();
    await page.getByRole('button', { name: 'Restore' }).click();
    await page.getByRole('button', { name: 'Active Vulnerabilities' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).first().click();
    await page.getByRole('dialog', { name: 'Create New Incident' }).click();
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).click();
    console.log('✅ Incident created successfully');
    
    console.log('📋 Step 3: Add comments and manage incident');
    await page.locator('div').filter({ hasText: 'Security IncidentsTrack and manage security incidents in your organizationNew' }).nth(2).click();
    await page.locator('.p-5').click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('Investigating this one!');
    await page.getByRole('button', { name: 'Add Comment' }).click();
    console.log('✅ First comment added');
    
    await page.getByRole('button', { name: 'Edit Incident' }).click();
    await page.getByRole('button', { name: 'Back to View' }).click();
    await page.getByRole('button', { name: 'Close' }).first().click();
    await page.locator('.p-5').click();
    console.log('✅ Incident editing and viewing completed');
    
    console.log('📋 Step 4: Generate AI summary and export PDF');
    await page.getByRole('button', { name: 'AI Summary' }).click();
    await page.waitForTimeout(3000);
    await page.getByRole('dialog', { name: 'AI Threat Intelligence Summary' }).click();
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export PDF' }).click();
    const download = await downloadPromise;
    console.log('✅ AI summary generated and PDF exported:', download.suggestedFilename());
    
    await page.getByRole('button', { name: 'Close' }).first().click();
    
    console.log('📋 Step 5: Add final comments');
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('AI summary generated and downloaded!');
    await page.getByRole('button', { name: 'Add Comment' }).click();
    await page.waitForTimeout(3000);
    console.log('✅ Final comments added');
    
    console.log('📋 Step 6: Clean up - delete incident');
    await page.getByRole('button', { name: 'Delete Incident' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    console.log('✅ Incident deleted successfully');
    
    console.log('📋 Step 7: Logout');
    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    console.log('✅ Logout successful');
    
    console.log('🎉 Comprehensive incident management E2E test completed successfully!');
    console.log('📊 Successfully tested: FR01, FR08 - Complete incident lifecycle with AI summary');
  });
});
