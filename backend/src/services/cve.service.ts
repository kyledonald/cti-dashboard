import axios from 'axios'; 
import { CVEResponse } from '../models/cve.model';

interface CustomAxiosError extends Error {
  response?: {
    status: number;
    data: any;
  };
  isAxiosError: boolean;
}

function isCustomAxiosError(error: any): error is CustomAxiosError {
  return (error as CustomAxiosError).isAxiosError === true;
}

// New interface to match frontend ShodanCVE
export interface ShodanCVE {
  cve: string;
  summary: string;
  cvss?: number;
  cvss3?: {
    score: number;
    vector: string;
  };
  epss?: number;
  kev?: boolean;
  published: string;
  modified: string;
  references: string[];
  cpe?: string[];
  cwe?: string[];
  vendors?: string[];
  products?: string[];
}

export class CVEService {
  private SHODAN_CVE_API_BASE_URL = 'https://cvedb.shodan.io';

  async getCVEById(cveId: string): Promise<CVEResponse | null> {
    try {
      const response = await axios.get(`${this.SHODAN_CVE_API_BASE_URL}/cve/${cveId}`);
      const cveData: any = response.data;

      if (cveData && cveData.cve_id) {
        return {
          cveId: cveData.cve_id,
          summary: cveData.summary,
          cvss: cveData.cvss ?? null,
          cvss_version: cveData.cvss_version ?? null,
          cvss_v2: cveData.cvss_v2 ?? null,
          cvss_v3: cveData.cvss_v3 ?? null,
          publishedTime: cveData.published_time,
          references: cveData.references ?? [],
          kev: cveData.kev ?? false,
          proposeAction: cveData.propose_action ?? null,
          ransomwareCampaign: cveData.ransomware_campaign ?? null,
        };
      }
      return null;
    } catch (error: any) {
      if (isCustomAxiosError(error) && error.response && error.response.status === 404) {
        console.warn(`CVE not found on Shodan: ${cveId}`);
        return null;
      }
      console.error(`Error fetching CVE ${cveId} from Shodan:`, error.message);
      throw new Error(`Failed to fetch CVE data from Shodan: ${error.message}`);
    }
  }

  async getLatestCVEs(limit: number = 10): Promise<CVEResponse[]> {
    try {
      const response = await axios.get(`${this.SHODAN_CVE_API_BASE_URL}/cves`);
      const cvesData = (response.data as { cves: any[] }).cves;

      if (cvesData && Array.isArray(cvesData) && cvesData.length > 0) {
        const mappedCves = cvesData.map((cveItem: any) => ({
          cveId: cveItem.cve_id,
          summary: cveItem.summary,
          cvss: cveItem.cvss ?? null,
          cvss_version: cveItem.cvss_version ?? null,
          cvss_v2: cveItem.cvss_v2 ?? null,
          cvss_v3: cveItem.cvss_v3 ?? null,
          publishedTime: cveItem.published_time,
          references: cveItem.references ?? [],
          kev: cveItem.kev ?? false,
          proposeAction: cveItem.propose_action ?? null,
          ransomwareCampaign: cveItem.ransomware_campaign ?? null,
        }));
        return mappedCves.slice(0, limit);
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching latest CVEs from Shodan:', error.message);
      throw new Error(`Failed to fetch latest CVE data from Shodan: ${error.message}`);
    }
  }

  // New method to get latest CVEs with CVSS filtering
  async getLatestCVEsWithFilter(minCvssScore: number = 7.5, limit: number = 10): Promise<ShodanCVE[]> {
    try {
      // Fetch more CVEs than needed to account for filtering
      const response = await axios.get(`${this.SHODAN_CVE_API_BASE_URL}/cves?latest&limit=${limit * 3}`);
      
      const responseData = response.data as any;
      let cvesData: any[];
      
      // Handle the actual Shodan API response format
      if (responseData.cves && Array.isArray(responseData.cves)) {
        cvesData = responseData.cves;
      } else if (Array.isArray(responseData)) {
        cvesData = responseData;
      } else {
        console.warn('Unexpected response format from Shodan CVE API');
        return [];
      }

      const mappedCves: ShodanCVE[] = cvesData.map((cveItem: any) => ({
        cve: cveItem.cve_id || cveItem.cve,
        summary: cveItem.summary || '',
        cvss: cveItem.cvss || undefined,
        cvss3: cveItem.cvss_v3 ? {
          score: cveItem.cvss_v3,
          vector: '' // Shodan doesn't provide vector string in this endpoint
        } : undefined,
        epss: cveItem.epss || undefined,
        kev: cveItem.kev || false,
        published: cveItem.published_time || new Date().toISOString(),
        modified: cveItem.modified_time || cveItem.published_time || new Date().toISOString(),
        references: cveItem.references || [],
        cpe: cveItem.cpe || undefined,
        cwe: cveItem.cwe || undefined,
        vendors: cveItem.vendors || undefined,
        products: cveItem.products || undefined
      }));

      // Filter by CVSS score - use cvss_v3 or cvss field
      const filteredCves = mappedCves.filter(cve => {
        const score = cve.cvss3?.score || cve.cvss || 0;
        return score >= minCvssScore;
      });

      return filteredCves.slice(0, limit);
    } catch (error: any) {
      console.error('Error fetching latest CVEs with filter from Shodan:', error.message);
      throw new Error(`Failed to fetch filtered CVE data from Shodan: ${error.message}`);
    }
  }
}
