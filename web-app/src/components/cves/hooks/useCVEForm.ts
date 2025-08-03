import { useState, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { cvesApi, incidentsApi, type ShodanCVE, type Incident } from '../../../api';

export const useCVEForm = () => {
  const { user } = useAuth();
  
  // Form state
  const [minCvssScore, setMinCvssScore] = useState(8.0);
  const [showKevOnly, setShowKevOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'severity' | 'date'>('severity');
  const [activeTab, setActiveTab] = useState<'active' | 'nar'>('active');
  const [currentPage, setCurrentPage] = useState(1);

  // Data state
  const [cves, setCves] = useState<ShodanCVE[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dismissedCVEs, setDismissedCVEs] = useState<Set<string>>(new Set());

  // Confirmation dialog state
  const [showCloseIncidentConfirm, setShowCloseIncidentConfirm] = useState(false);
  const [cveToClose, setCveToClose] = useState('');
  const [incidentToClose, setIncidentToClose] = useState<Incident | null>(null);
  const [closingIncident, setClosingIncident] = useState(false);

  // Save dismissed CVEs to localStorage (organization-specific)
  const saveDismissedCVEs = useCallback((dismissed: Set<string>) => {
    if (!user?.organizationId) return;
    
    setDismissedCVEs(dismissed);
    localStorage.setItem(`dismissed-cves-${user.organizationId}`, JSON.stringify(Array.from(dismissed)));
  }, [user?.organizationId]);

  // Save dismissed CVE data to localStorage (organization-specific)
  const saveDismissedCVEData = useCallback((cveData: ShodanCVE[]) => {
    if (!user?.organizationId) return;
    
    localStorage.setItem(`dismissed-cve-data-${user.organizationId}`, JSON.stringify(cveData));
  }, [user?.organizationId]);

  // Load dismissed CVE data from localStorage (organization-specific)
  const loadDismissedCVEData = useCallback((): ShodanCVE[] => {
    if (!user?.organizationId) return [];
    
    const saved = localStorage.getItem(`dismissed-cve-data-${user.organizationId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error loading dismissed CVE data:', error);
      }
    }
    return [];
  }, [user?.organizationId]);

  // Fetch CVEs
  const fetchCVEs = useCallback(async () => {
    try {
      setError(null);
      const data = await cvesApi.getShodanLatest(minCvssScore, 200); // Fetch more CVEs to get more recent ones
      
      let filteredData = data;
      
      // Apply KEV filter if enabled
      if (showKevOnly) {
        filteredData = data.filter(cve => cve.kev === true);
      }
      
      // Sort by published date (newest first) to ensure we get the latest CVEs
      filteredData.sort((a, b) => {
        const dateA = new Date(a.published).getTime();
        const dateB = new Date(b.published).getTime();
        return dateB - dateA;
      });
      
      setCves(filteredData);
      setLastUpdated(new Date());
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CVEs');
    } finally {
      setLoading(false);
    }
  }, [minCvssScore, showKevOnly]);

  // Fetch incidents to check for existing CVE incidents
  const fetchIncidents = useCallback(async () => {
    if (!user?.organizationId) return;
    
    try {
      const incidentsData = await incidentsApi.getAll();
      const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
      setIncidents(orgIncidents);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    }
  }, [user?.organizationId]);

  return {
    // Form state
    minCvssScore,
    setMinCvssScore,
    showKevOnly,
    setShowKevOnly,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    
    // Data state
    cves,
    setCves,
    incidents,
    setIncidents,
    loading,
    setLoading,
    error,
    setError,
    lastUpdated,
    setLastUpdated,
    dismissedCVEs,
    setDismissedCVEs,
    
    // Confirmation dialog state
    showCloseIncidentConfirm,
    setShowCloseIncidentConfirm,
    cveToClose,
    setCveToClose,
    incidentToClose,
    setIncidentToClose,
    closingIncident,
    setClosingIncident,
    
    // Functions
    saveDismissedCVEs,
    saveDismissedCVEData,
    loadDismissedCVEData,
    fetchCVEs,
    fetchIncidents,
  };
}; 