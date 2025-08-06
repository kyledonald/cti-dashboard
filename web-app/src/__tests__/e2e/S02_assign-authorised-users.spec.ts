import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment variables for test users
const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD;
const VIEWER_EMAIL = process.env.PLAYWRIGHT_VIEWER_EMAIL;
const VIEWER_PASSWORD = process.env.PLAYWRIGHT_VIEWER_PASSWORD;
const EDITOR_EMAIL = process.env.PLAYWRIGHT_EDITOR_EMAIL;
const EDITOR_PASSWORD = process.env.PLAYWRIGHT_EDITOR_PASSWORD;

test.describe('User Story 2: Role-Based Access Control', () => {
  test('Admin can assign users with different roles and test access permissions', async ({ page }) => {
    console.log('🚀 Starting User Story 2: Role-Based Access Control Test');
    
    // Validate environment variables
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !VIEWER_EMAIL || !VIEWER_PASSWORD || !EDITOR_EMAIL || !EDITOR_PASSWORD) {
      throw new Error('Missing required environment variables for test users');
    }

    // ===== PHASE 1: ADMIN SETUP =====
    console.log('📋 Phase 1: Admin Setup - Login and Create Test Incident');
    
    // Admin login
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    console.log('✅ Admin logged in successfully');

    // Create test incident
    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.getByRole('button', { name: 'New Incident' }).click();
    await page.getByRole('textbox', { name: 'Brief description of the' }).fill('User Story 2 - Role Access Test');
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('Testing role-based access control for different user types.');
    await page.getByRole('button', { name: 'Assign to me' }).click();
    await page.getByRole('button', { name: 'Create Incident' }).click();
    console.log('✅ Test incident created successfully');

    // ===== PHASE 2: ADD USERS TO ORGANIZATION =====
    console.log('�� Phase 2: Add Users to Organization with Different Roles');
    
    // Navigate to organization page
    await page.getByRole('link', { name: 'Organization' }).click();
    
    // Add viewer user
    await page.getByRole('button', { name: 'Add User by Email' }).click();
    await page.getByRole('textbox', { name: 'user@example.com' }).fill(VIEWER_EMAIL);
    await page.getByRole('button', { name: 'Add User' }).click();
    console.log('✅ Viewer user added to organization');
    
    // Add editor user
    await page.getByRole('button', { name: 'Add User by Email' }).click();
    await page.getByRole('textbox', { name: 'user@example.com' }).fill(EDITOR_EMAIL);
    await page.getByRole('combobox').selectOption('editor');
    await page.getByRole('button', { name: 'Add User' }).click();
    console.log('✅ Editor user added to organization with editor role');

    // Verify user count
    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page.getByText('Organization Members (3)')).toBeVisible();
    console.log('✅ Confirmed 3 organization members (admin + viewer + editor)');

    // ===== PHASE 3: TEST VIEWER ACCESS =====
    console.log('📋 Phase 3: Test Viewer Access - Limited Permissions');
    
    // Admin logout
    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    // Viewer login
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(VIEWER_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(VIEWER_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    console.log('✅ Viewer logged in successfully');

    // Test viewer restrictions
    await expect(page.getByText('Requires admin permissions')).toBeVisible();
    console.log('✅ Viewer sees admin permission restrictions');

    // Test viewer incident access
    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.locator('.p-5').click(); // Click on incident card
    await page.locator('div').filter({ hasText: /^Close$/ }).click(); // Close incident details
    
    // Add comment as viewer
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('I can only view this incident as a viewer.');
    await page.getByRole('button', { name: 'Add Comment' }).click();
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
    console.log('✅ Viewer can view incidents and add comments');

    // Viewer logout
    await page.getByRole('button', { name: 'P playwright.viewer' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    // ===== PHASE 4: TEST EDITOR ACCESS =====
    console.log('📋 Phase 4: Test Editor Access - Edit Permissions');
    
    // Editor login
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(EDITOR_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(EDITOR_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    console.log('✅ Editor logged in successfully');

    // Test editor restrictions
    await expect(page.getByText('Requires admin permissions')).toBeVisible();
    console.log('✅ Editor sees admin permission restrictions');

    // Test editor incident access
    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.locator('.p-5').click(); // Click on incident card
    
    // Verify editor can see edit options
    await page.getByText('CloseEdit IncidentAI').click();
    await page.getByRole('button', { name: 'Back to View' }).click();
    console.log('✅ Editor can see edit options and AI summary button');

    // Add comment as editor
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).click();
    await page.getByRole('textbox', { name: 'Add your analysis, findings,' }).fill('I can see edit options and make changes as an editor.');
    await page.getByRole('button', { name: 'Add Comment' }).click();
    await page.waitForTimeout(1000);
    console.log('✅ Editor can add comments');

    // Test editor can edit incident
    await page.getByRole('button', { name: 'Edit Incident' }).click();
    await page.getByRole('textbox', { name: 'Detailed description of the' }).click();
    await page.getByRole('textbox', { name: 'Detailed description of the' }).fill('Testing role-based access control for different user types.\n\nI can make edits as an editor!');
    await page.getByRole('button', { name: 'Update Incident' }).click();
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
    console.log('✅ Editor can successfully edit incident details');

    // Editor logout
    await page.getByRole('button', { name: 'P playwright.editor' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();

    // ===== PHASE 5: ADMIN CLEANUP =====
    console.log('📋 Phase 5: Admin Cleanup - Delete Test Data');
    
    // Admin login
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email' }).fill(ADMIN_EMAIL);
    await page.getByRole('textbox', { name: 'Password' }).fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    console.log('✅ Admin logged in for cleanup');

    // Delete test incident
    await page.getByRole('link', { name: 'Incidents', exact: true }).click();
    await page.locator('.p-5').click(); // Click on incident card
    await page.getByRole('button', { name: 'Delete Incident' }).click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.waitForTimeout(1000);
    console.log('✅ Test incident deleted');

    // Remove test users from organization
    await page.getByRole('link', { name: 'Organization' }).click();
    
    // Remove viewer
    await page.locator('div').filter({ hasText: /^viewerEdit$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Remove from Org' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();
    await page.waitForTimeout(1000);
    console.log('✅ Viewer removed from organization');
    
    // Remove editor
    await page.locator('div').filter({ hasText: /^editorEdit$/ }).getByRole('button').click();
    await page.getByRole('button', { name: 'Remove from Org' }).click();
    await page.getByRole('button', { name: 'Remove User' }).click();
    await page.waitForTimeout(1000);
    console.log('✅ Editor removed from organization');

    // Final logout
    await page.getByRole('button', { name: 'PA Playwright Admin' }).click();
    await page.getByRole('button', { name: 'Sign out' }).click();
    console.log('✅ Admin logged out');

    console.log('�� User Story 2: Role-Based Access Control Test Completed Successfully!');
    console.log('�� Tested: Admin user management, Viewer restrictions, Editor permissions, and cleanup');
  });
});
