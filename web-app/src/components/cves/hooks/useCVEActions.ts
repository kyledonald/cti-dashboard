import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentsApi, type ShodanCVE, type Incident } from '../../../api';

interface UseCVEActionsProps {
  user: any;
  incidents: Incident[];
  cves: ShodanCVE[];
  dismissedCVEs: Set<string>;
  setShowCloseIncidentConfirm: (show: boolean) => void;
  setCveToClose: (cveId: string) => void;
  setIncidentToClose: (incident: Incident | null) => void;
  setClosingIncident: (closing: boolean) => void;
  saveDismissedCVEs: (dismissed: Set<string>) => void;
  saveDismissedCVEData: (cveData: ShodanCVE[]) => void;
  loadDismissedCVEData: () => ShodanCVE[];
  fetchIncidents: () => Promise<void>;
}

export const useCVEActions = ({
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
}: UseCVEActionsProps) => {
  const navigate = useNavigate();

  const performDismissCVE = useCallback((cveId: string) => {
    if (!user?.organizationId) return;
    
    const cveToStore = cves.find(cve => cve.cve === cveId);
    if (cveToStore) {
      const existingDismissedData = loadDismissedCVEData();
      const updatedDismissedData = [...existingDismissedData.filter(cve => cve.cve !== cveId), cveToStore];
      saveDismissedCVEData(updatedDismissedData);
    }
    
    const newDismissed = new Set(dismissedCVEs);
    newDismissed.add(cveId);
    saveDismissedCVEs(newDismissed);
  }, [user?.organizationId, cves, dismissedCVEs, saveDismissedCVEs, saveDismissedCVEData, loadDismissedCVEData]);

  const dismissCVE = useCallback((cveId: string) => {
    if (!user?.organizationId) return;
    
    // Check if there's an existing INC for this CVE
    const existingIncident = incidents.find(incident => 
      incident.cveIds && incident.cveIds.includes(cveId)
    );
    
    if (existingIncident) {
      // Show confirmation dialog asking if they want to close the associated incident when dismissing the CVE
      setShowCloseIncidentConfirm(true);
      setCveToClose(cveId);
      setIncidentToClose(existingIncident);
    } else {
      // No existing incident, so can NAR it
      performDismissCVE(cveId);
    }
  }, [user?.organizationId, incidents, setShowCloseIncidentConfirm, setCveToClose, setIncidentToClose, performDismissCVE]);

  // Restore a CVE from NAR
  const restoreCVE = useCallback((cveId: string) => {
    if (!user?.organizationId) return;
    
    const newDismissed = new Set(dismissedCVEs);
    newDismissed.delete(cveId);
    saveDismissedCVEs(newDismissed);
    const existingDismissedData = loadDismissedCVEData();
    const updatedDismissedData = existingDismissedData.filter(cve => cve.cve !== cveId);
    saveDismissedCVEData(updatedDismissedData);
  }, [user?.organizationId, dismissedCVEs, saveDismissedCVEs, saveDismissedCVEData, loadDismissedCVEData]);

  // Handle closing incident when marking CVE as NAR
  const handleCloseIncidentConfirm = useCallback(async (incidentToClose: Incident | null, cveToClose: string) => {
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
      performDismissCVE(cveToClose);
      setShowCloseIncidentConfirm(false);
      setCveToClose('');
      setIncidentToClose(null);
    } finally {
      setClosingIncident(false);
    }
  }, [setClosingIncident, performDismissCVE, fetchIncidents, setShowCloseIncidentConfirm, setCveToClose, setIncidentToClose]);
  
  const handleDismissWithoutClosing = useCallback(() => {
    // The CVE should remain active since the user chose to keep the incident open
    setShowCloseIncidentConfirm(false);
    setCveToClose('');
    setIncidentToClose(null);
  }, [setShowCloseIncidentConfirm, setCveToClose, setIncidentToClose]);

  // Check if CVE already has an incident
  const hasExistingIncident = useCallback((cveId: string): boolean => {
    return incidents.some(incident => 
      incident.cveIds && incident.cveIds.includes(cveId)
    );
  }, [incidents]);

  // Create incident from CVE
  const createIncidentFromCVE = useCallback((cve: ShodanCVE) => {
    // Store the CVE data in sessionStorage to pass to incidents page
    const incidentData = {
      cveId: cve.cve,
      description: cve.summary,
      cvssScore: cve.cvss3?.score || cve.cvss || 0,
      isKev: cve.kev || false
    };
    
    sessionStorage.setItem('createIncidentFromCVE', JSON.stringify(incidentData));
    navigate('/incidents');
  }, [navigate]);

  return {
    dismissCVE,
    performDismissCVE,
    restoreCVE,
    handleCloseIncidentConfirm,
    handleDismissWithoutClosing,
    hasExistingIncident,
    createIncidentFromCVE,
  };
}; 
