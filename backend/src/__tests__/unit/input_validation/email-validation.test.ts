import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';

const app = createTestApp();

const mockAuthMiddleware = createMockAuthMiddleware(['/api/users/register']);
app.use(mockAuthMiddleware);

app.post('/api/users/register', (req: any, res) => {
  const { email, password, firstName, lastName } = req.body;

  const isValidEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    
    const trimmedEmail = email.trim();
    if (trimmedEmail.length === 0) return false;
    
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    if (!localPart || !domain) return false;
    
    if (localPart.length === 0 || domain.length === 0) return false;
    
    if (!domain.includes('.')) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.length < 2) return false;
    
    const tld = domainParts[domainParts.length - 1];
    if (tld.length < 2) return false;
    
    return true;
  };

  // Check email format first if email is provided (even if other fields are missing)
  if (email !== undefined && email !== null && !isValidEmail(email)) {
    return res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address'
    });
  }

  // Handle null/undefined email specifically
  if (email === null || email === undefined) {
    return res.status(400).json({
      error: 'Invalid email format',
      message: 'Please provide a valid email address'
    });
  }

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email, password, firstName, and lastName are required'
    });
  }

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      email: email.trim(),
      firstName,
      lastName
    }
  });
});

describe('Email Validation Tests', () => {
  describe('Valid Email Formats', () => {
    test('should accept valid email format', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(201);

      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('Invalid Email Formats', () => {
    test('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'invalid-email',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    test('should reject multiple @ symbols', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@@example.com',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    test('should reject email without domain', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    test('should reject email without local part', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: '@example.com',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });
  });

  describe('Edge Cases', () => {
    test('should reject empty email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: '',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    test('should trim trailing or leading whitespace', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: '  test@example.com  ',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(201);

      expect(response.body.user.email).toBe('test@example.com');
    });

    test('should reject null email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: null,
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });

    test('should reject non-string email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 123,
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid email format');
    });
  });
}); 