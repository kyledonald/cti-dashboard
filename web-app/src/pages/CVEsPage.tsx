import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cvesApi, type ShodanCVE } from '../api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

const CVEsPage: React.FC = () => {
  const permissions = usePermissions();
  const { user } = useAuth();
  const [cves, setCves] = useState<ShodanCVE[]>([]);
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

  const fetchCVEs = useCallback(async () => {
    try {
      setError(null);
      const data = await cvesApi.getShodanLatest(minCvssScore, 50); // Fetch 50 CVEs to get more that meet criteria
      
      let filteredData = data;
      
      // Apply KEV filter if enabled
      if (showKevOnly) {
        filteredData = data.filter(cve => cve.kev === true);
      }
      
      setCves(filteredData);
      setLastUpdated(new Date());
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CVEs');
    } finally {
      setLoading(false);
    }
  }, [minCvssScore, showKevOnly]);

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
    }
  }, [fetchCVEs, user?.organizationId]);



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
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">CVEs</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Monitor Common Vulnerabilities and Exposures</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Loading CVEs...</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fetching latest vulnerabilities from Shodan</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Critical Vulnerabilities</h2>
          {lastUpdated && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label htmlFor="cvss-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority:
            </label>
            <select
              id="cvss-filter"
              value={showKevOnly ? 'kev' : minCvssScore.toString()}
              onChange={(e) => {
                if (e.target.value === 'kev') {
                  setShowKevOnly(true);
                  setMinCvssScore(0);
                } else {
                  setShowKevOnly(false);
                  setMinCvssScore(Number(e.target.value));
                }
              }}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="kev">Known Exploited Only</option>
              <option value={9.0}>Critical (9.0+)</option>
              <option value={8.0}>High Priority (8.0+)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort by:
            </label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'severity' | 'date')}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="severity">Severity (High to Low)</option>
              <option value="date">Date (Newest First)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search CVEs by ID, description, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        {searchTerm && (
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
            className="flex items-center gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('active');
              setCurrentPage(1);
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Active Vulnerabilities
            {activeTab !== 'active' && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {cves.filter(cve => !dismissedCVEs.has(cve.cve)).length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('nar');
              setCurrentPage(1);
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'nar'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            No Action Required
            {activeTab !== 'nar' && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {dismissedCVEs.size}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading CVEs</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* CVEs List */}
      {(activeTab === 'active' ? cves.length > 0 : filteredCVEs.length > 0) ? (
        <div ref={cveContentRef} className="space-y-6">
          {/* CVE Cards */}
          <div className="space-y-4">
            {filteredCVEs
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((cve) => {
                const cvssScore = cve.cvss3?.score || cve.cvss || 0;
                const severityLabel = getSeverityLabel(cvssScore);

                return (
                  <Card key={cve.cve} className="p-6 hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {cve.cve}
                        </h3>
                        <Badge variant={getSeverityVariant(cvssScore)}>
                          {severityLabel} ({cvssScore.toFixed(1)})
                        </Badge>
                        {cve.kev && (
                          <Badge variant="critical">
                            ACTIVELY EXPLOITED
                          </Badge>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                        <div>Published: {formatDate(cve.published)}</div>
                        {cve.modified !== cve.published && (
                          <div>Modified: {formatDate(cve.modified)}</div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {cve.summary}
                    </p>

                    {/* References */}
                    {cve.references && cve.references.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Official References</h4>
                        <div className="space-y-1">
                          {cve.references.slice(0, 3).map((ref, index) => (
                            <a
                              key={index}
                              href={ref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                            >
                              {ref}
                            </a>
                          ))}
                          {cve.references.length > 3 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              +{cve.references.length - 3} more references
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions - Bottom Right - Only show for users with CVE management permissions */}
                    {permissions.canManageCVEs && (
                      <div className="flex justify-end">
                        <div className="flex gap-2">
                          {activeTab === 'active' ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30 dark:hover:border-green-600"
                              >
                                Create Incident
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => dismissCVE(cve.cve)}
                                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 dark:hover:border-red-600"
                              >
                                No Action Required
                              </Button>
                            </>
                          ) : (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => restoreCVE(cve.cve)}
                              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:border-blue-600"
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>

          {/* Pagination Info - Always show */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
                             Showing <b>{Math.min((currentPage - 1) * itemsPerPage + 1, filteredCVEs.length)}-{Math.min(currentPage * itemsPerPage, filteredCVEs.length)}</b> of <b>{filteredCVEs.length}</b> {activeTab === 'active' ? 'critical vulnerabilities' : 'dismissed vulnerabilities'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => Math.max(1, prev - 1));
                  setTimeout(() => {
                    cveContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                disabled={currentPage === 1}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {Math.max(1, Math.ceil(filteredCVEs.length / itemsPerPage))}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(prev => Math.min(Math.ceil(filteredCVEs.length / itemsPerPage), prev + 1));
                  setTimeout(() => {
                    cveContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 100);
                }}
                disabled={currentPage >= Math.ceil(filteredCVEs.length / itemsPerPage)}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              {activeTab === 'active' ? 'No vulnerabilities found' : 'No dismissed vulnerabilities'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === 'active' 
                ? 'No vulnerabilities found matching this criteria.' 
                : 'No vulnerabilities have been marked as "No Action Required" yet.'
              }
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CVEsPage; 