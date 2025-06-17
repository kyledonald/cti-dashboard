export interface CVEResponse {
    cveId: string;
    summary: string;
    cvss?: number | null;
    cvss_version?: string | null;
    cvss_v2?: number | null;
    cvss_v3?: number | null;
    publishedTime: string;
    references?: string[];
    kev?: boolean;
    proposeAction?: string | null;
    ransomwareCampaign?: string | null;
  }
