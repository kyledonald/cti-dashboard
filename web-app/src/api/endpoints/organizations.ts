import { api, retryRequest } from '../config';
import type { Organization, CreateOrganizationDTO } from '../types';

// Organizations API
export const organizationsApi = {
  getAll: async (): Promise<Organization[]> => {
    try {
      const response = await api.get('/organizations');

      
      // Ensure response is an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.organizations)) {
        return response.data.organizations;
      }
      console.warn('organizationsApi.getAll: Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return [];
    }
  },
  
  getById: (id: string) => retryRequest(() => api.get(`/organizations/${id}`)).then(res => res.data),
  
  create: (data: CreateOrganizationDTO) => retryRequest(() => api.post('/organizations', data)).then(res => res.data),
  
  update: (id: string, data: Partial<CreateOrganizationDTO>) => retryRequest(() => api.put(`/organizations/${id}`, data)).then(res => res.data),
  
  delete: (id: string) => retryRequest(() => api.delete(`/organizations/${id}`)).then(res => res.data),
}; 