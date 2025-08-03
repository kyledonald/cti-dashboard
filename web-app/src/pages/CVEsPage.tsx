import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cvesApi, incidentsApi, type ShodanCVE, type Incident } from '../api';

import { CVEPageHeader } from '../components/cves/CVEPageHeader';
import { CVESearchBar } from '../components/cves/CVESearchBar';
import { CVETabNavigation } from '../components/cves/CVETabNavigation';
import { CVEErrorState } from '../components/cves/CVEErrorState';
import { CVELoadingState } from '../components/cves/CVELoadingState';
import { CVECard } from '../components/cves/CVECard';
import { CVEPagination } from '../components/cves/CVEPagination';
import { CVEEmptyState } from '../components/cves/CVEEmptyState';
import { CVEConfirmationDialog } from '../components/cves/CVEConfirmationDialog';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

const CVEsPage: React.FC = () => {
  const permissions = usePermissions();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cves, setCves] = useState<ShodanCVE[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [minCvssScore, setMinCvssScore] = useState(8.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showKevOnly, setShowKevOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dismissedCVEs, setDismissedCVEs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'active' | 'nar'>('active');
  const [sortBy, setSortBy] = useState<'severity' | 'date'>('severity');
  const itemsPerPage = 5;
  const cveContentRef = useRef<HTMLDivElement>(null);

        // State for CVE dismissal with incident closure
  const [showCloseIncidentConfirm, setShowCloseIncidentConfirm] = useState(false);
  const [cveToClose, setCveToClose] = useState('');
  const [incidentToClose, setIncidentToClose] = useState<Incident | null>(null);
  const [closingIncident, setClosingIncident] = useState(false);



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

  // Load dismissed CVEs from localStorage (organization-specific)
  useEffect(() => {
    if (!user?.organizationId) return;
    
    const saved = localStorage.getItem(`dismissed-cves-${user.organizationId}`);
    if (saved) {
      try {
        setDismissedCVEs(new Set(JSON.parse(saved)));
      } catch (error) {
        console.error('Error loading dismissed CVEs:', error);
      }
    }
  }, [user?.organizationId]);

  // Save dismissed CVEs to localStorage (organization-specific)
  const saveDismissedCVEs = (dismissed: Set<string>) => {
    if (!user?.organizationId) return;
    
    setDismissedCVEs(dismissed);
    localStorage.setItem(`dismissed-cves-${user.organizationId}`, JSON.stringify(Array.from(dismissed)));
  };

  // Save dismissed CVE data to localStorage (organization-specific)
  const saveDismissedCVEData = (cveData: ShodanCVE[]) => {
    if (!user?.organizationId) return;
    
    localStorage.setItem(`dismissed-cve-data-${user.organizationId}`, JSON.stringify(cveData));
  };

  // Load dismissed CVE data from localStorage (organization-specific)
  const loadDismissedCVEData = (): ShodanCVE[] => {
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
  };

  // Dismiss a CVE
  const dismissCVE = (cveId: string) => {
    if (!user?.organizationId) return;
    
    // Check if there's an existing incident for this CVE
    const existingIncident = incidents.find(incident => 
      incident.cveIds && incident.cveIds.includes(cveId)
    );
    
    if (existingIncident) {
      // Show confirmation dialog asking if they want to close the associated incident when dismissing the CVE
      setShowCloseIncidentConfirm(true);
      setCveToClose(cveId);
      setIncidentToClose(existingIncident);
    } else {
      // No existing incident, proceed with normal dismissal
      performDismissCVE(cveId);
    }
  };

  // Perform the actual CVE dismissal
  const performDismissCVE = (cveId: string) => {
    if (!user?.organizationId) return;
    
    const cveToStore = cves.find(cve => cve.cve === cveId);
    if (cveToStore) {
      // Save the full CVE data
      const existingDismissedData = loadDismissedCVEData();
      const updatedDismissedData = [...existingDismissedData.filter(cve => cve.cve !== cveId), cveToStore];
      saveDismissedCVEData(updatedDismissedData);
    }
    
    const newDismissed = new Set(dismissedCVEs);
    newDismissed.add(cveId);
    saveDismissedCVEs(newDismissed);
  };

  // Restore a CVE from NAR
  const restoreCVE = (cveId: string) => {
    if (!user?.organizationId) return;
    
    const newDismissed = new Set(dismissedCVEs);
    newDismissed.delete(cveId);
    saveDismissedCVEs(newDismissed);
    
    // Remove from dismissed data
    const existingDismissedData = loadDismissedCVEData();
    const updatedDismissedData = existingDismissedData.filter(cve => cve.cve !== cveId);
    saveDismissedCVEData(updatedDismissedData);
  };

  // Handle closing incident when marking CVE as NAR
  const handleCloseIncidentConfirm = async () => {
    if (!incidentToClose || !cveToClose) return;
    
    setClosingIncident(true);
    
    try {
      // Update the incident status to "Closed"
      await incidentsApi.update(incidentToClose.incidentId, {
        status: 'Closed',
        resolutionNotes: `Incident closed automatically when CVE ${cveToClose} was marked as No Action Required.`
      });
      
      // Dismiss the CVE
      performDismissCVE(cveToClose);
      
      // Refresh incidents data
      await fetchIncidents();
      
      // Close the dialog
      setShowCloseIncidentConfirm(false);
      setCveToClose('');
      setIncidentToClose(null);
      
    } catch (error) {
      console.error('Error closing incident:', error);
      // Still dismiss the CVE even if incident update fails
      performDismissCVE(cveToClose);
      setShowCloseIncidentConfirm(false);
      setCveToClose('');
      setIncidentToClose(null);
    } finally {
      setClosingIncident(false);
    }
  };

  // Handle dismissing CVE without closing incident
  const handleDismissWithoutClosing = () => {
    if (!cveToClose) return;
    
    // Just close the dialog without dismissing the CVE
    // The CVE should remain active since the user chose to keep the incident open
    setShowCloseIncidentConfirm(false);
    setCveToClose('');
    setIncidentToClose(null);
  };

  // Check if CVE already has an incident
  const hasExistingIncident = (cveId: string): boolean => {
    return incidents.some(incident => 
      incident.cveIds && incident.cveIds.includes(cveId)
    );
  };

  // Create incident from CVE
  const createIncidentFromCVE = (cve: ShodanCVE) => {
    // Store the CVE data in sessionStorage to pass to incidents page
    const incidentData = {
      cveId: cve.cve,
      description: cve.summary,
      cvssScore: cve.cvss3?.score || cve.cvss || 0,
      isKev: cve.kev || false
    };
    
    sessionStorage.setItem('createIncidentFromCVE', JSON.stringify(incidentData));
    
    // Navigate to incidents page
    navigate('/incidents');
  };

  // Filter and sort CVEs based on search term, tab, and sort preference
  const getFilteredCVEs = () => {
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
  };

  const filteredCVEs = getFilteredCVEs();

  useEffect(() => {
    if (user?.organizationId) {
      fetchCVEs();
      fetchIncidents();
    }
  }, [fetchCVEs, fetchIncidents, user?.organizationId]);




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

  if (loading && cves.length === 0) {
    return <CVELoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <CVEPageHeader
        lastUpdated={lastUpdated}
        showKevOnly={showKevOnly}
        minCvssScore={minCvssScore}
        sortBy={sortBy}
        onFilterChange={(value) => {
          if (value === 'kev') {
            setShowKevOnly(true);
            setMinCvssScore(0);
          } else {
            setShowKevOnly(false);
            setMinCvssScore(Number(value));
          }
        }}
        onSortChange={setSortBy}
      />

      {/* Search Bar */}
      <CVESearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={() => setSearchTerm('')}
      />

      {/* Tab Navigation */}
      <CVETabNavigation
        activeTab={activeTab}
        activeCount={cves.filter(cve => !dismissedCVEs.has(cve.cve)).length}
        dismissedCount={dismissedCVEs.size}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
      />

      {/* Error State */}
      <CVEErrorState error={error} />

      {/* CVEs List */}
      {(activeTab === 'active' ? cves.length > 0 : filteredCVEs.length > 0) ? (
        <div ref={cveContentRef} className="space-y-6">
          {/* CVE Cards */}
          <div className="space-y-4">
            {filteredCVEs
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((cve) => (
                <CVECard
                  key={cve.cve}
                  cve={cve}
                  activeTab={activeTab}
                  permissions={permissions}
                  hasExistingIncident={hasExistingIncident}
                  onDismissCVE={dismissCVE}
                  onRestoreCVE={restoreCVE}
                  onCreateIncident={createIncidentFromCVE}
                  getSeverityLabel={getSeverityLabel}
                  getSeverityVariant={getSeverityVariant}
                  getSeverityBorderColor={getSeverityBorderColor}
                  formatDate={formatDate}
                />
              ))}
          </div>

          {/* Pagination Info - Always show */}
          <CVEPagination
            currentPage={currentPage}
            totalItems={filteredCVEs.length}
            itemsPerPage={itemsPerPage}
            activeTab={activeTab}
            onPageChange={setCurrentPage}
            onScrollToTop={() => cveContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        </div>
      ) : !loading && !error ? (
        <CVEEmptyState activeTab={activeTab} />
      ) : null}

      {/* CVE Dismissal with Incident Closure Confirmation Dialog */}
      <CVEConfirmationDialog
        showCloseIncidentConfirm={showCloseIncidentConfirm}
        incidentToClose={incidentToClose}
        cveToClose={cveToClose}
        closingIncident={closingIncident}
        onCloseIncidentConfirm={handleCloseIncidentConfirm}
        onDismissWithoutClosing={handleDismissWithoutClosing}
      />
    </div>
  );
};

export default CVEsPage; 