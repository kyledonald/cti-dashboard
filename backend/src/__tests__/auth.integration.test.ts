import request from 'supertest';
import express from 'express';
import { Firestore } from '@google-cloud/firestore';

// Mock Firestore
const mockDb = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  where: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  add: jest.fn(),
  batch: jest.fn(() => ({
    set: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    commit: jest.fn()
  }))
} as any;

// Mock Firestore snapshot
const mockSnapshot = {
  forEach: jest.fn((callback) => {
    // Mock empty users list
    return [];
  }),
  empty: true,
  size: 0
};

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  apps: [],
  credential: {
    applicationDefault: jest.fn()
  },
  auth: () => ({
    verifyIdToken: jest.fn()
  })
}));

// Import the app setup
import { authenticateToken } from '../middleware/auth.middleware';
import { userRouter } from '../routes/user.routes';

const app = express();
app.use(express.json());
app.use(authenticateToken(mockDb)); // Add authentication middleware
app.use('/users', userRouter(mockDb));

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default Firestore mocks
    mockDb.get.mockResolvedValue(mockSnapshot);
    mockDb.add.mockResolvedValue({ id: 'test-user-id' });
    mockDb.set.mockResolvedValue(undefined);
  });

  describe('Login/Authentication Tests', () => {
    test('1. Valid login with correct credentials', async () => {
      // Mock successful token verification
      const mockVerifyIdToken = require('firebase-admin').auth().verifyIdToken;
      mockVerifyIdToken.mockResolvedValue({
        uid: 'test-user-id',
        email: 'test@example.com'
      });

      // Mock user exists in database
      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          userId: 'test-user-id',
          email: 'test@example.com',
          role: 'admin',
          organizationId: 'test-org'
        })
      });

      const response = await request(app)
        .post('/users/register')
        .set('Authorization', 'Bearer valid-token')
        .send({
          googleId: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(200);
    });

    test('2. Invalid email format', async () => {
      const response = await request(app)
        .post('/users/register')
        .set('Authorization', 'Bearer valid-token')
        .send({
          googleId: 'test-user-id',
          email: 'invalid-email',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });

    test('3. Empty email/password', async () => {
      const response = await request(app)
        .post('/users/register')
        .set('Authorization', 'Bearer valid-token')
        .send({
          googleId: 'test-user-id',
          email: '',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(400);
    });

    test('4. Non-existent user', async () => {
      // Mock token verification but user doesn't exist in database
      const mockVerifyIdToken = require('firebase-admin').auth().verifyIdToken;
      mockVerifyIdToken.mockResolvedValue({
        uid: 'non-existent-user',
        email: 'nonexistent@example.com'
      });

      mockDb.get.mockResolvedValue({
        exists: false
      });

      const response = await request(app)
        .post('/users/register')
        .set('Authorization', 'Bearer valid-token')
        .send({
          googleId: 'non-existent-user',
          email: 'nonexistent@example.com',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(200); // Should create new user
    });

    test('5. SQL injection attempt', async () => {
      const response = await request(app)
        .post('/users/register')
        .set('Authorization', 'Bearer valid-token')
        .send({
          googleId: "'; DROP TABLE users; --",
          email: "'; DROP TABLE users; --",
          firstName: "'; DROP TABLE users; --",
          lastName: "'; DROP TABLE users; --"
        });

      // Should handle gracefully without SQL injection
      expect(response.status).not.toBe(500);
    });

    test('6. XSS attempt', async () => {
      const response = await request(app)
        .post('/users/register')
        .set('Authorization', 'Bearer valid-token')
        .send({
          googleId: 'test-user-id',
          email: 'test@example.com',
          firstName: '<script>alert("xss")</script>',
          lastName: '<img src="x" onerror="alert(\'xss\')">'
        });

      // Should handle XSS attempts gracefully
      expect(response.status).not.toBe(500);
    });

    test('7. Invalid token', async () => {
      const mockVerifyIdToken = require('firebase-admin').auth().verifyIdToken;
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      const response = await request(app)
        .post('/users/register')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          googleId: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(401);
    });

    test('8. Missing token', async () => {
      const response = await request(app)
        .post('/users/register')
        .send({
          googleId: 'test-user-id',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Authorization Tests', () => {
    test('Admin can access all endpoints', async () => {
      // Mock admin user
      const mockVerifyIdToken = require('firebase-admin').auth().verifyIdToken;
      mockVerifyIdToken.mockResolvedValue({
        uid: 'admin-user-id',
        email: 'admin@example.com'
      });

      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          userId: 'admin-user-id',
          email: 'admin@example.com',
          role: 'admin',
          organizationId: 'test-org'
        })
      });

      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
    });

    test('Viewer cannot delete users', async () => {
      // Mock viewer user
      const mockVerifyIdToken = require('firebase-admin').auth().verifyIdToken;
      mockVerifyIdToken.mockResolvedValue({
        uid: 'viewer-user-id',
        email: 'viewer@example.com'
      });

      mockDb.get.mockResolvedValue({
        exists: true,
        data: () => ({
          userId: 'viewer-user-id',
          email: 'viewer@example.com',
          role: 'viewer',
          organizationId: 'test-org'
        })
      });

      const response = await request(app)
        .delete('/users/some-user-id')
        .set('Authorization', 'Bearer viewer-token');

      expect(response.status).toBe(403);
    });
  });
}); 