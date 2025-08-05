import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  auth: () => ({
    verifyIdToken: jest.fn(),
    setCustomUserClaims: jest.fn()
  }),
  initializeApp: jest.fn(),
  apps: [],
  credential: {
    applicationDefault: jest.fn()
  }
}));

// Mock Firestore with realistic data
let mockUsers = [
  {
    userId: 'admin-user-id',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    organizationId: 'org-1'
  },
  {
    userId: 'editor-user-id',
    email: 'editor@example.com',
    firstName: 'Editor',
    lastName: 'User',
    role: 'editor',
    organizationId: 'org-1'
  },
  {
    userId: 'viewer-user-id',
    email: 'viewer@example.com',
    firstName: 'Viewer',
    lastName: 'User',
    role: 'viewer',
    organizationId: 'org-1'
  },
  {
    userId: 'other-org-user-id',
    email: 'other@example.com',
    firstName: 'Other',
    lastName: 'User',
    role: 'admin',
    organizationId: 'org-2'
  }
];

const mockDb = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  add: jest.fn()
};

// Create test app
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Mock authentication middleware with role-based access
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'No valid authorization header found'
    });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  // Mock different users based on token
  if (token === 'admin-token') {
    req.user = mockUsers[0]; // admin user
  } else if (token === 'editor-token') {
    req.user = mockUsers[1]; // editor user
  } else if (token === 'viewer-token') {
    req.user = mockUsers[2]; // viewer user
  } else {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Token is invalid or expired'
    });
  }
  
  next();
};

app.use(mockAuthMiddleware);

// Mock get all users endpoint (FR05)
app.get('/users', (req: any, res) => {
  // Only return users from the same organization
  const orgUsers = mockUsers.filter(user => user.organizationId === req.user.organizationId);
  
  return res.status(200).json({
    users: orgUsers
  });
});

// Mock get specific user endpoint
app.get('/users/:userId', (req: any, res) => {
  const { userId } = req.params;
  const user = mockUsers.find(u => u.userId === userId);
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: 'User does not exist'
    });
  }
  
  // Check organization isolation
  if (user.organizationId !== req.user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only view users in your organization'
    });
  }
  
  return res.status(200).json({
    user: user
  });
});

// Mock update user role endpoint (FR04)
app.put('/users/:userId/role', (req: any, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  // Test 1: Only admins can assign roles
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only admins can assign user roles'
    });
  }
  
  // Test 2: Role is required
  if (!role) {
    return res.status(400).json({
      error: 'Role required',
      message: 'Role must be specified'
    });
  }
  
  // Test 3: Valid role values
  const validRoles = ['admin', 'editor', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      error: 'Invalid role',
      message: 'Role must be admin, editor, or viewer'
    });
  }
  
  // Test 4: User exists and is in same organization
  const user = mockUsers.find(u => u.userId === userId);
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: 'User does not exist'
    });
  }
  
  if (user.organizationId !== req.user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only modify users in your organization'
    });
  }
  
  // Test 5: Cannot change your own role
  if (userId === req.user.userId) {
    return res.status(400).json({
      error: 'Cannot change own role',
      message: 'You cannot change your own role'
    });
  }
  
  // Test 6: Successful role update
  const updatedUser = { ...user, role: role };
  // Update the mock data to simulate database update
  const userIndex = mockUsers.findIndex(u => u.userId === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex] = updatedUser;
  }
  
  return res.status(200).json({
    message: 'User role updated successfully',
    user: updatedUser
  });
});

describe('User Role Management & Viewing', () => {
  // Reset mock data before each test
  beforeEach(() => {
    mockUsers = [
      {
        userId: 'admin-user-id',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        organizationId: 'org-1'
      },
      {
        userId: 'editor-user-id',
        email: 'editor@example.com',
        firstName: 'Editor',
        lastName: 'User',
        role: 'editor',
        organizationId: 'org-1'
      },
      {
        userId: 'viewer-user-id',
        email: 'viewer@example.com',
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer',
        organizationId: 'org-1'
      },
      {
        userId: 'other-org-user-id',
        email: 'other@example.com',
        firstName: 'Other',
        lastName: 'User',
        role: 'admin',
        organizationId: 'org-2'
      }
    ];
  });

  describe('FR04: Admin Role Assignment', () => {
    it('should reject role assignment by non-admin users', async () => {
      const response = await request(app)
        .put('/users/editor-user-id/role')
        .set('Authorization', 'Bearer editor-token')
        .send({ role: 'viewer' })
        .expect(403);

      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('Only admins can assign user roles');
    });



    it('should reject role assignment with invalid role', async () => {
      const response = await request(app)
        .put('/users/editor-user-id/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'invalid-role' })
        .expect(400);

      expect(response.body.error).toBe('Invalid role');
      expect(response.body.message).toBe('Role must be admin, editor, or viewer');
    });

    it('should reject role assignment for non-existent user', async () => {
      const response = await request(app)
        .put('/users/non-existent-user/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'viewer' })
        .expect(404);

      expect(response.body.error).toBe('User not found');
      expect(response.body.message).toBe('User does not exist');
    });

    it('should reject role assignment for user in different organization', async () => {
      const response = await request(app)
        .put('/users/other-org-user-id/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'viewer' })
        .expect(403);

      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('You can only modify users in your organization');
    });

    it('should reject admin trying to change their own role', async () => {
      const response = await request(app)
        .put('/users/admin-user-id/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'viewer' })
        .expect(400);

      expect(response.body.error).toBe('Cannot change own role');
      expect(response.body.message).toBe('You cannot change your own role');
    });

    it('should allow admin to assign valid role to user in same organization', async () => {
      const response = await request(app)
        .put('/users/editor-user-id/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'viewer' })
        .expect(200);

      expect(response.body.message).toBe('User role updated successfully');
      expect(response.body.user.role).toBe('viewer');
      expect(response.body.user.userId).toBe('editor-user-id');
    });
  });

  describe('FR05: Viewing User Roles', () => {
    it('should allow admin to view all users in their organization', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.users).toHaveLength(3); // admin, editor, viewer from org-1
      expect(response.body.users.every((user: any) => user.organizationId === 'org-1')).toBe(true);
      expect(response.body.users.some((user: any) => user.role === 'admin')).toBe(true);
      expect(response.body.users.some((user: any) => user.role === 'editor')).toBe(true);
      expect(response.body.users.some((user: any) => user.role === 'viewer')).toBe(true);
    });

    it('should allow admin to view specific user in their organization', async () => {
      const response = await request(app)
        .get('/users/editor-user-id')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.user.userId).toBe('editor-user-id');
      expect(response.body.user.role).toBe('editor');
      expect(response.body.user.organizationId).toBe('org-1');
    });

    it('should reject admin viewing user from different organization', async () => {
      const response = await request(app)
        .get('/users/other-org-user-id')
        .set('Authorization', 'Bearer admin-token')
        .expect(403);

      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('You can only view users in your organization');
    });



    it('should show updated role after role assignment', async () => {
      // First assign a role
      await request(app)
        .put('/users/viewer-user-id/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'editor' })
        .expect(200);

      // Then verify the role change is visible
      const response = await request(app)
        .get('/users/viewer-user-id')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.user.role).toBe('editor');
    });
  });
}); 