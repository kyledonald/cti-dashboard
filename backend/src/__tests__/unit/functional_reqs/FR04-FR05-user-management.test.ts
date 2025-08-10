import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware, mockUsers as originalMockUsers, resetMockUsers } from '../../utils/mock-auth';

const app = createTestApp();

// Create a mutable copy of mock users
let mockUsers = [...originalMockUsers];

const mockAuthMiddleware = createMockAuthMiddleware();
app.use(mockAuthMiddleware);

app.get('/users', (req: any, res) => {
  const orgUsers = mockUsers.filter(user => user.organizationId === req.user.organizationId);
  
  return res.status(200).json({
    users: orgUsers
  });
});

app.get('/users/:userId', (req: any, res) => {
  const { userId } = req.params;
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
      message: 'You can only view users in your organization'
    });
  }
  
  return res.status(200).json({
    user: user
  });
});

app.put('/users/:userId/role', (req: any, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only admins can assign user roles'
    });
  }
  
  if (!role) {
    return res.status(400).json({
      error: 'Role required',
      message: 'Role must be specified'
    });
  }
  
  const validRoles = ['admin', 'editor', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      error: 'Invalid role',
      message: 'Role must be admin, editor, or viewer'
    });
  }
  
  const userIndex = mockUsers.findIndex(u => u.userId === userId);
  if (userIndex === -1) {
    return res.status(404).json({
      error: 'User not found',
      message: 'User does not exist'
    });
  }
  
  const user = mockUsers[userIndex];
  if (user.organizationId !== req.user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only modify users in your organization'
    });
  }
  
  // Cannot change your own role if you're the only admin
  if (userId === req.user.userId) {
    const orgUsers = mockUsers.filter(u => u.organizationId === req.user.organizationId);
    const adminUsers = orgUsers.filter(u => u.role === 'admin');
    
    if (adminUsers.length === 1 && adminUsers[0].userId === req.user.userId) {
      return res.status(400).json({
        error: 'Cannot change own role',
        message: 'You cannot change your own role as you are the only admin in the organization'
      });
    }
  }
  
  mockUsers[userIndex] = { ...user, role: role };
  
  return res.status(200).json({
    message: 'User role updated successfully',
    user: mockUsers[userIndex]
  });
});

describe('User Role Management & Viewing', () => {
  // Reset mock data before each test
  beforeEach(() => {
    mockUsers = [...originalMockUsers];
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

    it('should reject admin trying to change their own role when they are the only admin', async () => {
      // Temporarily remove the second admin to create a single admin scenario
      const singleAdminUsers = mockUsers.filter(u => u.userId !== 'second-admin-user-id');
      const originalUsers = [...mockUsers];
      mockUsers = singleAdminUsers;
      
      const response = await request(app)
        .put('/users/admin-user-id/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'viewer' })
        .expect(400);

      expect(response.body.error).toBe('Cannot change own role');
      expect(response.body.message).toBe('You cannot change your own role as you are the only admin in the organization');
      
      // Restore the original mock data
      mockUsers = originalUsers;
    });

    it('should allow admin to change their own role when there are other admins', async () => {
      const response = await request(app)
        .put('/users/second-admin-user-id/role')
        .set('Authorization', 'Bearer second-admin-token')
        .send({ role: 'editor' })
        .expect(200);

      expect(response.body.message).toBe('User role updated successfully');
      expect(response.body.user.role).toBe('editor');
      expect(response.body.user.userId).toBe('second-admin-user-id');
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

      expect(response.body.users).toHaveLength(4); // 2 admins, editor, viewer from org-1
      expect(response.body.users.every((user: any) => user.organizationId === 'org-1')).toBe(true);
      expect(response.body.users.filter((user: any) => user.role === 'admin')).toHaveLength(2);
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
      await request(app)
        .put('/users/viewer-user-id/role')
        .set('Authorization', 'Bearer admin-token')
        .send({ role: 'editor' })
        .expect(200);

      const response = await request(app)
        .get('/users/viewer-user-id')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.user.role).toBe('editor');
    });
  });
});
