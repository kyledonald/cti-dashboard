import { api, retryRequest } from '../config';
import type { ThreatActor, CreateThreatActorDTO } from '../types';

// Threat Actors API
export const threatActorsApi = {
  getAll: async (): Promise<ThreatActor[]> => {
    try {
      const response = await api.get('/threat-actors');
      console.log('Threat Actors API response:', response.data);
      
      // Ensure response is an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && Array.isArray(response.data.threatActors)) {
        return response.data.threatActors;
      }
      console.warn('threatActorsApi.getAll: Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching threat actors:', error);
      return [];
    }
  },
  
  getById: (id: string) => retryRequest(() => api.get(`/threat-actors/${id}`)).then(res => res.data),
  
  create: (data: CreateThreatActorDTO) => retryRequest(() => api.post('/threat-actors', data)).then(res => res.data),
  
  update: (id: string, data: Partial<CreateThreatActorDTO>) => retryRequest(() => api.put(`/threat-actors/${id}`, data)).then(res => res.data),
  
  delete: (id: string) => retryRequest(() => api.delete(`/threat-actors/${id}`)).then(res => res.data),
}; 