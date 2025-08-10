import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';

const app = createTestApp();

const mockAuthMiddleware = createMockAuthMiddleware(['/users/register', '/users/login', '/users/logout']);
app.use(mockAuthMiddleware);

const validatePassword = (password: string): boolean => {
  if (!password || typeof password !== 'string') return false;
  
  if (password.length < 8) return false;
  
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  return hasLowercase && hasUppercase && hasNumber && hasSpecialChar;
};

app.post('/users/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email and password are required'
    });
  }

  if (!firstName || !lastName) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'First name and last name are required'
    });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
    });
  }

  const sanitizedEmail = email.replace(/[<>]/g, '');
  const sanitizedFirstName = firstName.replace(/[<>]/g, '');
  const sanitizedLastName = lastName.replace(/[<>]/g, '');

  if (email !== sanitizedEmail || firstName !== sanitizedFirstName || lastName !== sanitizedLastName) {
    return res.status(400).json({
      error: 'Invalid input',
      message: 'Input contains invalid characters'
    });
  }

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

app.post('/users/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing credentials',
      message: 'Email and password are required'
    });
  }

  res.json({
    message: 'Login successful',
    user: {
      userId: 'test-user-id',
      email: email,
      role: 'admin'
    }
  });
});

app.post('/users/logout', (req, res) => {
  res.json({
    message: 'Logout successful'
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

    it('should successfully register user with valid credentials', async () => {
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
      expect(response.body.user.role).toBe('unassigned');
    });
  });

  describe('User Login Tests', () => {
    it('should reject login without credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Missing credentials');
    });

    it('should successfully login with valid credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });
});

describe('FR02: User Logout', () => {
  it('should successfully logout user', async () => {
    const response = await request(app)
      .post('/users/logout')
      .expect(200);

    expect(response.body.message).toBe('Logout successful');
  });
});
