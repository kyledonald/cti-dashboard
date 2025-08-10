import { useState, useEffect } from 'react';
import { cvesApi, type ShodanCVE } from '../../../api';

interface UseRelevantCVEsProps {
  softwareList: string[];
  user: any;
}

export const useRelevantCVEs = ({ softwareList, user }: UseRelevantCVEsProps) => {
  const [matchingCVEs, setMatchingCVEs] = useState<ShodanCVE[]>([]);
  const [loading, setLoading] = useState(false);

  const findRelevantCVEs = async () => {
    if (softwareList.length === 0) return;
    
    setLoading(true);
    try {
      const data = await cvesApi.getShodanLatest(8.0, 200);
      
      const relevant = data.filter(cve => {
        const summary = cve.summary.toLowerCase();
        const score = cve.cvss3?.score || cve.cvss || 0;
        return score >= 8.0 && softwareList.some(software => {
          const softwareLower = software.toLowerCase();
          return summary.includes(softwareLower);
        });
      });

      // Sort by CVSS score (highest first)
      relevant.sort((a, b) => {
        const scoreA = a.cvss3?.score || a.cvss || 0;
        const scoreB = b.cvss3?.score || b.cvss || 0;
        return scoreB - scoreA;
      });

      setMatchingCVEs(relevant);
    } catch (error) {
      console.error('Error fetching relevant CVEs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check for relevant CVEs when software list changes
  useEffect(() => {
    if (softwareList.length > 0 && user?.organizationId) {
      findRelevantCVEs();
    } else {
      setMatchingCVEs([]);
    }
  }, [softwareList, user?.organizationId]);

  return {
    matchingCVEs,
    loading,
    findRelevantCVEs,
  };
}; 
