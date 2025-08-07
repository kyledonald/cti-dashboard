import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';
import { mockIncidents } from '../../utils/test-data';

// Create test app
const app = createTestApp();

// Mock authentication middleware
const mockAuthMiddleware = createMockAuthMiddleware();
app.use(mockAuthMiddleware);

// Mock incidents endpoint with organization filtering
app.get('/api/incidents', (req: any, res) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to view incidents'
    });
  }

  // Filter incidents by user's organization
  const userIncidents = mockIncidents.filter(incident => 
    incident.organizationId === user.organizationId
  );

  res.json({
    incidents: userIncidents,
    total: userIncidents.length,
    organizationId: user.organizationId
  });
});

// Mock single incident endpoint with organization validation
app.get('/api/incidents/:incidentId', (req: any, res) => {
  const { incidentId } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to view incident details'
    });
  }

  // Find incident and check organization access
  const incident = mockIncidents.find(inc => inc.incidentId === incidentId);
  
  if (!incident) {
    return res.status(404).json({
      error: 'Incident not found',
      message: 'The requested incident does not exist'
    });
  }

  if (incident.organizationId !== user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only view incidents from your own organization'
    });
  }

  res.json({ incident });
});

// Mock create incident endpoint with organization assignment
app.post('/api/incidents', (req: any, res) => {
  const { title, description, priority, status } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to create incidents'
    });
  }

  if (!title || !description || !priority || !status) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Title, description, priority, and status are required'
    });
  }

  // Create incident with user's organization
  const newIncident = {
    incidentId: `inc-${Date.now()}`,
    title,
    description,
    priority,
    status,
    organizationId: user.organizationId,
    reportedByUserId: user.userId,
    reportedByUserName: `${user.firstName} ${user.lastName}`,
    dateCreated: { _seconds: Date.now() / 1000 },
    resolutionComments: []
  };

  res.status(201).json({
    message: 'Incident created successfully',
    incident: newIncident
  });
});

// Mock update incident endpoint with organization validation
app.put('/api/incidents/:incidentId', (req: any, res) => {
  const { incidentId } = req.params;
  const updates = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to update incidents'
    });
  }

  // Find incident and check organization access
  const incident = mockIncidents.find(inc => inc.incidentId === incidentId);
  
  if (!incident) {
    return res.status(404).json({
      error: 'Incident not found',
      message: 'The requested incident does not exist'
    });
  }

  if (incident.organizationId !== user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only update incidents from your own organization'
    });
  }

  // Update incident
  const updatedIncident = { ...incident, ...updates };
  
  res.json({
    message: 'Incident updated successfully',
    incident: updatedIncident
  });
});

// Mock delete incident endpoint with organization validation
app.delete('/api/incidents/:incidentId', (req: any, res) => {
  const { incidentId } = req.params;
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to delete incidents'
    });
  }

  // Find incident and check organization access
  const incident = mockIncidents.find(inc => inc.incidentId === incidentId);
  
  if (!incident) {
    return res.status(404).json({
      error: 'Incident not found',
      message: 'The requested incident does not exist'
    });
  }

  if (incident.organizationId !== user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only delete incidents from your own organization'
    });
  }

  res.json({
    message: 'Incident deleted successfully',
    incidentId
  });
});

describe('FR24: Multi-Organisation Support', () => {
  describe('Organization-Based Data Isolation', () => {
    test('should only return incidents from user\'s organization', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.incidents).toBeDefined();
      expect(response.body.organizationId).toBe('org-1');
      
      // Verify all returned incidents belong to org-1
      response.body.incidents.forEach((incident: any) => {
        expect(incident.organizationId).toBe('org-1');
      });
    });

    test('should allow users from different organizations to see only their incidents', async () => {
      // Test org-1 user
      const org1Response = await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(org1Response.body.organizationId).toBe('org-1');
      expect(org1Response.body.incidents.every((inc: any) => inc.organizationId === 'org-1')).toBe(true);

      // Test org-2 user
      const org2Response = await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer other-org-token')
        .expect(200);

      expect(org2Response.body.organizationId).toBe('org-2');
      expect(org2Response.body.incidents.every((inc: any) => inc.organizationId === 'org-2')).toBe(true);
    });
  });

  describe('Single Incident Access Control', () => {
    test('should allow access to incident from same organization', async () => {
      const response = await request(app)
        .get('/api/incidents/inc1')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.incident).toBeDefined();
      expect(response.body.incident.incidentId).toBe('inc1');
      expect(response.body.incident.organizationId).toBe('org-1');
    });

    test('should deny access to incident from different organization', async () => {
      const response = await request(app)
        .get('/api/incidents/inc1')
        .set('Authorization', 'Bearer other-org-token')
        .expect(403);

      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('You can only view incidents from your own organization');
    });

    test('should return 404 for non-existent incident', async () => {
      const response = await request(app)
        .get('/api/incidents/nonexistent')
        .set('Authorization', 'Bearer admin-token')
        .expect(404);

      expect(response.body.error).toBe('Incident not found');
    });
  });

  describe('Incident Creation with Organization Assignment', () => {
    test('should create incident with user\'s organization', async () => {
      const incidentData = {
        title: 'Test Security Incident',
        description: 'This is a test incident for organization isolation',
        priority: 'Medium',
        status: 'Open'
      };

      const response = await request(app)
        .post('/api/incidents')
        .send(incidentData)
        .set('Authorization', 'Bearer admin-token')
        .expect(201);

      expect(response.body.incident).toBeDefined();
      expect(response.body.incident.title).toBe(incidentData.title);
      expect(response.body.incident.organizationId).toBe('org-1');
      expect(response.body.incident.reportedByUserId).toBe('admin-user-id');
    });

    test('should require authentication to create incidents', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: 'Test Incident',
          description: 'Test description',
          priority: 'Low',
          status: 'Open'
        })
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    test('should validate required fields for incident creation', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .send({
          title: 'Test Incident'
          // Missing: description, priority, status
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Missing required fields');
    });
  });

  describe('Incident Updates with Organization Validation', () => {
    test('should allow updating incident from same organization', async () => {
      const updates = {
        status: 'In Progress',
        priority: 'High'
      };

      const response = await request(app)
        .put('/api/incidents/inc1')
        .send(updates)
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.incident).toBeDefined();
      expect(response.body.incident.status).toBe('In Progress');
      expect(response.body.incident.priority).toBe('High');
      expect(response.body.incident.organizationId).toBe('org-1');
    });

    test('should deny updating incident from different organization', async () => {
      const response = await request(app)
        .put('/api/incidents/inc1')
        .send({ status: 'Closed' })
        .set('Authorization', 'Bearer other-org-token')
        .expect(403);

      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('You can only update incidents from your own organization');
    });
  });

  describe('Incident Deletion with Organization Validation', () => {
    test('should allow deleting incident from same organization', async () => {
      const response = await request(app)
        .delete('/api/incidents/inc1')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.message).toBe('Incident deleted successfully');
      expect(response.body.incidentId).toBe('inc1');
    });

    test('should deny deleting incident from different organization', async () => {
      const response = await request(app)
        .delete('/api/incidents/inc1')
        .set('Authorization', 'Bearer other-org-token')
        .expect(403);

      expect(response.body.error).toBe('Access denied');
      expect(response.body.message).toBe('You can only delete incidents from your own organization');
    });
  });

  describe('Authentication Requirements', () => {
    test('should require authentication to view incidents', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    test('should require authentication to view single incident', async () => {
      const response = await request(app)
        .get('/api/incidents/inc1')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    test('should require authentication to update incidents', async () => {
      const response = await request(app)
        .put('/api/incidents/inc1')
        .send({ status: 'Closed' })
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    test('should require authentication to delete incidents', async () => {
      const response = await request(app)
        .delete('/api/incidents/inc1')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });
}); 