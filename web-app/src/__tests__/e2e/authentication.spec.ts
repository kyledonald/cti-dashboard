import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Tests', () => {
    test('1. Valid login with correct credentials', async ({ page }) => {
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

    test('2. Invalid email format', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Should show validation error
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email');
    });

    test('3. Empty email/password', async ({ page }) => {
      await page.goto('/login');
      
      // Try to login with empty fields
      await page.click('[data-testid="login-button"]');

      // Should show validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
    });

    test('4. Incorrect password', async ({ page }) => {
      await page.goto('/login');
      
      // Mock failed authentication
      await page.addInitScript(() => {
        (window as any).firebase = {
          auth: () => ({
            signInWithEmailAndPassword: () => Promise.reject(new Error('Invalid password'))
          })
        };
      });

      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');

      // Should show error message
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid password');
    });

    test('5. Non-existent user', async ({ page }) => {
      await page.goto('/login');
      
      // Mock user not found
      await page.addInitScript(() => {
        (window as any).firebase = {
          auth: () => ({
            signInWithEmailAndPassword: () => Promise.reject(new Error('User not found'))
          })
        };
      });

      await page.fill('[data-testid="email-input"]', 'nonexistent@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Should show error message
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-error"]')).toContainText('User not found');
    });
  });

  test.describe('Security Tests', () => {
    test('6. SQL injection attempt in login form', async ({ page }) => {
      await page.goto('/login');
      
      const sqlInjectionPayload = "'; DROP TABLE users; --";
      
      await page.fill('[data-testid="email-input"]', sqlInjectionPayload);
      await page.fill('[data-testid="password-input"]', sqlInjectionPayload);
      await page.click('[data-testid="login-button"]');

      // Should handle gracefully without crashing
      await expect(page).not.toHaveURL(/error/);
      // Should show validation error for invalid email format
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    });

    test('7. XSS attempt in login form', async ({ page }) => {
      await page.goto('/login');
      
      const xssPayload = '<script>alert("xss")</script>';
      
      await page.fill('[data-testid="email-input"]', xssPayload);
      await page.fill('[data-testid="password-input"]', 'password123');
      await page.click('[data-testid="login-button"]');

      // Should handle gracefully without executing script
      await expect(page).not.toHaveURL(/error/);
      // Should show validation error for invalid email format
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    });

    test('8. Rate limiting on login attempts', async ({ page }) => {
      await page.goto('/login');
      
      // Mock rate limiting response
      await page.addInitScript(() => {
        (window as any).firebase = {
          auth: () => ({
            signInWithEmailAndPassword: () => Promise.reject(new Error('Too many attempts'))
          })
        };
      });

      // Try multiple login attempts
      for (let i = 0; i < 5; i++) {
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'wrongpassword');
        await page.click('[data-testid="login-button"]');
        await page.waitForTimeout(100);
      }

      // Should show rate limiting error
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-error"]')).toContainText('Too many attempts');
    });
  });

  test.describe('Registration Tests', () => {
    test('9. Valid registration', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="register-link"]');
      
      // Mock successful registration
      await page.addInitScript(() => {
        (window as any).firebase = {
          auth: () => ({
            createUserWithEmailAndPassword: () => Promise.resolve({
              user: {
                uid: 'new-user-id',
                email: 'newuser@example.com',
                getIdToken: () => Promise.resolve('valid-token')
              }
            })
          })
        };
      });

      await page.fill('[data-testid="email-input"]', 'newuser@example.com');
      await page.fill('[data-testid="password-input"]', 'ValidPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'ValidPassword123!');
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.click('[data-testid="register-button"]');

      // Should redirect to welcome page
      await expect(page).toHaveURL(/\/welcome/);
    });

    test('10. Insufficient password strength', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="register-link"]');
      
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'weak');
      await page.fill('[data-testid="confirm-password-input"]', 'weak');
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.click('[data-testid="register-button"]');

      // Should show password strength error
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters');
    });

    test('11. Password mismatch', async ({ page }) => {
      await page.goto('/login');
      await page.click('[data-testid="register-link"]');
      
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'ValidPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
      await page.fill('[data-testid="first-name-input"]', 'John');
      await page.fill('[data-testid="last-name-input"]', 'Doe');
      await page.click('[data-testid="register-button"]');

      // Should show password mismatch error
      await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('Passwords do not match');
    });
  });

  test.describe('Authorization Tests', () => {
    test('12. Unauthorized access to protected routes', async ({ page }) => {
      // Try to access dashboard without authentication
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('13. Role-based access control', async ({ page }) => {
      // Mock viewer user
      await page.addInitScript(() => {
        (window as any).firebase = {
          auth: () => ({
            onAuthStateChanged: (callback: any) => callback({
              uid: 'viewer-user-id',
              email: 'viewer@example.com',
              getIdToken: () => Promise.resolve('viewer-token')
            })
          })
        };
      });

      await page.goto('/dashboard');
      
      // Viewer should not see admin-only elements
      await expect(page.locator('[data-testid="admin-only-button"]')).not.toBeVisible();
    });
  });
}); 