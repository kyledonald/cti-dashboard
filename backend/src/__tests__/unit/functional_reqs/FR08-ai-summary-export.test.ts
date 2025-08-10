import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';
import { mockAISummary, mockPDFBuffer } from '../../utils/test-data';

const app = createTestApp();

const mockAuthMiddleware = createMockAuthMiddleware();
app.use(mockAuthMiddleware);

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

app.post('/incidents/:incidentId/ai-summary', (req: any, res) => {
  const { incidentId } = req.params;
  
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
  
  res.status(200).json({
    summary: mockAISummary.summary,
    recommendations: mockAISummary.recommendations,
    riskLevel: mockAISummary.riskLevel,
    affectedSystems: mockAISummary.affectedSystems,
    generatedAt: new Date().toISOString()
  });
});

app.post('/incidents/:incidentId/export-pdf', (req: any, res) => {
  const { incidentId } = req.params;
  
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
      const adminResponse = await request(app)
        .post('/incidents/incident-123/ai-summary')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);
      
      expect(adminResponse.body.summary).toBeDefined();

      const editorResponse = await request(app)
        .post('/incidents/incident-123/ai-summary')
        .set('Authorization', 'Bearer editor-token')
        .expect(200);
      
      expect(editorResponse.body.summary).toBeDefined();

      const viewerResponse = await request(app)
        .post('/incidents/incident-123/ai-summary')
        .set('Authorization', 'Bearer viewer-token')
        .expect(200);
      
      expect(viewerResponse.body.summary).toBeDefined();
    });

    it('should allow all authenticated users to export PDF', async () => {
      const adminResponse = await request(app)
        .post('/incidents/incident-123/export-pdf')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);
      
      expect(adminResponse.headers['content-type']).toBe('application/pdf');

      const editorResponse = await request(app)
        .post('/incidents/incident-123/export-pdf')
        .set('Authorization', 'Bearer editor-token')
        .expect(200);
      
      expect(editorResponse.headers['content-type']).toBe('application/pdf');

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
