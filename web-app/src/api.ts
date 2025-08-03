import axios from 'axios';
import { auth } from './config/firebase';
import { getIdToken } from 'firebase/auth';

const API_BASE = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 2500, // 2.5 seconds timeout - balanced for quick response
  headers: {
    'Content-Type': 'application/json',
  },
});

// Special API instance for AI summary with longer timeout
const aiApi = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds timeout for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic for cold starts
const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 2, delay = 750): Promise<any> => {
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
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Same interceptor for AI API
aiApi.interceptors.request.use(
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
    
    return config;
  },
  (error) => {
    console.error('AI API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors that are not timeouts
    if (!(error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.includes('timeout')))) {
      console.error('API Response Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Same interceptor for AI API
aiApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only log errors that are not timeouts
    if (!(error.code === 'ECONNABORTED' || (typeof error.message === 'string' && error.message.includes('timeout')))) {
      console.error('AI API Response Error:', error.response?.data || error.message);
    }
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

export interface ResolutionComment {
  commentId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: any;
}

export interface Incident {
  incidentId: string;
  title: string;
  description: string;
  status: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  organizationId: string;
  dateCreated: any;
  lastUpdatedAt: any;
  reportedByUserId: string;
  reportedByUserName: string;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  resolutionNotes?: string | null;
  resolutionComments?: ResolutionComment[];
  dateResolved?: any | null;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  status: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  reportedByUserId: string;
  reportedByUserName: string;
  organizationId: string;
}

export interface ThreatActor {
  threatActorId: string;
  name: string;
  description?: string;
  nationality?: string;
  motivation?: string;
  capabilities?: string[];
  aliases?: string[];
  organizationId?: string; // Added for organization-specific threat actors
  // Enhanced fields for modern threat intelligence
  country?: string;
  firstSeen?: string;
  lastSeen?: string;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  attackPatterns?: string[];
  tools?: string[];
  malwareFamilies?: string[];
  isActive?: boolean;
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
  organizationId?: string; // Added for organization-specific threat actors
  // Enhanced fields for modern threat intelligence
  country?: string;
  firstSeen?: string;
  lastSeen?: string;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  attackPatterns?: string[];
  tools?: string[];
  malwareFamilies?: string[];
  isActive?: boolean;
}

export interface UpdateThreatActorDTO {
  name?: string;
  description?: string;
  nationality?: string;
  motivation?: string;
  capabilities?: string[];
  aliases?: string[];
  // Enhanced fields for modern threat intelligence
  country?: string;
  firstSeen?: string;
  lastSeen?: string;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  attackPatterns?: string[];
  tools?: string[];
  malwareFamilies?: string[];
  isActive?: boolean;
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

// Add new interface for Shodan CVE API response
export interface ShodanCVE {
  cve: string;
  summary: string;
  cvss?: number;
  cvss3?: {
    score: number;
    vector: string;
  };
  kev?: boolean; // Known Exploited Vulnerability
  published: string;
  modified: string;
  references: string[];
  // Extract vendor info from summary when possible
  extractedVendors?: string[];
}





// Organizations API
export const organizationsApi = {
  getAll: async (): Promise<Organization[]> => {
    try {
      const response = await api.get('/organizations');
      console.log('Organizations API response:', response.data);
      
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

// Define UpdateIncidentDTO interface
export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  resolutionNotes?: string | null;
  resolutionComments?: ResolutionComment[];
  status?: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  dateResolved?: any | null;
}

export interface AddCommentDTO {
  incidentId: string;
  content: string;
  userId: string;
  userName: string;
}

// Incidents API
export const incidentsApi = {
  getAll: async (): Promise<Incident[]> => {
    try {
      const response = await api.get('/incidents');
      console.log('Incidents API response:', response.data);
      
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

// Legacy functions for backward compatibility
export const fetchOrganizations = organizationsApi.getAll;
export const fetchUsers = usersApi.getAll;
export const fetchIncidents = incidentsApi.getAll;
export const fetchThreatActors = threatActorsApi.getAll;
export const fetchLatestCVEs = cvesApi.getShodanLatest;

// AI Summary function with exponential backoff retry for 503 errors
export const generateAISummary = async (incident: Incident, users: User[], threatActors: ThreatActor[]): Promise<string> => {
  const maxRetries = 5;
  const baseDelay = 1000; // 1 second base delay
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 AI Summary attempt ${attempt + 1}/${maxRetries + 1}`);
      
      const response = await aiApi.post('/cves/ai-summary', {
        incident,
        users,
        threatActors
      });
      
      console.log('✅ AI Summary generated successfully');
      return response.data.summary;
      
    } catch (error: any) {
      console.error(`❌ AI Summary attempt ${attempt + 1} failed:`, error.response?.status, error.message);
      
      // If it's a 503 error and we haven't exhausted retries, wait and retry
      if (error.response?.status === 503 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s, 8s, 16s
        console.log(`⏳ Gemini API overloaded (503). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // For other errors or final attempt, throw the error
      if (error.response?.status === 503) {
        throw new Error('AI service temporarily unavailable. Please try again later.');
      } else if (error.response?.status === 429) {
        throw new Error('You\'re going too fast.. save some tokens for the rest of us! You can generate a summary again in 15 minutes.');
      } else {
        throw new Error('Failed to generate AI summary. Please try again.');
      }
    }
  }
  
  // This should never be reached, but just in case
  throw new Error('Failed to generate AI summary after multiple attempts.');
};