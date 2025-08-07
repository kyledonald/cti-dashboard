import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';
import { mockUsers } from '../../utils/mock-auth';

// Create test app
const app = createTestApp();

// Mock authentication middleware
const mockAuthMiddleware = createMockAuthMiddleware();
app.use(mockAuthMiddleware);

// Mock notification scheduling endpoints
app.post('/api/notifications/schedule', (req: any, res) => {
  const { title, message, priority, scheduledDate, scheduledTime: providedTime, userIds } = req.body;
  const user = req.user;

  // Only admins can schedule notifications
  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only administrators can schedule notifications'
    });
  }

  // Validate required fields
  if (!title || !message || !priority || !scheduledDate || !userIds || userIds.length === 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Title, message, priority, scheduled date, and user selection are required'
    });
  }

  // Validate priority
  if (!['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({
      error: 'Invalid priority',
      message: 'Priority must be low, medium, or high'
    });
  }

  // Validate date format and future date
  const scheduledTime = providedTime || new Date().toTimeString().slice(0, 5); // Default to current time if not provided
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
  const now = new Date();
  
  if (isNaN(scheduledDateTime.getTime())) {
    return res.status(400).json({
      error: 'Invalid date/time format',
      message: 'Please provide valid date and time'
    });
  }

  // Allow dates that are at least 1 minute in the future for testing
  const oneMinuteFromNow = new Date(now.getTime() + 60000);
  if (scheduledDateTime <= oneMinuteFromNow) {
    return res.status(400).json({
      error: 'Invalid scheduled time',
      message: 'Scheduled time must be in the future'
    });
  }

  // Mock successful scheduling
  const scheduledNotification = {
    id: 'scheduled-notification-1',
    title,
    message,
    priority,
    scheduledDate,
    scheduledTime,
    scheduledDateTime: scheduledDateTime.toISOString(),
    userIds,
    organizationId: user.organizationId,
    createdBy: user.userId,
    status: 'scheduled',
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    message: 'Notification scheduled successfully',
    scheduledNotification
  });
});

app.get('/api/notifications/scheduled', (req: any, res) => {
  const user = req.user;

  // Only admins can view scheduled notifications
  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only administrators can view scheduled notifications'
    });
  }

  // Mock scheduled notifications data
  const scheduledNotifications = [
    {
      id: 'scheduled-1',
      title: 'Password Update Reminder',
      message: 'Please update your password for security',
      priority: 'medium',
      scheduledDate: '2024-12-25',
      scheduledTime: '09:00',
      scheduledDateTime: '2024-12-25T09:00:00.000Z',
      userIds: ['user-1', 'user-2'],
      organizationId: user.organizationId,
      createdBy: user.userId,
      status: 'scheduled',
      createdAt: '2024-12-20T10:00:00.000Z'
    },
    {
      id: 'scheduled-2',
      title: 'Security Training Reminder',
      message: 'Complete your monthly security training',
      priority: 'high',
      scheduledDate: '2024-12-26',
      scheduledTime: '14:00',
      scheduledDateTime: '2024-12-26T14:00:00.000Z',
      userIds: ['user-1', 'user-2', 'user-3'],
      organizationId: user.organizationId,
      createdBy: user.userId,
      status: 'scheduled',
      createdAt: '2024-12-20T11:00:00.000Z'
    }
  ];

  res.json({
    scheduledNotifications,
    total: scheduledNotifications.length
  });
});

app.delete('/api/notifications/scheduled/:notificationId', (req: any, res) => {
  const { notificationId } = req.params;
  const user = req.user;

  // Only admins can cancel scheduled notifications
  if (user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only administrators can cancel scheduled notifications'
    });
  }

  // Mock successful cancellation
  res.json({
    message: 'Scheduled notification cancelled successfully',
    notificationId
  });
});

app.get('/api/notifications/reminders', (req: any, res) => {
  const user = req.user;

  // All authenticated users can view their reminders
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to view reminders'
    });
  }

  // Mock reminders that are due
  const now = new Date();
  const reminders = [
    {
      id: 'reminder-1',
      title: 'Password Update Reminder',
      message: 'Your password is due for an update. Please change it within 7 days.',
      priority: 'medium',
      scheduledDateTime: '2024-12-20T09:00:00.000Z',
      dueDateTime: '2024-12-20T09:00:00.000Z',
      status: 'due',
      type: 'password_reminder',
      createdAt: '2024-12-15T10:00:00.000Z'
    },
    {
      id: 'reminder-2',
      title: 'Security Training Due',
      message: 'Your monthly security training is now available. Please complete it by the end of the week.',
      priority: 'high',
      scheduledDateTime: '2024-12-21T14:00:00.000Z',
      dueDateTime: '2024-12-21T14:00:00.000Z',
      status: 'due',
      type: 'training_reminder',
      createdAt: '2024-12-16T11:00:00.000Z'
    }
  ];

  res.json({
    reminders,
    total: reminders.length
  });
});

app.post('/api/notifications/reminders/:reminderId/acknowledge', (req: any, res) => {
  const { reminderId } = req.params;
  const user = req.user;

  // All authenticated users can acknowledge their reminders
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to acknowledge reminders'
    });
  }

  // Mock successful acknowledgment
  res.json({
    message: 'Reminder acknowledged successfully',
    reminderId,
    acknowledgedAt: new Date().toISOString()
  });
});

describe('FR20-FR21: Notification Scheduling & Reminders', () => {
  describe('FR20: Schedule Security Reminders', () => {
    describe('Scheduling Notifications', () => {
      test('should allow admins to schedule security reminders', async () => {
        const notificationData = {
          title: 'Password Update Reminder',
          message: 'Please update your password for enhanced security',
          priority: 'medium',
          scheduledDate: '2025-12-25',
          scheduledTime: '09:00',
          userIds: ['user-1', 'user-2']
        };

        const response = await request(app)
          .post('/api/notifications/schedule')
          .send(notificationData)
          .set('Authorization', 'Bearer admin-token')
          .expect(201);

        expect(response.body.message).toBe('Notification scheduled successfully');
        expect(response.body.scheduledNotification).toBeDefined();
        expect(response.body.scheduledNotification.title).toBe(notificationData.title);
        expect(response.body.scheduledNotification.priority).toBe(notificationData.priority);
        expect(response.body.scheduledNotification.status).toBe('scheduled');
      });

      test('should prevent non-admins from scheduling notifications', async () => {
        const notificationData = {
          title: 'Password Reminder',
          message: 'Update your password',
          priority: 'low',
          scheduledDate: '2024-12-25',
          scheduledTime: '09:00',
          userIds: ['user-1']
        };

        const response = await request(app)
          .post('/api/notifications/schedule')
          .send(notificationData)
          .set('Authorization', 'Bearer editor-token')
          .expect(403);

        expect(response.body.error).toBe('Access denied');
        expect(response.body.message).toBe('Only administrators can schedule notifications');
      });

      test('should require all mandatory fields for scheduling', async () => {
        const incompleteData = {
          title: 'Password Reminder',
          priority: 'medium',
          scheduledDate: '2024-12-25'
          // Missing: message, userIds
        };

        const response = await request(app)
          .post('/api/notifications/schedule')
          .send(incompleteData)
          .set('Authorization', 'Bearer admin-token')
          .expect(400);

        expect(response.body.error).toBe('Missing required fields');
      });

      test('should validate priority values', async () => {
        const invalidData = {
          title: 'Password Reminder',
          message: 'Update your password',
          priority: 'invalid',
          scheduledDate: '2024-12-25',
          scheduledTime: '09:00',
          userIds: ['user-1']
        };

        const response = await request(app)
          .post('/api/notifications/schedule')
          .send(invalidData)
          .set('Authorization', 'Bearer admin-token')
          .expect(400);

        expect(response.body.error).toBe('Invalid priority');
      });

      test('should reject past scheduled times', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Yesterday

        const pastData = {
          title: 'Password Reminder',
          message: 'Update your password',
          priority: 'medium',
          scheduledDate: pastDate.toISOString().split('T')[0],
          scheduledTime: '09:00',
          userIds: ['user-1']
        };

        const response = await request(app)
          .post('/api/notifications/schedule')
          .send(pastData)
          .set('Authorization', 'Bearer admin-token')
          .expect(400);

        expect(response.body.error).toBe('Invalid scheduled time');
        expect(response.body.message).toBe('Scheduled time must be in the future');
      });
    });

    describe('Managing Scheduled Notifications', () => {
      test('should allow admins to view scheduled notifications', async () => {
        const response = await request(app)
          .get('/api/notifications/scheduled')
          .set('Authorization', 'Bearer admin-token')
          .expect(200);

        expect(response.body.scheduledNotifications).toBeDefined();
        expect(response.body.total).toBeGreaterThan(0);
        expect(response.body.scheduledNotifications[0]).toHaveProperty('id');
        expect(response.body.scheduledNotifications[0]).toHaveProperty('title');
        expect(response.body.scheduledNotifications[0]).toHaveProperty('status');
      });

      test('should prevent non-admins from viewing scheduled notifications', async () => {
        const response = await request(app)
          .get('/api/notifications/scheduled')
          .set('Authorization', 'Bearer editor-token')
          .expect(403);

        expect(response.body.error).toBe('Access denied');
        expect(response.body.message).toBe('Only administrators can view scheduled notifications');
      });

      test('should allow admins to cancel scheduled notifications', async () => {
        const response = await request(app)
          .delete('/api/notifications/scheduled/scheduled-1')
          .set('Authorization', 'Bearer admin-token')
          .expect(200);

        expect(response.body.message).toBe('Scheduled notification cancelled successfully');
        expect(response.body.notificationId).toBe('scheduled-1');
      });

      test('should prevent non-admins from cancelling scheduled notifications', async () => {
        const response = await request(app)
          .delete('/api/notifications/scheduled/scheduled-1')
          .set('Authorization', 'Bearer editor-token')
          .expect(403);

        expect(response.body.error).toBe('Access denied');
        expect(response.body.message).toBe('Only administrators can cancel scheduled notifications');
      });
    });
  });

  describe('FR21: Display Security Reminders', () => {
    describe('Viewing Reminders', () => {
      test('should allow all authenticated users to view their reminders', async () => {
        const response = await request(app)
          .get('/api/notifications/reminders')
          .set('Authorization', 'Bearer admin-token')
          .expect(200);

        expect(response.body.reminders).toBeDefined();
        expect(response.body.total).toBeGreaterThan(0);
        expect(response.body.reminders[0]).toHaveProperty('id');
        expect(response.body.reminders[0]).toHaveProperty('title');
        expect(response.body.reminders[0]).toHaveProperty('status');
        expect(response.body.reminders[0].status).toBe('due');
      });

      test('should allow editors to view their reminders', async () => {
        const response = await request(app)
          .get('/api/notifications/reminders')
          .set('Authorization', 'Bearer editor-token')
          .expect(200);

        expect(response.body.reminders).toBeDefined();
        expect(response.body.total).toBeGreaterThan(0);
      });

      test('should allow viewers to view their reminders', async () => {
        const response = await request(app)
          .get('/api/notifications/reminders')
          .set('Authorization', 'Bearer viewer-token')
          .expect(200);

        expect(response.body.reminders).toBeDefined();
        expect(response.body.total).toBeGreaterThan(0);
      });
    });

    describe('Reminder Data Structure', () => {
      test('should include all required reminder fields', async () => {
        const response = await request(app)
          .get('/api/notifications/reminders')
          .set('Authorization', 'Bearer admin-token')
          .expect(200);

        const reminder = response.body.reminders[0];
        expect(reminder).toHaveProperty('id');
        expect(reminder).toHaveProperty('title');
        expect(reminder).toHaveProperty('message');
        expect(reminder).toHaveProperty('priority');
        expect(reminder).toHaveProperty('scheduledDateTime');
        expect(reminder).toHaveProperty('dueDateTime');
        expect(reminder).toHaveProperty('status');
        expect(reminder).toHaveProperty('type');
        expect(reminder).toHaveProperty('createdAt');
      });
    });
  });
}); 
