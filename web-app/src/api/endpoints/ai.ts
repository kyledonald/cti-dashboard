import { aiApi } from '../config';
import type { Incident, User, ThreatActor } from '../types';

// AI Summary function with exponential backoff retry for 503 errors
export const generateAISummary = async (incident: Incident, users: User[], threatActors: ThreatActor[]): Promise<string> => {
  const maxRetries = 5;
  const baseDelay = 1000; // 1 second base delay
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {

      
      const response = await aiApi.post('/cves/ai-summary', {
        incident,
        users,
        threatActors
      });
      
      
      return response.data.summary;
      
    } catch (error: any) {
      console.error(`❌ AI Summary attempt ${attempt + 1} failed:`, error.response?.status, error.message);
      
      // If it's a 503 error and we haven't exhausted retries, wait and retry
      if (error.response?.status === 503 && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s, 8s, 16s

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