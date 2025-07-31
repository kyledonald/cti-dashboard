import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Mock successful Firebase authentication
    await page.addInitScript(() => {
      (window as any).firebase = {
        auth: () => ({
          signInWithEmailAndPassword: () => Promise.resolve({
            user: {
              uid: 'test-user-id',
              email: 'test@example.com',
              getIdToken: () => Promise.resolve('valid-token')
            }
          })
        })
      };
    });

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'validpassword123');
    await page.click('[data-testid="login-button"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Should show validation error
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
  });

  test('should show error for empty credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try to login with empty fields
    await page.click('[data-testid="login-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
}); 