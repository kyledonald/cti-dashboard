import { api, retryRequest } from '../config';
import type { ShodanCVE } from '../types';

// CVEs API
export const cvesApi = {
  getAll: () => retryRequest(() => api.get('/cves')).then(res => res.data),
  
  getById: (id: string) => retryRequest(() => api.get(`/cves/${id}`)).then(res => res.data),
  
  // Get latest CVEs from backend (no CORS issues)
  getShodanLatest: async (minCvssScore = 8.0, limit = 200): Promise<ShodanCVE[]> => {
    try {
      const response = await api.get(`/cves/shodan/latest?limit=${limit}&minCvssScore=${minCvssScore}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching CVE data from backend:', error);
      throw new Error('Failed to fetch CVE data from server');
    }
  }
}; 