import axios from 'axios';
import { auth } from './config/firebase';
import { getIdToken } from 'firebase/auth';

const API_BASE = import.meta.env.DEV
  ? '/api'
  : 'https://europe-west2-cti-dashboard-459422.cloudfunctions.net/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 2500, // 2.5 seconds timeout - balanced for quick response
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

// Helper function to extract vendor names from CVE summary
const extractVendorsFromSummary = (summary: string): string[] => {
  const vendors: string[] = [];
  const commonVendors = [
    'Microsoft', 'Apple', 'Google', 'Adobe', 'Oracle', 'IBM', 'SAP', 'Cisco', 'VMware',
    'Dell', 'HP', 'Intel', 'AMD', 'NVIDIA', 'Qualcomm', 'Samsung', 'LG', 'Sony',
    'Amazon', 'Facebook', 'Meta', 'Twitter', 'LinkedIn', 'Zoom', 'Slack', 'Dropbox',
    'WordPress', 'Joomla', 'Drupal', 'Magento', 'Shopify', 'WooCommerce',
    'Apache', 'Nginx', 'IIS', 'Tomcat', 'Jenkins', 'Docker', 'Kubernetes',
    'Chrome', 'Firefox', 'Safari', 'Edge', 'Internet Explorer',
    'Windows', 'Linux', 'macOS', 'iOS', 'Android', 'Ubuntu', 'CentOS', 'RedHat',
    'Tenda', 'D-Link', 'Netgear', 'Linksys', 'TP-Link', 'ASUS', 'Huawei'
  ];
  
  commonVendors.forEach(vendor => {
    const regex = new RegExp(`\\b${vendor}\\b`, 'gi');
    if (regex.test(summary)) {
      vendors.push(vendor);
    }
  });
  
  return [...new Set(vendors)]; // Remove duplicates
};

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
  getAll: () => retryRequest(() => api.get('/incidents')).then(res => extractData<Incident>(res.data, 'incidents')),
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
  getAll: () => retryRequest(() => api.get('/threat-actors')).then(res => extractData<ThreatActor>(res.data, 'threatActors')),
  getById: (id: string) => retryRequest(() => api.get(`/threat-actors/${id}`)).then(res => res.data),
  create: (data: CreateThreatActorDTO) => retryRequest(() => api.post('/threat-actors', data)).then(res => res.data),
  update: (id: string, data: Partial<CreateThreatActorDTO>) => retryRequest(() => api.put(`/threat-actors/${id}`, data)).then(res => res.data),
  delete: (id: string) => retryRequest(() => api.delete(`/threat-actors/${id}`)).then(res => res.data),
};

// CVEs API
export const cvesApi = {
  getAll: () => retryRequest(() => api.get('/cves')).then(res => res.data),
  getById: (id: string) => retryRequest(() => api.get(`/cves/${id}`)).then(res => res.data),
  
  // New function to fetch from Shodan CVE API directly
  getShodanLatest: async (minCvssScore = 8.0, limit = 200): Promise<ShodanCVE[]> => {
    // Try multiple proxy approaches in order of reliability
    const proxies = [
      'https://thingproxy.freeboard.io/fetch/',
      'https://api.allorigins.win/raw?url='
    ];
    
    for (const corsProxy of proxies) {
      try {
        let url: string;
                 if (corsProxy.includes('allorigins')) {
           url = `${corsProxy}${encodeURIComponent(`https://cvedb.shodan.io/cves?latest&limit=${Math.min(limit * 2, 200)}`)}`;
         } else {
           url = `${corsProxy}https://cvedb.shodan.io/cves?latest&limit=${Math.min(limit * 2, 200)}`;
         }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.warn(`Proxy ${corsProxy} failed with status: ${response.status}`);
          continue;
        }

        const data = await response.json();
        let cvesData: any[];

        // Handle Shodan API response format
        if (data.cves && Array.isArray(data.cves)) {
          cvesData = data.cves;
        } else if (Array.isArray(data)) {
          cvesData = data;
        } else {
          console.warn(`Unexpected response format from proxy ${corsProxy}`);
          continue;
        }

        // Map to our interface
        const mappedCves: ShodanCVE[] = cvesData.map((cveItem: any) => ({
          cve: cveItem.cve_id || cveItem.cve,
          summary: cveItem.summary || '',
          cvss: cveItem.cvss || undefined,
          cvss3: cveItem.cvss_v3 ? {
            score: cveItem.cvss_v3,
            vector: ''
          } : undefined,
          kev: cveItem.kev || false,
          published: cveItem.published_time || new Date().toISOString(),
          modified: cveItem.modified_time || cveItem.published_time || new Date().toISOString(),
          references: cveItem.references || [],
          extractedVendors: extractVendorsFromSummary(cveItem.summary || '')
        }));

        // Filter by CVSS score
        const filteredCves = mappedCves.filter(cve => {
          const score = cve.cvss3?.score || cve.cvss || 0;
          return score >= minCvssScore;
        });

        return filteredCves.slice(0, limit);

      } catch (error) {
        console.warn(`Proxy ${corsProxy} failed:`, error);
        continue;
      }
    }
    
         // If all proxies fail, throw error
     throw new Error('All CORS proxies failed. Unable to fetch CVE data.');
   }
};

// Legacy functions for backward compatibility
export const fetchOrganizations = organizationsApi.getAll;
export const fetchUsers = usersApi.getAll;
export const fetchIncidents = incidentsApi.getAll;
export const fetchThreatActors = threatActorsApi.getAll;
export const fetchLatestCVEs = cvesApi.getShodanLatest;

// AI Summary function for real-time analysis
export const generateAISummary = async (incident: Incident, users: User[], threatActors: ThreatActor[]): Promise<string> => {
  try {
    // Check if API key is available
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found. Please check your .env file.');
    }
    
    // Get assigned user name
    const assignedUser = users.find(u => u.userId === incident.assignedToUserId);
    const assignedUserName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Unassigned';
    
    // Get threat actor names
    const incidentThreatActors = threatActors.filter(ta => incident.threatActorIds?.includes(ta.threatActorId));
    const threatActorNames = incidentThreatActors.map(ta => ta.name).join(', ') || 'None identified';
    
    // Create the prompt for AI analysis
    const prompt = `Analyze this cybersecurity incident and provide a concise, business-friendly threat intelligence summary for small and medium enterprises (SMEs).

INCIDENT DETAILS:
- Title: ${incident.title}
- Description: ${incident.description}
- Status: ${incident.status}
- Priority: ${incident.priority}
- Type: ${incident.type || 'Not specified'}
- CVEs: ${incident.cveIds?.join(', ') || 'None'}
- Threat Actors: ${threatActorNames}
- Assigned To: ${assignedUserName}
- Date Created: ${new Date(incident.dateCreated).toLocaleDateString()}
- Resolution Notes: ${incident.resolutionNotes || 'None'}

Please provide a structured analysis in plain text (no markdown formatting) with these sections:

1. THREAT ASSESSMENT: Brief risk evaluation in simple terms
2. KEY INDICATORS: Important technical details explained simply
3. WHAT DOES THIS MEAN FOR ME?: Business impact and implications
4. IMMEDIATE ACTIONS: What to do right now
5. WHAT CAN I DO TO PROTECT MYSELF FROM VULNERABILITIES LIKE THIS IN THE FUTURE?: Long-term protection strategies

Keep the response concise (max 400 words) and focus on actionable intelligence for business owners and managers. Use simple, non-technical language where possible.`;

    // Call Google Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    throw new Error('Failed to generate AI summary. Please try again.');
  }
};