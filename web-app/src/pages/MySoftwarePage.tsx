import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { cvesApi, type ShodanCVE } from '../api';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

const MySoftwarePage: React.FC = () => {
  const { user } = useAuth();
  const [softwareList, setSoftwareList] = useState<string[]>([]);
  const [newSoftware, setNewSoftware] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [matchingCVEs, setMatchingCVEs] = useState<ShodanCVE[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInventoryCollapsed, setIsInventoryCollapsed] = useState(false);
  const permissions = usePermissions();

  // Load software from localStorage (organization-specific)
  useEffect(() => {
    if (!user?.organizationId) return;
    
    const saved = localStorage.getItem(`organization-software-${user.organizationId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle both old format (array of objects) and new format (array of strings)
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            setSoftwareList(parsed);
          } else {
            // Convert old format to new format
            setSoftwareList(parsed.map(item => `${item.vendor} ${item.name}`.trim()));
          }
        }
      } catch (error) {
        console.error('Error loading software:', error);
      }
    }
  }, [user?.organizationId]);

  // Save software to localStorage (organization-specific)
  const saveSoftware = (software: string[]) => {
    if (!user?.organizationId) return;
    
    setSoftwareList(software);
    localStorage.setItem(`organization-software-${user.organizationId}`, JSON.stringify(software));
  };

  // Add new software
  const addSoftware = () => {
    if (!newSoftware.trim() || !user?.organizationId) return;
    
    const items = newSoftware.split(',').map(item => item.trim()).filter(item => item.length > 0);
    const uniqueItems = [...new Set([...softwareList, ...items])];
    
    saveSoftware(uniqueItems);
    setNewSoftware('');
    setShowAddForm(false);
  };

  // Remove software from list
  const removeSoftware = (software: string) => {
    if (!user?.organizationId) return;
    
    saveSoftware(softwareList.filter(item => item !== software));
  };

  // Filter software based on search term
  const filteredSoftware = softwareList.filter(software =>
    software.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Find CVEs relevant to organization software
  const findRelevantCVEs = async () => {
    if (softwareList.length === 0) return;
    
    setLoading(true);
    try {
      const data = await cvesApi.getShodanLatest(8.0, 200); // Get more CVEs to find matches
      
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

  const getSeverityLabel = (score: number): string => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const getSeverityColor = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">My Software</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your organization's software inventory to receive personalized vulnerability alerts
        </p>
      </div>

      {/* Software Inventory Card */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInventoryCollapsed(!isInventoryCollapsed)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg 
                className={`w-4 h-4 text-gray-500 transition-transform ${isInventoryCollapsed ? '-rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Software Inventory ({softwareList.length})
            </h3>
          </div>
          {permissions.canManageSoftwareInventory && (
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : (softwareList.length > 0 ? 'Edit' : '+ Add Software')}
            </Button>
          )}
        </div>

        {!isInventoryCollapsed && (
          <>
            {/* Add Software Form */}
            {showAddForm && permissions.canManageSoftwareInventory && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add Software (comma-separated)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSoftware}
                    onChange={(e) => setNewSoftware(e.target.value)}
                    placeholder="e.g., Microsoft Office, Adobe Photoshop, Google Chrome, WordPress"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <Button onClick={addSoftware} disabled={!newSoftware.trim()}>
                    Add
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Examples: "Microsoft Windows", "Apache Tomcat", "WordPress", "Cisco IOS"
                </p>
              </div>
            )}

            {/* Search Bar */}
            {softwareList.length > 0 && (
              <div className="mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search your software..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Software List */}
            {filteredSoftware.length > 0 ? (
              <div className="space-y-2">
                {filteredSoftware.map((software) => (
                  <div key={software} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {software}
                      </span>
                    </div>
                    {permissions.canManageSoftwareInventory && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSoftware(software)}
                        className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-red-800"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : softwareList.length > 0 && searchTerm ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                <p>No software found matching "{searchTerm}"</p>
              </div>
            ) : softwareList.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No software added yet</p>
                <p className="text-sm">Add your organization's software to get personalized vulnerability alerts</p>
              </div>
            ) : null}
          </>
        )}
      </Card>

      {/* Relevant CVEs Card */}
      {softwareList.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Vulnerabilities Potentially Affecting Your Software:
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Scanning for relevant vulnerabilities...</p>
            </div>
          ) : matchingCVEs.length > 0 ? (
            <div className="space-y-4">
              {matchingCVEs.slice(0, 10).map((cve) => {
                const cvssScore = cve.cvss3?.score || cve.cvss || 0;
                const severityLabel = getSeverityLabel(cvssScore);
                const affectedSoftware = softwareList.filter(software => {
                  const summary = cve.summary.toLowerCase();
                  return summary.includes(software.toLowerCase());
                });

                return (
                  <div key={cve.cve} className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{cve.cve}</h4>
                        <Badge variant={getSeverityColor(cvssScore)}>
                          {severityLabel} {cvssScore.toFixed(1)}
                        </Badge>
                        {cve.kev && (
                          <Badge variant="critical">
                            ACTIVELY EXPLOITED
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                        Potentially impacts: 
                      </p>
                      <div className="flex gap-1">
                        {affectedSoftware.map((software) => (
                          <span key={software} className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded">
                            {software}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                      {cve.summary}
                    </p>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Published: {new Date(cve.published).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
              {matchingCVEs.length > 10 && (
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                  +{matchingCVEs.length - 10} more vulnerabilities found. Consider updating your software.
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No vulnerabilities found affecting your software</p>
              <p className="text-sm">Great! Your software appears to be secure based on current CVE data.</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default MySoftwarePage; 