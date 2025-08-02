import express from 'express';
import { Firestore } from '@google-cloud/firestore';
import { rateLimitAI } from '../middleware/rateLimit.middleware';
import { aiService } from '../services/ai.service';
import { cveService } from '../services/cve.service';

export const cveRouter = (db: Firestore) => {
  const router = express.Router();

  // Generate AI summary for incidents (backend proxy to avoid CORS and API key exposure)
  router.post('/ai-summary', rateLimitAI, async (req, res) => {
    try {
      const { incident, users, threatActors } = req.body;
      
      const summary = await aiService.generateIncidentSummary({ incident, users, threatActors });
      res.json({ summary });

    } catch (error: any) {
      console.error('Error generating AI summary:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
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
      
      const cves = await cveService.getLatestCVEs(Number(limit), Number(minCvssScore));
      res.json(cves);

    } catch (error: any) {
      console.error('Error fetching CVE data:', error.message);
      res.status(500).json({ 
        error: 'Failed to fetch CVE data',
        details: error.message 
      });
    }
  });

  return router;
};
