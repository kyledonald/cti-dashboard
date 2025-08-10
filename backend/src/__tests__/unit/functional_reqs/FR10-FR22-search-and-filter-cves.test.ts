import request from 'supertest';
import { createTestApp } from '../../utils/test-setup';
import { createMockAuthMiddleware } from '../../utils/mock-auth';
import { mockCVEs } from '../../utils/test-data';

const app = createTestApp();

const mockAuthMiddleware = createMockAuthMiddleware();
app.use(mockAuthMiddleware);

app.get('/api/cves/search', (req: any, res) => {
  const { software, limit = 10, minSeverity, maxSeverity, sortBy = 'cvss', sortOrder = 'desc' } = req.query;
  
  if (software === undefined) {
    return res.status(400).json({ error: 'Software parameter is required' });
  }

  if (software === '') {
    return res.status(200).json({
      cves: [],
      total: 0,
      searchTerm: ''
    });
  }

  // Filter CVEs by software name in summary (text matching only)
  let filteredCVEs = mockCVEs.filter(cve => {
    const searchTerm = software.toLowerCase();
    return cve.summary.toLowerCase().includes(searchTerm);
  });

  // Apply severity filtering
  if (minSeverity !== undefined) {
    const minScore = parseFloat(minSeverity);
    if (!isNaN(minScore)) {
      filteredCVEs = filteredCVEs.filter(cve => cve.cvss >= minScore);
    }
  }

  if (maxSeverity !== undefined) {
    const maxScore = parseFloat(maxSeverity);
    if (!isNaN(maxScore)) {
      filteredCVEs = filteredCVEs.filter(cve => cve.cvss <= maxScore);
    }
  }

  if (sortBy === 'cvss') {
    filteredCVEs.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.cvss - a.cvss; // Highest to lowest
      } else {
        return a.cvss - b.cvss; // Lowest to highest
      }
    });
  }

  const limitedResults = filteredCVEs.slice(0, Number(limit));
  
  res.json({
    cves: limitedResults,
    total: filteredCVEs.length,
    searchTerm: software,
    filters: {
      minSeverity: minSeverity ? parseFloat(minSeverity) : null,
      maxSeverity: maxSeverity ? parseFloat(maxSeverity) : null,
      sortBy,
      sortOrder
    }
  });
});

describe('FR10: Search CVEs by Software', () => {
  describe('Search functionality', () => {
    test('should search CVEs by software name in summary', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'Microsoft' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.searchTerm).toBe('Microsoft');
      
      response.body.cves.forEach((cve: any) => {
        expect(cve.summary.toLowerCase()).toContain('microsoft');
      });
    });

    test('should return empty results for non-existent software', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'NonExistentSoftware123' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toEqual([]);
      expect(response.body.total).toBe(0);
    });

    test('should limit search results', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'Microsoft', limit: 2 })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves.length).toBeLessThanOrEqual(2);
      expect(response.body.total).toBeGreaterThanOrEqual(response.body.cves.length);
    });

    test('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'microsoft' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  describe('Input validation', () => {
    test('should require software parameter', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .set('Authorization', 'Bearer admin-token')
        .expect(400);

      expect(response.body.error).toBe('Software parameter is required');
    });

    test('should handle empty software parameter', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: '' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe('FR22: Severity Filtering and Sorting', () => {
    test('should filter CVEs by minimum severity score', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'Microsoft', minSeverity: '8.0' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
      
      response.body.cves.forEach((cve: any) => {
        expect(cve.cvss).toBeGreaterThanOrEqual(8.0);
      });
    });

    test('should filter CVEs by maximum severity score', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'Microsoft', maxSeverity: '7.0' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      
      response.body.cves.forEach((cve: any) => {
        expect(cve.cvss).toBeLessThanOrEqual(7.0);
      });
    });

    test('should filter CVEs by severity range', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'Microsoft', minSeverity: '7.0', maxSeverity: '9.0' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      
      response.body.cves.forEach((cve: any) => {
        expect(cve.cvss).toBeGreaterThanOrEqual(7.0);
        expect(cve.cvss).toBeLessThanOrEqual(9.0);
      });
    });

    test('should sort CVEs by severity from highest to lowest by default', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'Microsoft' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      expect(response.body.cves.length).toBeGreaterThan(1);
      
      for (let i = 0; i < response.body.cves.length - 1; i++) {
        expect(response.body.cves[i].cvss).toBeGreaterThanOrEqual(response.body.cves[i + 1].cvss);
      }
    });

    test('should sort CVEs by severity from lowest to highest when specified', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ software: 'Microsoft', sortOrder: 'asc' })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      expect(response.body.cves.length).toBeGreaterThan(1);
      
      for (let i = 0; i < response.body.cves.length - 1; i++) {
        expect(response.body.cves[i].cvss).toBeLessThanOrEqual(response.body.cves[i + 1].cvss);
      }
    });

    test('should combine search, filtering, and sorting correctly', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ 
          software: 'Microsoft', 
          minSeverity: '9.0', 
          sortOrder: 'desc',
          limit: 5
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
      
      response.body.cves.forEach((cve: any) => {
        expect(cve.cvss).toBeGreaterThanOrEqual(9.0);
        expect(cve.summary.toLowerCase()).toContain('microsoft');
      });
      
      for (let i = 0; i < response.body.cves.length - 1; i++) {
        expect(response.body.cves[i].cvss).toBeGreaterThanOrEqual(response.body.cves[i + 1].cvss);
      }
    });

    test('should handle invalid severity values gracefully', async () => {
      const response = await request(app)
        .get('/api/cves/search')
        .query({ 
          software: 'Microsoft', 
          minSeverity: 'invalid', 
          maxSeverity: 'also-invalid' 
        })
        .set('Authorization', 'Bearer admin-token')
        .expect(200);

      expect(response.body.cves).toBeDefined();
      expect(response.body.total).toBeGreaterThan(0);
    });
  });
}); 
