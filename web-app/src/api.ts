import axios from 'axios';
import { auth } from './config/firebase';
import { getIdToken } from 'firebase/auth';

const API_BASE = import.meta.env.DEV
  ? '/api'
  : 'https://cti-dashboard-gateway-688kl12y.nw.gateway.dev';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 1500,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic for cold starts
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 1, delay = 500): Promise<any> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await requestFn();
      return response;
    } catch (error: any) {
      if (attempt === maxRetries) {
        console.error('API Request Error:', error);
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Request interceptor for debugging and auth
api.interceptors.request.use(
  async (config) => {
    // Add auth token if user is logged in
    if (auth.currentUser) {
      try {
        const token = await getIdToken(auth.currentUser);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
    }
    
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface Organization {
  organizationId: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  nationality?: string | null;
  industry?: string | null;
  usedSoftware?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  nationality?: string;
  industry?: string;
  usedSoftware?: string[];
}

export interface User {
  userId: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: 'admin' | 'viewer' | 'editor' | 'unassigned';
  organizationId?: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
  lastLoginAt?: any;
}

export interface CreateUserDTO {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role?: 'admin' | 'editor' | 'viewer' | 'unassigned';
  organizationId?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  role?: 'admin' | 'editor' | 'viewer' | 'unassigned';
  organizationId?: string;
  status?: 'active' | 'inactive';
}

export interface Incident {
  incidentId: string;
  title: string;
  description?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  organizationId?: string;
  assignedTo?: string;
  dateCreated: any;
  lastUpdatedAt: any;
  reportedByUserId?: string;
  reportedByUserName?: string;
  assignedToUserId?: string;
  assignedToUserName?: string;
  type?: string;
  cveIds?: string[];
  threatActorIds?: string[];
  resolutionNotes?: string;
  dateResolved?: any;
}

export interface CreateIncidentDTO {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  organizationId?: string;
  assignedTo?: string;
}

export interface ThreatActor {
  threatActorId: string;
  name: string;
  description?: string;
  nationality?: string;
  motivation?: string;
  capabilities?: string[];
  aliases?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface CreateThreatActorDTO {
  name: string;
  description?: string;
  nationality?: string;
  motivation?: string;
  capabilities?: string[];
  aliases?: string[];
}

export interface CVE {
  cveId: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  cvssScore?: number;
  publishedDate: any;
  lastModifiedDate: any;
  affectedSoftware?: string[];
}

// Helper function to extract data from API responses
const extractData = <T>(response: any, key: string): T[] => {
  if (Array.isArray(response)) {
    return response;
  }
  if (response && response[key] && Array.isArray(response[key])) {
    return response[key];
  }
  return [];
};

// Organizations API
export const organizationsApi = {
  getAll: () => retryRequest(() => api.get('/organizations')).then(res => extractData<Organization>(res.data, 'organizations')),
  getById: (id: string) => retryRequest(() => api.get(`/organizations/${id}`)).then(res => res.data),
  create: (data: CreateOrganizationDTO) => retryRequest(() => api.post('/organizations', data)).then(res => res.data),
  update: (id: string, data: Partial<CreateOrganizationDTO>) => retryRequest(() => api.put(`/organizations/${id}`, data)).then(res => res.data),
  delete: (id: string) => retryRequest(() => api.delete(`/organizations/${id}`)).then(res => res.data),
};

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
};

// Incidents API
export const incidentsApi = {
  getAll: () => retryRequest(() => api.get('/incidents')).then(res => extractData<Incident>(res.data, 'incidents')),
  getById: (id: string) => retryRequest(() => api.get(`/incidents/${id}`)).then(res => res.data),
  create: (data: CreateIncidentDTO) => retryRequest(() => api.post('/incidents', data)).then(res => res.data),
  update: (id: string, data: Partial<CreateIncidentDTO>) => retryRequest(() => api.put(`/incidents/${id}`, data)).then(res => res.data),
  delete: (id: string) => retryRequest(() => api.delete(`/incidents/${id}`)).then(res => res.data),
};

// Threat Actors API
export const threatActorsApi = {
  getAll: () => retryRequest(() => api.get('/threat-actors')).then(res => extractData<ThreatActor>(res.data, 'threatActors')),
  getById: (id: string) => retryRequest(() => api.get(`/threat-actors/${id}`)).then(res => res.data),
  create: (data: CreateThreatActorDTO) => retryRequest(() => api.post('/threat-actors', data)).then(res => res.data),
  update: (id: string, data: Partial<CreateThreatActorDTO>) => retryRequest(() => api.put(`/threat-actors/${id}`, data)).then(res => res.data),
  delete: (id: string) => retryRequest(() => api.delete(`/threat-actors/${id}`)).then(res => res.data),
};

// CVEs API
export const cvesApi = {
  getAll: () => retryRequest(() => api.get('/cves')).then(res => extractData<CVE>(res.data, 'cves')),
  getLatest: (limit = 10) => retryRequest(() => api.get(`/cves/latest?limit=${limit}`)).then(res => extractData<CVE>(res.data, 'cves')),
  getById: (id: string) => retryRequest(() => api.get(`/cves/${id}`)).then(res => res.data),
};

// Legacy functions for backward compatibility
export const fetchOrganizations = organizationsApi.getAll;
export const fetchUsers = usersApi.getAll;
export const fetchIncidents = incidentsApi.getAll;
export const fetchThreatActors = threatActorsApi.getAll;
export const fetchLatestCVEs = cvesApi.getLatest;