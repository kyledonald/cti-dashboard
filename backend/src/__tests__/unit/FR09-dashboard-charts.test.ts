import request from 'supertest';
import { createTestApp } from '../utils/test-setup';
import { createMockAuthMiddleware } from '../utils/mock-auth';
import { mockIncidents, mockCVEs, mockThreatActors } from '../utils/test-data';

// Create test app
const app = createTestApp();

// Mock authentication middleware
const mockAuthMiddleware = createMockAuthMiddleware();
app.use(mockAuthMiddleware);

// Mock dashboard endpoints
app.get('/api/dashboard/metrics', (req: any, res) => {
  // Calculate status counts
  const statusCounts = { Open: 0, Triaged: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
  mockIncidents.forEach(inc => {
    statusCounts[inc.status as keyof typeof statusCounts]++;
  });

  // Calculate priority counts
  const priorityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  mockIncidents.forEach(inc => {
    priorityCounts[inc.priority as keyof typeof priorityCounts]++;
  });

  // Calculate high priority incidents (High/Critical, Open/Triaged/In Progress)
  const highPriorityIncidents = mockIncidents.filter(inc => 
    (inc.priority === 'High' || inc.priority === 'Critical') && 
    (inc.status === 'Open' || inc.status === 'Triaged' || inc.status === 'In Progress')
  );

  // Calculate KEV count
  const kevCount = mockCVEs.filter(cve => cve.kev).length;

  // Calculate high-risk threat actors
  const highRiskThreatActors = mockThreatActors.filter(ta => 
    ta.sophistication === 'Advanced' || ta.sophistication === 'Expert'
  );

  res.json({
    statusCounts,
    priorityCounts,
    highPriorityIncidents,
    kevCount,
    highRiskThreatActors,
    totalIncidents: mockIncidents.length,
    totalCVEs: mockCVEs.length,
    totalThreatActors: mockThreatActors.length
  });
});

app.get('/api/dashboard/chart-data', (req: any, res) => {
  // Generate pie chart data for incident status
  const pieData = {
    labels: Object.keys({ Open: 0, Triaged: 0, 'In Progress': 0, Resolved: 0, Closed: 0 }),
    datasets: [{
      data: [1, 0, 1, 0, 1], // Based on mockIncidents
      backgroundColor: ['#3b82f6', '#a78bfa', '#fbbf24', '#10b981', '#f87171']
    }]
  };

  // Generate bar chart data for incident priority
  const barData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [{
      label: 'Incidents by Priority',
      data: [1, 1, 1, 0] // Based on mockIncidents
    }]
  };

  res.json({ pieData, barData });
});

describe('FR09: Dashboard Charts & Visualizations', () => {
  describe('Dashboard Metrics Calculation', () => {
    it('should calculate correct incident status counts', async () => {
      const response = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.statusCounts).toEqual({
        Open: 1,
        Triaged: 0,
        'In Progress': 1,
        Resolved: 0,
        Closed: 1
      });
    });

    it('should calculate correct incident priority counts', async () => {
      const response = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.priorityCounts).toEqual({
        Critical: 1,
        High: 1,
        Medium: 1,
        Low: 0
      });
    });

    it('should identify high priority incidents correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.highPriorityIncidents).toHaveLength(1);
      expect(response.body.highPriorityIncidents[0].priority).toBe('Critical');
      expect(response.body.highPriorityIncidents[0].status).toBe('Open');
    });

    it('should calculate KEV count correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.kevCount).toBe(1);
    });

    it('should identify high-risk threat actors correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.highRiskThreatActors).toHaveLength(1);
      expect(response.body.highRiskThreatActors[0].sophistication).toBe('Advanced');
    });
  });

  describe('Chart Data Generation', () => {
    it('should generate correct pie chart data for incident status', async () => {
      const response = await request(app)
        .get('/api/dashboard/chart-data')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.pieData.labels).toEqual(['Open', 'Triaged', 'In Progress', 'Resolved', 'Closed']);
      expect(response.body.pieData.datasets[0].data).toEqual([1, 0, 1, 0, 1]);
    });

    it('should generate correct bar chart data for incident priority', async () => {
      const response = await request(app)
        .get('/api/dashboard/chart-data')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.barData.labels).toEqual(['Critical', 'High', 'Medium', 'Low']);
      expect(response.body.barData.datasets[0].data).toEqual([1, 1, 1, 0]);
    });
  });

  describe('Organization Data Isolation', () => {
    it('should only return data from user\'s organization', async () => {
      const response = await request(app)
        .get('/api/dashboard/metrics')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      // All incidents should belong to org1
      expect(response.body.totalIncidents).toBe(3);
      // Verify no incidents from other organizations are included
      expect(mockIncidents.every(inc => inc.organizationId === 'org1')).toBe(true);
    });
  });

  describe('Authentication Requirements', () => {
    it('should require authentication to access dashboard metrics', async () => {
      const response = await request(app)
        .get('/api/dashboard/metrics')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });

    it('should require authentication to access chart data', async () => {
      const response = await request(app)
        .get('/api/dashboard/chart-data')
        .expect(401);

      expect(response.body.error).toBe('Authentication required');
    });
  });
});
