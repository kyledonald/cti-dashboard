import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';

const app = createTestApp();

const mockAuthMiddleware = createMockAuthMiddleware(['/api/incidents']);
app.use(mockAuthMiddleware);

app.post('/api/incidents', (req: any, res) => {
  const { title, description, priority, status } = req.body;

  // Test sanitization logic
  const sanitizeInput = (input: any): any => {
    if (typeof input === 'string') {
      return input.replace(/<script[^>]*>.*?<\/script>/gi, '')
                  .replace(/<style[^>]*>.*?<\/style>/gi, '')
                  .replace(/<[^>]*>/g, '');
      // regex patterns made with help from online resources
    }
    
    if (Array.isArray(input)) {
      return input.map(item => sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  };

  if (!title || !description || !priority || !status) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Title, description, priority, and status are required'
    });
  }

  const sanitizedData = sanitizeInput({
    title,
    description,
    priority,
    status
  });

  res.status(201).json({
    message: 'Incident created successfully',
    incident: {
      incidentId: 'inc-test-123',
      ...sanitizedData,
      dateCreated: new Date().toISOString()
    }
  });
});

describe('Input Sanitization Tests', () => {
  describe('HTML Tag Removal', () => {
    test('should remove html tags', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: '<h1>Security Breach</h1>',
          description: 'Test description',
          priority: 'High',
          status: 'Open'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.incident.title).toBe('Security Breach');
    });

    test('should remove html tags with attributes', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: '<a href="javascript:alert(1)">Click me</a>',
          description: 'Test description',
          priority: 'High',
          status: 'Open'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.incident.title).toBe('Click me');
    });

    test('should remove self closing html tags', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: 'Image<img src="x" onerror="alert(1)">Text',
          description: 'Test description',
          priority: 'High',
          status: 'Open'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.incident.title).toBe('ImageText');
    });
  });

  describe('XSS Prevention', () => {
    test('should prevent XSS', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: '<script>alert("XSS")</script>',
          description: 'Test description',
          priority: 'High',
          status: 'Open'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.incident.title).toBe('');
    });

    test('should prevent event handler injection', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: '<img src="x" onerror="alert(1)">',
          description: 'Test description',
          priority: 'High',
          status: 'Open'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.incident.title).toBe('');
    });

    test('should prevent iframe injection', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: '<iframe src="javascript:alert(1)"></iframe>',
          description: 'Test description',
          priority: 'High',
          status: 'Open'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.incident.title).toBe('');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty strings', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: '',
          description: 'Test description',
          priority: 'High',
          status: 'Open'
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });
  });
}); 
