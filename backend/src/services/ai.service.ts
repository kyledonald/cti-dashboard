import axios from 'axios';

// In-memory rate limiting for AI summary requests
const aiSummaryRequests = new Map<string, { count: number; resetTime: number }>();

export interface AISummaryRequest {
  incident: any;
  users: any[];
  threatActors: any[];
}

export interface AISummaryResponse {
  summary: string;
}

export class AIService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.error('GEMINI_API_KEY not configured');
    }
  }

  // Rate limiting check
  checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 5; // 5 requests per 15 minutes

    const userRequests = aiSummaryRequests.get(userId);
    
    if (!userRequests || now > userRequests.resetTime) {
      // First request or window expired
      aiSummaryRequests.set(userId, { count: 1, resetTime: now + windowMs });
      console.log(`Rate limit: New window for user ${userId}`);
      return { allowed: true };
    }

    if (userRequests.count >= maxRequests) {
      const retryAfter = Math.ceil((userRequests.resetTime - now) / 1000);
      console.log(`Rate limit: User ${userId} exceeded limit (${userRequests.count}/${maxRequests})`);
      return { allowed: false, retryAfter };
    }

    userRequests.count++;
    console.log(`Rate limit: User ${userId} request ${userRequests.count}/${maxRequests}`);
    return { allowed: true };
  }

  // Generate AI summary for incidents
  async generateIncidentSummary(request: AISummaryRequest): Promise<string> {
    console.log('AI Summary Request received:', {
      hasIncident: !!request.incident,
      hasUsers: !!request.users,
      hasThreatActors: !!request.threatActors,
      incidentTitle: request.incident?.title
    });

    // Validate required data
    if (!request.incident) {
      throw new Error('Incident data is required');
    }
    
    // Check if API key is available
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured on server');
    }
    
    // Get assigned user name
    const assignedUser = request.users?.find((u: any) => u.userId === request.incident.assignedToUserId);
    const assignedUserName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Unassigned';
    
    // Get threat actor names
    const incidentThreatActors = request.threatActors?.filter((ta: any) => 
      request.incident.threatActorIds?.includes(ta.threatActorId)
    ) || [];
    const threatActorNames = incidentThreatActors.map((ta: any) => ta.name).join(', ') || 'None identified';
    
    // Create the prompt for AI analysis
    const prompt = `Analyze this cybersecurity incident and provide a structured threat intelligence summary for small and medium enterprises (SMEs).

INCIDENT DETAILS:
- Title: ${request.incident.title}
- Description: ${request.incident.description}
- Status: ${request.incident.status}
- Priority: ${request.incident.priority}
- Type: ${request.incident.type || 'Not specified'}
- CVEs: ${request.incident.cveIds?.join(', ') || 'None'}
- Threat Actors: ${threatActorNames}
- Assigned To: ${assignedUserName}

IMPORTANT: You MUST format your response with exactly these 3 sections using the exact headers shown below. Do not use any other format. Do not use any asterisks or other symbols in your response.

EXECUTIVE SUMMARY
Provide a concise overview of the threat and its significance.

BUSINESS IMPACT
Explain the potential impact on business operations, data, and systems.

DETECTION & RESPONSE
Describe how to detect this type of threat and immediate response actions. Provide specific, actionable recommendations for prevention and mitigation.

Format your response exactly as shown above with these 3 sections. Keep it short and concise. Use professional language suitable for business stakeholders who may not have deep technical knowledge.`;

    console.log('Calling Gemini API with prompt length:', prompt.length);

    // Call Gemini API with exponential backoff retry for 503 errors
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay
    let geminiResponse: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Gemini API attempt ${attempt + 1}/${maxRetries + 1}`);
        
        geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000
          }
        );
        
        console.log('✅ Gemini API call successful');
        break; // Success, exit retry loop
        
      } catch (error: any) {
        console.error(`❌ Gemini API attempt ${attempt + 1} failed:`, error.response?.status, error.message);
        
        // If it's a 503 error and we haven't exhausted retries, wait and retry
        if (error.response?.status === 503 && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff: 1s, 2s, 4s
          console.log(`⏳ Gemini API overloaded (503). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For other errors or final attempt, re-throw the error
        throw error;
      }
    }

    console.log('Gemini API response status:', geminiResponse.status);
    console.log('Gemini API response data keys:', Object.keys(geminiResponse.data || {}));

    if (!(geminiResponse.data as any)?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini API response structure:', geminiResponse.data);
      throw new Error('Invalid response from Gemini API');
    }

    const summary = (geminiResponse.data as any).candidates[0].content.parts[0].text;
    console.log('AI Summary generated successfully, length:', summary.length);
    
    return summary;
  }
}

export const aiService = new AIService(); 