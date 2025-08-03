import { useMemo } from 'react';
import { type ShodanCVE } from '../../../api';

interface UseCVEUtilsProps {
  cves: ShodanCVE[];
  dismissedCVEs: Set<string>;
  activeTab: 'active' | 'nar';
  searchTerm: string;
  sortBy: 'severity' | 'date';
  loadDismissedCVEData: () => ShodanCVE[];
}

export const useCVEUtils = ({
  cves,
  dismissedCVEs,
  activeTab,
  searchTerm,
  sortBy,
  loadDismissedCVEData,
}: UseCVEUtilsProps) => {
  // Filter and sort CVEs based on search term, tab, and sort preference
  const filteredCVEs = useMemo(() => {
    let filteredCVEs: ShodanCVE[] = [];
    
    if (activeTab === 'nar') {
      // Show dismissed CVEs
      const dismissedData = loadDismissedCVEData();
      
      filteredCVEs = dismissedData.filter(cve => {
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            cve.cve.toLowerCase().includes(searchLower) ||
            cve.summary.toLowerCase().includes(searchLower) ||
            (cve.extractedVendors && cve.extractedVendors.some(vendor => 
              vendor.toLowerCase().includes(searchLower)
            ))
          );
        }
        return true;
      });
    } else {
      // Show active CVEs (not dismissed)
      filteredCVEs = cves.filter(cve => {
        // Filter out dismissed CVEs
        if (dismissedCVEs.has(cve.cve)) {
          return false;
        }
        
        // Apply search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            cve.cve.toLowerCase().includes(searchLower) ||
            cve.summary.toLowerCase().includes(searchLower) ||
            (cve.extractedVendors && cve.extractedVendors.some(vendor => 
              vendor.toLowerCase().includes(searchLower)
            ))
          );
        }
        
        return true;
      });
    }
    
    // Sort the filtered CVEs
    return filteredCVEs.sort((a, b) => {
      if (sortBy === 'severity') {
        const scoreA = a.cvss3?.score || a.cvss || 0;
        const scoreB = b.cvss3?.score || b.cvss || 0;
        return scoreB - scoreA; // Highest severity first
      } else {
        // Sort by date (newest first)
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      }
    });
  }, [cves, dismissedCVEs, activeTab, searchTerm, sortBy, loadDismissedCVEData]);

  // Severity utility functions
  const getSeverityLabel = (score: number): string => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const getSeverityVariant = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    return 'low';
  };

  const getSeverityBorderColor = (score: number): string => {
    if (score >= 9.0) return 'border-l-red-500';
    if (score >= 7.0) return 'border-l-orange-500';
    if (score >= 4.0) return 'border-l-yellow-500';
    return 'border-l-green-500';
  };

  // Date formatting utility
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return {
    filteredCVEs,
    getSeverityLabel,
    getSeverityVariant,
    getSeverityBorderColor,
    formatDate,
  };
}; 