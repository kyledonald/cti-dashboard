import axios from 'axios';
import { auth } from '../config/firebase';
import { getIdToken } from 'firebase/auth';

const API_BASE = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_BASE_URL || 'https://europe-west2-cti-dashboard-459422.cloudfunctions.net/api';

// Main API instance
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 2500, // 2.5 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Special API instance for AI summary with longer timeout
export const aiApi = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds timeout for AI generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Retry logic for serverless cold starts
export const retryRequest = async (requestFn: () => Promise<any>, maxRetries = 2, delay = 750): Promise<any> => {
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
