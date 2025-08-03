import React, { useEffect, useRef } from 'react';

import { CVEPageHeader } from '../components/cves/CVEPageHeader';
import { CVESearchBar } from '../components/cves/CVESearchBar';
import { CVETabNavigation } from '../components/cves/CVETabNavigation';
import { CVEErrorState } from '../components/cves/CVEErrorState';
import { CVELoadingState } from '../components/cves/CVELoadingState';
import { CVECard } from '../components/cves/CVECard';
import { CVEPagination } from '../components/cves/CVEPagination';
import { CVEEmptyState } from '../components/cves/CVEEmptyState';
import { CVEConfirmationDialog } from '../components/cves/CVEConfirmationDialog';
import { useCVEForm } from '../components/cves/hooks/useCVEForm';
import { useCVEActions } from '../components/cves/hooks/useCVEActions';
import { useCVEUtils } from '../components/cves/hooks/useCVEUtils';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

const CVEsPage: React.FC = () => {
  const permissions = usePermissions();
  const { user } = useAuth();

  const itemsPerPage = 5;
  const cveContentRef = useRef<HTMLDivElement>(null);

  const {
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
    incidents,
    loading,
    error,
    lastUpdated,
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
  } = useCVEForm();

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
  }, [user?.organizationId, setDismissedCVEs]);

  const {
    dismissCVE,
    restoreCVE,
    handleCloseIncidentConfirm,
    handleDismissWithoutClosing,
    hasExistingIncident,
    createIncidentFromCVE,
  } = useCVEActions({
    user,
    incidents,
    cves,
    dismissedCVEs,
    setShowCloseIncidentConfirm,
    setCveToClose,
    setIncidentToClose,
    setClosingIncident,
    saveDismissedCVEs,
    saveDismissedCVEData,
    loadDismissedCVEData,
    fetchIncidents,
  });

  const {
    filteredCVEs,
    getSeverityLabel,
    getSeverityVariant,
    getSeverityBorderColor,
    formatDate,
  } = useCVEUtils({
    cves,
    dismissedCVEs,
    activeTab,
    searchTerm,
    sortBy,
    loadDismissedCVEData,
  });

  useEffect(() => {
    if (user?.organizationId) {
      fetchCVEs();
      fetchIncidents();
    }
  }, [fetchCVEs, fetchIncidents, user?.organizationId]);

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
        onCloseIncidentConfirm={() => handleCloseIncidentConfirm(incidentToClose, cveToClose)}
        onDismissWithoutClosing={handleDismissWithoutClosing}
      />
    </div>
  );
};

export default CVEsPage; 
