import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { incidentsApi, cvesApi, threatActorsApi } from '../../../api';
import { useQuery } from '@tanstack/react-query';

export const useDashboardData = () => {
  const { user } = useAuth();

  // Data fetching
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: incidentsApi.getAll,
  });
  const { data: threatActors = [], isLoading: threatActorsLoading } = useQuery({
    queryKey: ['threatActors'],
    queryFn: threatActorsApi.getAll,
  });
  const [cves, setCves] = useState<any[]>([]);
  const [cvesLoading, setCvesLoading] = useState(true);
  const [softwareList, setSoftwareList] = useState<string[]>([]);
  const [atRiskSoftwareCount, setAtRiskSoftwareCount] = useState(0);

  // Fetch CVEs (top 200, high severity)
  useEffect(() => {
    let mounted = true;
    setCvesLoading(true);
    cvesApi.getShodanLatest(8.0, 200).then((data) => {
      if (mounted) setCves(data);
    }).finally(() => setCvesLoading(false));
    return () => { mounted = false; };
  }, []);

  // Load org-specific software from localStorage
  useEffect(() => {
    if (!user?.organizationId) return;
    const saved = localStorage.getItem(`organization-software-${user.organizationId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            setSoftwareList(parsed);
          } else {
            setSoftwareList(parsed.map((item: any) => `${item.vendor} ${item.name}`.trim()));
          }
        }
      } catch {}
    }
  }, [user?.organizationId]);

  // Calculate at-risk software
  useEffect(() => {
    if (!softwareList.length || !cves.length) {
      setAtRiskSoftwareCount(0);
      return;
    }
    const atRisk = cves.filter(cve =>
      softwareList.some(software => cve.summary.toLowerCase().includes(software.toLowerCase()))
    );
    setAtRiskSoftwareCount(atRisk.length);
  }, [softwareList, cves]);

  // Org-specific filtering
  const orgId = user?.organizationId;
  const orgIncidents = useMemo(() => incidents.filter(i => i.organizationId === orgId), [incidents, orgId]);
  const orgThreatActors = useMemo(() => threatActors.filter(ta => !ta.organizationId || ta.organizationId === orgId), [threatActors, orgId]);

  // CVE metrics
  const kevCount = useMemo(() => cves.filter(cve => cve.kev).length, [cves]);
  const cveCount = cves.length;

  // High-risk threat actors (Advanced/Expert sophistication only)
  const highRiskThreatActors = useMemo(() => orgThreatActors.filter(ta => 
    ta.sophistication === 'Advanced' || ta.sophistication === 'Expert'
  ), [orgThreatActors]);

  const isLoading = incidentsLoading || threatActorsLoading || cvesLoading;

  return {
    // Raw data
    incidents,
    threatActors,
    cves,
    softwareList,
    
    // Filtered data
    orgIncidents,
    orgThreatActors,
    
    // Metrics
    kevCount,
    cveCount,
    atRiskSoftwareCount,
    highRiskThreatActors,
    
    // Loading states
    isLoading,
    incidentsLoading,
    threatActorsLoading,
    cvesLoading,
    
    // User context
    user,
    orgId,
  };
}; 