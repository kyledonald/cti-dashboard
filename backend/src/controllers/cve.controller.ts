import { Request, Response } from 'express';
import { CVEService } from '../services/cve.service';

export class CVEController {
  private service: CVEService;

  constructor(service: CVEService) {
    this.service = service;
  }

  async getLatestCVEs(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ error: 'Invalid limit parameter. Must be a positive integer.' });
      }
      const cves = await this.service.getLatestCVEs(limit);
      res.status(200).json({ cves: cves });
    } catch (error: any) {
      console.error('Error in getLatestCVEs controller:', error);
      res.status(500).json({ error: 'Failed to fetch latest CVEs', details: error.message });
    }
  }

  async getLatestCVEsFiltered(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const minCvssScore = req.query.minCvssScore ? parseFloat(req.query.minCvssScore as string) : 7.5;
      
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ error: 'Invalid limit parameter. Must be a positive integer.' });
      }
      
      if (isNaN(minCvssScore) || minCvssScore < 0 || minCvssScore > 10) {
        return res.status(400).json({ error: 'Invalid minCvssScore parameter. Must be a number between 0 and 10.' });
      }
      
      const cves = await this.service.getLatestCVEsWithFilter(minCvssScore, limit);
      res.status(200).json({ cves: cves });
    } catch (error: any) {
      console.error('Error in getLatestCVEsFiltered controller:', error);
      res.status(500).json({ error: 'Failed to fetch filtered latest CVEs', details: error.message });
    }
  }

  async getCVEById(req: Request, res: Response) {
    try {
      const { cveId } = req.params;
      if (!cveId) {
        return res.status(400).json({ error: 'CVE ID is required.' });
      }
      const cve = await this.service.getCVEById(cveId);

      if (!cve) {
        return res.status(404).json({ error: 'CVE not found.' });
      }
      res.status(200).json({ cve: cve });
    } catch (error: any) {
      console.error('Error in getCVEById controller:', error);
      res.status(500).json({ error: 'Failed to fetch CVE', details: error.message });
    }
  }
}
