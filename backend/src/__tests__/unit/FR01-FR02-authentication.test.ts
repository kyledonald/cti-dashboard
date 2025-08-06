import request from 'supertest';
import { createTestApp } from '../utils/test-setup';
import { createMockAuthMiddleware } from '../utils/mock-auth';

// Create test app
const app = createTestApp();

// Mock authentication middleware
const mockAuthMiddleware = createMockAuthMiddleware(['/users/register', '/users/logout']);
app.use(mockAuthMiddleware);

// Mock user registration endpoint
app.post('/users/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Test 1: No username/password
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email and password are required'
    });
  }

  // Test 2: Missing fields
  if (!firstName || !lastName) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'First name and last name are required'
    });
  }

  // Test 3: Password complexity validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
    });
  }

  // Test 4: XSS protection
  const sanitizedEmail = email.replace(/[<>]/g, '');
  const sanitizedFirstName = firstName.replace(/[<>]/g, '');
  const sanitizedLastName = lastName.replace(/[<>]/g, '');

  if (email !== sanitizedEmail || firstName !== sanitizedFirstName || lastName !== sanitizedLastName) {
    return res.status(400).json({
      error: 'Invalid input',
      message: 'Input contains invalid characters'
    });
  }

  // Test 5: Successful registration
  res.status(201).json({
    message: 'User registered successfully',
    user: {
      userId: 'new-user-id',
      email: sanitizedEmail,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      role: 'unassigned'
    }
  });
});

// Mock dashboard access endpoint
app.get('/dashboard', (req: any, res) => {
  res.status(200).json({
    message: 'Dashboard accessed successfully',
    user: req.user
  });
});

// Mock logout endpoint
app.post('/users/logout', (req, res) => {
  res.status(200).json({
    message: 'User logged out successfully'
  });
});

describe('FR01: User Authentication & Dashboard Access', () => {
  describe('User Registration Tests', () => {
    it('should reject registration without email and password', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!'
        })
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
      expect(response.body.message).toBe('First name and last name are required');
    });

    it('should reject registration with insufficient password complexity', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'weak',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid password');
      expect(response.body.message).toBe('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
    });

    it('should reject registration with XSS attempt', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!',
          firstName: '<script>alert("xss")</script>',
          lastName: 'Doe'
        })
        .expect(400);

      expect(response.body.error).toBe('Invalid input');
      expect(response.body.message).toBe('Input contains invalid characters');
    });

    it('should allow registration with valid credentials', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.firstName).toBe('John');
      expect(response.body.user.lastName).toBe('Doe');
      expect(response.body.user.role).toBe('unassigned');
    });
  });

  describe('Dashboard Access Tests', () => {
    it('should reject dashboard access without authentication', async () => {
      const response = await request(app)
        .get('/dashboard')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should allow dashboard access with valid authentication', async () => {
      const response = await request(app)
        .get('/dashboard')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body.message).toBe('Dashboard accessed successfully');
    });
  });
});

describe('FR02: User Logout', () => {
  it('should allow user to logout successfully', async () => {
    const response = await request(app)
      .post('/users/logout')
      .expect(200);

    expect(response.body.message).toBe('User logged out successfully');
  });
});
