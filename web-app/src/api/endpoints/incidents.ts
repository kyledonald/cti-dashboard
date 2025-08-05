import { api, retryRequest } from '../config';
import type { Incident, CreateIncidentDTO, UpdateIncidentDTO, AddCommentDTO } from '../types';

// Incidents API
export const incidentsApi = {
  getAll: async (): Promise<Incident[]> => {
    try {
      const response = await api.get('/incidents');
  
      
      // Ensure response is an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.incidents)) {
        return response.data.incidents;
      }
      console.warn('incidentsApi.getAll: Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  },
  
  getById: (id: string) => retryRequest(() => api.get(`/incidents/${id}`)).then(res => res.data),
  
  create: (data: CreateIncidentDTO) => retryRequest(() => api.post('/incidents', data)).then(res => res.data),
  
  update: (id: string, data: UpdateIncidentDTO) => retryRequest(() => api.put(`/incidents/${id}`, data)).then(res => res.data),
  
  delete: (id: string) => retryRequest(() => api.delete(`/incidents/${id}`)).then(res => res.data),
  
  addComment: (data: AddCommentDTO) => retryRequest(() => api.post(`/incidents/${data.incidentId}/comments`, data)).then(res => res.data),
  
  deleteComment: (incidentId: string, commentId: string, userId: string, userRole: string) => 
    retryRequest(() => api.delete(`/incidents/${incidentId}/comments/${commentId}`, { 
      data: { userId, userRole } 
    })).then(res => res.data),
}; 