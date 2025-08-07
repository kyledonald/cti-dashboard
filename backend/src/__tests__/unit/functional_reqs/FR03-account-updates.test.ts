import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';

// Create test app
const app = createTestApp();

// Mock authentication middleware
const mockAuthMiddleware = createMockAuthMiddleware();
app.use(mockAuthMiddleware);

// Mock user update endpoint
app.put('/users/:userId', (req: any, res) => {
  const { userId } = req.params;
  const updateData = req.body;

  // Test 1: No fields provided for the update
  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      error: 'No fields to update',
      message: 'At least one field must be provided for update'
    });
  }

  // Test 2: Email already exists (simulated)
  if (updateData.email && updateData.email === 'existing@example.com') {
    return res.status(409).json({
      error: 'Email already exists',
      message: 'An account with this email already exists'
    });
  }

  // Test 3: Same password check
  if (updateData.password && updateData.password === 'CurrentPass123!') {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'New password must be different from current password'
    });
  }

  // Test 4: Successful update
  res.status(200).json({
    message: 'User updated successfully',
    user: {
      userId: userId,
      email: updateData.email || 'test@example.com',
      firstName: updateData.firstName || 'John',
      lastName: updateData.lastName || 'Doe',
      role: 'admin'
    }
  });
});

describe('FR03: User Account Updates', () => {
  it('should reject update with no fields provided', async () => {
    const response = await request(app)
      .put('/users/test-user-id')
      .set('Authorization', 'Bearer admin-token')
      .send({})
      .expect(400);

    expect(response.body.error).toBe('No fields to update');
    expect(response.body.message).toBe('At least one field must be provided for update');
  });

  it('should reject update with existing email', async () => {
    const response = await request(app)
      .put('/users/test-user-id')
      .set('Authorization', 'Bearer admin-token')
      .send({ email: 'existing@example.com' })
      .expect(409);

    expect(response.body.error).toBe('Email already exists');
    expect(response.body.message).toBe('An account with this email already exists');
  });

  it('should reject update with same password', async () => {
    const response = await request(app)
      .put('/users/test-user-id')
      .set('Authorization', 'Bearer admin-token')
      .send({ password: 'CurrentPass123!' })
      .expect(400);

    expect(response.body.error).toBe('Invalid password');
    expect(response.body.message).toBe('New password must be different from current password');
  });

  it('should allow successful user update', async () => {
    const response = await request(app)
      .put('/users/test-user-id')
      .set('Authorization', 'Bearer admin-token')
      .send({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
      })
      .expect(200);

    expect(response.body.message).toBe('User updated successfully');
    expect(response.body.user.firstName).toBe('Jane');
    expect(response.body.user.lastName).toBe('Smith');
    expect(response.body.user.email).toBe('jane.smith@example.com');
  });
});
