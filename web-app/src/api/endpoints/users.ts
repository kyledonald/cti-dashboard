import { api } from '../config';
import type { User, CreateUserDTO, UpdateUserDTO } from '../types';

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    // Ensure response is an array
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    console.warn('usersApi.getAll: Unexpected response format:', response.data);
    return [];
  },

  getById: async (userId: string): Promise<User> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  getByEmail: async (email: string): Promise<User> => {
    const response = await api.get(`/users/email/${email}`);
    return response.data.user;
  },

  create: async (userData: CreateUserDTO): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (userId: string, updateData: UpdateUserDTO): Promise<User> => {
    const response = await api.put(`/users/${userId}`, updateData);
    return response.data;
  },

  delete: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  leaveOrganization: async (userId: string): Promise<User> => {
    const response = await api.post(`/users/${userId}/leave-organization`);
    return response.data.user;
  },
}; 