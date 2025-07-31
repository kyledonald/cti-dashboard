import express from 'express';
import { Firestore } from '@google-cloud/firestore';
import axios from 'axios';

// In-memory rate limiting for AI summary requests
const aiSummaryRequests = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware for AI summary
const rateLimitAI = (req: any, res: any, next: any) => {
  const userId = req.user?.userId || req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // 5 requests per 15 minutes

  const userRequests = aiSummaryRequests.get(userId);
  
  if (!userRequests || now > userRequests.resetTime) {
    // First request or window expired
    aiSummaryRequests.set(userId, { count: 1, resetTime: now + windowMs });
    console.log(`Rate limit: New window for user ${userId}`);
    return next();
  }

  if (userRequests.count >= maxRequests) {
    const retryAfter = Math.ceil((userRequests.resetTime - now) / 1000);
    console.log(`Rate limit: User ${userId} exceeded limit (${userRequests.count}/${maxRequests})`);
    return res.status(429).json({
      error: 'Too many AI summary requests',
      details: 'Please wait 15 minutes before requesting another AI summary',
      retryAfter: retryAfter
    });
  }

  userRequests.count++;
  console.log(`Rate limit: User ${userId} request ${userRequests.count}/${maxRequests}`);
  next();
};

export const cveRouter = (db: Firestore) => {
  const router = express.Router();

  // Generate AI summary for incidents (backend proxy to avoid CORS and API key exposure)
  // This endpoint doesn't require authentication since it's only accessible through the frontend
  // and the frontend already enforces role-based access
  router.post('/ai-summary', rateLimitAI, async (req, res) => {
    try {
      console.log('AI Summary Request received:', {
        hasIncident: !!req.body.incident,
        hasUsers: !!req.body.users,
        hasThreatActors: !!req.body.threatActors,
        incidentTitle: req.body.incident?.title
      });

      const { incident, users, threatActors } = req.body;
      
      // Validate required data
      if (!incident) {
        return res.status(400).json({ error: 'Incident data is required' });
      }
      
      // Check if API key is available
      const apiKey = process.env.GEMINI_API_KEY;
      console.log('Gemini API Key check:', {
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0
      });
      
      if (!apiKey) {
        console.error('GEMINI_API_KEY not configured');
        return res.status(500).json({ error: 'Gemini API key not configured on server' });
      }
      
      // Get assigned user name
      const assignedUser = users?.find((u: any) => u.userId === incident.assignedToUserId);
      const assignedUserName = assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : 'Unassigned';
      
      // Get threat actor names
      const incidentThreatActors = threatActors?.filter((ta: any) => incident.threatActorIds?.includes(ta.threatActorId)) || [];
      const threatActorNames = incidentThreatActors.map((ta: any) => ta.name).join(', ') || 'None identified';
      
      // Create the prompt for AI analysis
      const prompt = `Analyze this cybersecurity incident and provide a structured threat intelligence summary for small and medium enterprises (SMEs).

INCIDENT DETAILS:
- Title: ${incident.title}
- Description: ${incident.description}
- Status: ${incident.status}
- Priority: ${incident.priority}
- Type: ${incident.type || 'Not specified'}
- CVEs: ${incident.cveIds?.join(', ') || 'None'}
- Threat Actors: ${threatActorNames}
- Assigned To: ${assignedUserName}

IMPORTANT: You MUST format your response with exactly these 5 sections using the exact headers shown below. Do not use any other format.

**EXECUTIVE SUMMARY**
Provide a concise overview of the threat and its significance.

**THREAT ANALYSIS**
Analyze the nature of the threat, potential attack vectors, and technical details.

**BUSINESS IMPACT**
Explain the potential impact on business operations, data, and systems.

**DETECTION & RESPONSE**
Describe how to detect this type of threat and immediate response actions.

**WHAT CAN I DO TO PREVENT THIS IN THE FUTURE?**
Provide specific, actionable recommendations for prevention and mitigation.

Format your response exactly as shown above with these 5 sections. Use professional language suitable for business stakeholders.`;

      console.log('Calling Gemini API with prompt length:', prompt.length);

      // Call Gemini API with exponential backoff retry for 503 errors
      const maxRetries = 3;
      const baseDelay = 1000; // 1 second base delay
      let geminiResponse: any;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🤖 Gemini API attempt ${attempt + 1}/${maxRetries + 1}`);
          
          geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
      
      res.json({ summary });

    } catch (error: any) {
      console.error('Error generating AI summary:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      });
      
      if (error.response?.status === 503) {
        res.status(503).json({ 
          error: 'AI service temporarily unavailable. Please try again later.',
          details: 'Gemini API is overloaded'
        });
      } else if (error.response?.status === 400) {
        res.status(400).json({ 
          error: 'Invalid request to AI service',
          details: error.response.data || error.message
        });
      } else if (error.response?.status === 403) {
        res.status(403).json({ 
          error: 'AI service access denied',
          details: 'Check API key configuration'
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to generate AI summary',
          details: error.message 
        });
      }
    }
  });

  // Get latest CVEs from Shodan API (backend proxy to avoid CORS)
  router.get('/shodan/latest', async (req, res) => {
    try {
      const { limit = 50, minCvssScore = 0 } = req.query;
      
      // Fetch from Shodan API directly (no CORS issues from backend)
      const response = await axios.get(`https://cvedb.shodan.io/cves?latest&limit=${Math.min(Number(limit) * 2, 200)}`, {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000
      });

      if (!response.data) {
        return res.status(500).json({ error: 'No data received from Shodan API' });
      }

      let cvesData: any[];

      // Handle Shodan API response format
      if ((response.data as any).cves && Array.isArray((response.data as any).cves)) {
        cvesData = (response.data as any).cves;
      } else if (Array.isArray(response.data)) {
        cvesData = response.data;
      } else {
        return res.status(500).json({ error: 'Unexpected response format from Shodan API' });
      }

      // Map to our interface
      const mappedCves = cvesData.map((cveItem: any) => ({
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
      const filteredCves = mappedCves.filter((cve: any) => {
        const score = cve.cvss3?.score || cve.cvss || 0;
        return score >= Number(minCvssScore);
      });

      res.json(filteredCves.slice(0, Number(limit)));

    } catch (error: any) {
      console.error('Error fetching CVE data:', error.message);
      res.status(500).json({ 
        error: 'Failed to fetch CVE data',
        details: error.message 
      });
    }
  });

  // Helper function to extract vendors from summary
  const extractVendorsFromSummary = (summary: string): string[] => {
    const commonVendors = [
      'Microsoft', 'Adobe', 'Oracle', 'Cisco', 'Apple', 'Google', 'Mozilla',
      'Apache', 'Linux', 'Ubuntu', 'Red Hat', 'Debian', 'SUSE', 'VMware',
      'Dell', 'HP', 'IBM', 'Intel', 'AMD', 'NVIDIA', 'Qualcomm', 'Samsung',
      'Huawei', 'Juniper', 'Fortinet', 'Palo Alto', 'Check Point', 'Symantec',
      'McAfee', 'Trend Micro', 'Kaspersky', 'ESET', 'Bitdefender', 'Avast',
      'AVG', 'Malwarebytes', 'Sophos', 'F-Secure', 'Comodo', 'Avira'
    ];

    const foundVendors: string[] = [];
    const lowerSummary = summary.toLowerCase();

    commonVendors.forEach(vendor => {
      if (lowerSummary.includes(vendor.toLowerCase())) {
        foundVendors.push(vendor);
      }
    });

    return foundVendors;
  };

  return router;
};
