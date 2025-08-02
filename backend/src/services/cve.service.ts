import axios from 'axios';

export interface ShodanCVE {
  cve: string;
  summary: string;
  cvss?: number;
  cvss3?: {
    score: number;
    vector: string;
  };
  kev?: boolean;
  published: string;
  modified: string;
  references: string[];
  extractedVendors?: string[];
}

export class CVEService {
  private SHODAN_CVE_API_BASE_URL = 'https://cvedb.shodan.io';

  // Helper function to extract vendors from summary
  private extractVendorsFromSummary(summary: string): string[] {
    const commonVendors = [
      'Microsoft', 'Adobe', 'Oracle', 'Cisco', 'Apple', 'Google', 'VMware',
      'Apache', 'Linux', 'Ubuntu', 'Red Hat', 'Debian', 'Dell', 'HP', 'IBM', 
      'Intel', 'AMD', 'NVIDIA', 'Qualcomm', 'Samsung', 'Huawei', 'Juniper', 
      'Fortinet', 'Palo Alto'
    ];

    const foundVendors: string[] = [];
    const lowerSummary = summary.toLowerCase();

    commonVendors.forEach(vendor => {
      if (lowerSummary.includes(vendor.toLowerCase())) {
        foundVendors.push(vendor);
      }
    });

    return foundVendors;
  }

  // Get latest CVEs from Shodan API
  async getLatestCVEs(limit: number = 50, minCvssScore: number = 0): Promise<ShodanCVE[]> {
    try {
      // Fetch from Shodan API directly (no CORS issues from backend)
      const response = await axios.get(`https://cvedb.shodan.io/cves?latest&limit=${Math.min(limit * 2, 200)}`, {
        headers: {
          'Accept': 'application/json',
        },
        timeout: 10000
      });

      if (!response.data) {
        throw new Error('No data received from Shodan API');
      }

      let cvesData: any[];

      // Handle Shodan API response format
      if ((response.data as any).cves && Array.isArray((response.data as any).cves)) {
        cvesData = (response.data as any).cves;
      } else if (Array.isArray(response.data)) {
        cvesData = response.data;
      } else {
        throw new Error('Unexpected response format from Shodan API');
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
        extractedVendors: this.extractVendorsFromSummary(cveItem.summary || '')
      }));

      // Filter by CVSS score
      const filteredCves = mappedCves.filter((cve: any) => {
        const score = cve.cvss3?.score || cve.cvss || 0;
        return score >= minCvssScore;
      });

      return filteredCves.slice(0, limit);

    } catch (error: any) {
      console.error('Error fetching CVE data:', error.message);
      throw new Error(`Failed to fetch CVE data: ${error.message}`);
    }
  }

  // Get CVE by ID
  async getCVEById(cveId: string): Promise<any> {
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
      if (error.response && error.response.status === 404) {
        console.warn(`CVE not found on Shodan: ${cveId}`);
        return null;
      }
      console.error(`Error fetching CVE ${cveId} from Shodan:`, error.message);
      throw new Error(`Failed to fetch CVE data from Shodan: ${error.message}`);
    }
  }

  // Legacy method for backward compatibility
  async getLatestCVEsWithFilter(minCvssScore: number = 7.5, limit: number = 10): Promise<ShodanCVE[]> {
    return this.getLatestCVEs(limit, minCvssScore);
  }
}

export const cveService = new CVEService();
