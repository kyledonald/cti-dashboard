import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';

// Create test app
const app = createTestApp();

// Mock authentication middleware
const mockAuthMiddleware = createMockAuthMiddleware(['/api/users/password']);
app.use(mockAuthMiddleware);

// Mock password change endpoint with password validation
app.put('/api/users/password', (req: any, res) => {
  const { currentPassword, newPassword } = req.body;

  // Test password validation logic
  const isValidPassword = (password: string): boolean => {
    if (!password || typeof password !== 'string') return false;
    
    if (password.length < 8) return false;
    
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[@$!%*?&]/.test(password);
    
    return hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
  };

  // Check password format first if password is provided (even if other fields are missing)
  if (newPassword !== undefined && newPassword !== null && !isValidPassword(newPassword)) {
    return res.status(400).json({
      error: 'Invalid password format',
      message: 'Password must be at least 8 characters with lowercase, uppercase, digit, and special character'
    });
  }

  // Handle null/undefined password specifically
  if (newPassword === null || newPassword === undefined) {
    return res.status(400).json({
      error: 'Invalid password format',
      message: 'Password must be at least 8 characters with lowercase, uppercase, digit, and special character'
    });
  }

  if (!currentPassword || !newPassword || 
      currentPassword.trim() === '' || newPassword.trim() === '') {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Current password and new password are required'
    });
  }

  res.json({
    message: 'Password updated successfully'
  });
});

describe('Password Validation Tests', () => {
  describe('Valid Password Formats', () => {
    test('should accept valid password', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'NewPass123!'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.message).toBe('Password updated successfully');
    });

    test('should accept minimum length', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'Abc123!@'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.message).toBe('Password updated successfully');
    });
  });

  describe('Invalid Password Formats', () => {
    test('should reject invalid format', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'password'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Invalid password format');
    });

    test('should require number', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'Password!@#'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Invalid password format');
    });

    test('should require special char', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 'Password123'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Invalid password format');
    });
  });

  describe('Edge Cases', () => {
    test('should reject empty password', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: ''
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Invalid password format');
    });

    test('should reject non string password', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'OldPass123!',
          newPassword: 12345678
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Invalid password format');
    });
  });
}); 