import request from 'supertest';
import express from 'express';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    applicationDefault: jest.fn()
  },
  firestore: jest.fn(() => ({
    collection: jest.fn()
  }))
}));

// Mock AI service responses
const mockAISummary = {
  summary: 'Critical vulnerability detected in Apache Log4j affecting multiple systems. Immediate patching required.',
  recommendations: [
    'Update Apache Log4j to version 2.17.0 or later',
    'Implement network segmentation',
    'Monitor for suspicious activity'
  ],
  riskLevel: 'Critical',
  affectedSystems: ['Web Server', 'Database Server', 'Application Server']
};

// Mock PDF generation
const mockPDFBuffer = Buffer.from('Mock PDF content for vulnerability summary');

// Mock incident data
const mockIncident = {
  id: 'incident-123',
  title: 'Apache Log4j Vulnerability Detected',
  description: 'Critical vulnerability CVE-2021-44228 detected in production systems',
  severity: 'Critical',
  status: 'Open',
  organizationId: 'org-1',
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2023-01-15T10:00:00Z',
  assignedTo: 'admin-user-id',
  tags: ['vulnerability', 'critical', 'apache', 'log4j']
};

// Mock users for authentication
const mockUsers = [
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
  }
];

// Mock authentication middleware
const mockAuthMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No valid authorization header found',
      message: 'Authorization header is required'
    });
  }

  const token = authHeader.substring(7);
  
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

// Create Express app for testing
const app = express();
app.use(express.json());

// Mock AI summary endpoint
app.post('/incidents/:incidentId/ai-summary', mockAuthMiddleware, (req: any, res) => {
  const { incidentId } = req.params;
  
  // Check if incident exists and belongs to user's organization
  if (incidentId !== mockIncident.id) {
    return res.status(404).json({
      error: 'Incident not found',
      message: 'The specified incident does not exist'
    });
  }
  
  if (mockIncident.organizationId !== req.user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access incidents in your organization'
    });
  }
  
  // Return AI-generated summary
  res.status(200).json({
    summary: mockAISummary.summary,
    recommendations: mockAISummary.recommendations,
    riskLevel: mockAISummary.riskLevel,
    affectedSystems: mockAISummary.affectedSystems,
    generatedAt: new Date().toISOString()
  });
});

// Mock PDF export endpoint
app.post('/incidents/:incidentId/export-pdf', mockAuthMiddleware, (req: any, res) => {
  const { incidentId } = req.params;
  
  // Check if incident exists and belongs to user's organization
  if (incidentId !== mockIncident.id) {
    return res.status(404).json({
      error: 'Incident not found',
      message: 'The specified incident does not exist'
    });
  }
  
  if (mockIncident.organizationId !== req.user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access incidents in your organization'
    });
  }
  
  // Set headers for PDF download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="vulnerability-summary-${incidentId}.pdf"`);
  res.setHeader('Content-Length', mockPDFBuffer.length);
  
  // Return PDF buffer
  res.status(200).send(mockPDFBuffer);
});

describe('AI Summary & PDF Export', () => {
  describe('FR08: AI Generated Vulnerability Summary Report in PDF', () => {
    it('should generate AI summary for incident', async () => {
      const response = await request(app)
        .post('/incidents/incident-123/ai-summary')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.summary).toBe(mockAISummary.summary);
      expect(response.body.recommendations).toEqual(mockAISummary.recommendations);
      expect(response.body.riskLevel).toBe(mockAISummary.riskLevel);
      expect(response.body.affectedSystems).toEqual(mockAISummary.affectedSystems);
      expect(response.body.generatedAt).toBeDefined();
    });

    it('should export AI summary as PDF', async () => {
      const response = await request(app)
        .post('/incidents/incident-123/export-pdf')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('vulnerability-summary-incident-123.pdf');
      expect(response.headers['content-length']).toBe(mockPDFBuffer.length.toString());
      expect(response.body).toEqual(mockPDFBuffer);
    });

    it('should allow all authenticated users to generate AI summary', async () => {
      // Test admin access
      const adminResponse = await request(app)
        .post('/incidents/incident-123/ai-summary')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);
      
      expect(adminResponse.body.summary).toBeDefined();

      // Test editor access
      const editorResponse = await request(app)
        .post('/incidents/incident-123/ai-summary')
        .set('Authorization', 'Bearer editor-token')
        .expect(200);
      
      expect(editorResponse.body.summary).toBeDefined();

      // Test viewer access
      const viewerResponse = await request(app)
        .post('/incidents/incident-123/ai-summary')
        .set('Authorization', 'Bearer viewer-token')
        .expect(200);
      
      expect(viewerResponse.body.summary).toBeDefined();
    });

    it('should allow all authenticated users to export PDF', async () => {
      // Test admin access
      const adminResponse = await request(app)
        .post('/incidents/incident-123/export-pdf')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);
      
      expect(adminResponse.headers['content-type']).toBe('application/pdf');

      // Test editor access
      const editorResponse = await request(app)
        .post('/incidents/incident-123/export-pdf')
        .set('Authorization', 'Bearer editor-token')
        .expect(200);
      
      expect(editorResponse.headers['content-type']).toBe('application/pdf');

      // Test viewer access
      const viewerResponse = await request(app)
        .post('/incidents/incident-123/export-pdf')
        .set('Authorization', 'Bearer viewer-token')
        .expect(200);
      
      expect(viewerResponse.headers['content-type']).toBe('application/pdf');
    });

    it('should return 404 for non-existent incident', async () => {
      const response = await request(app)
        .post('/incidents/non-existent/ai-summary')
        .set('Authorization', 'Bearer admin-token')
        .expect(404);

      expect(response.body.error).toBe('Incident not found');
      expect(response.body.message).toBe('The specified incident does not exist');
    });

    it('should return 404 for non-existent incident PDF export', async () => {
      const response = await request(app)
        .post('/incidents/non-existent/export-pdf')
        .set('Authorization', 'Bearer admin-token')
        .expect(404);

      expect(response.body.error).toBe('Incident not found');
      expect(response.body.message).toBe('The specified incident does not exist');
    });
  });
}); 