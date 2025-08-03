import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { type ShodanCVE } from '../../api';

interface CVECardProps {
  cve: ShodanCVE;
  activeTab: 'active' | 'nar';
  permissions: {
    canManageCVEs: boolean;
  };
  hasExistingIncident: (cveId: string) => boolean;
  onDismissCVE: (cveId: string) => void;
  onRestoreCVE: (cveId: string) => void;
  onCreateIncident: (cve: ShodanCVE) => void;
  getSeverityLabel: (score: number) => string;
  getSeverityVariant: (score: number) => 'critical' | 'high' | 'medium' | 'low';
  getSeverityBorderColor: (score: number) => string;
  formatDate: (dateString: string) => string;
}

export const CVECard: React.FC<CVECardProps> = ({
  cve,
  activeTab,
  permissions,
  hasExistingIncident,
  onDismissCVE,
  onRestoreCVE,
  onCreateIncident,
  getSeverityLabel,
  getSeverityVariant,
  getSeverityBorderColor,
  formatDate
}) => {
  const cvssScore = cve.cvss3?.score || cve.cvss || 0;
  const severityLabel = getSeverityLabel(cvssScore);

  return (
    <Card className={`p-6 hover:shadow-md transition-shadow border-l-4 ${getSeverityBorderColor(cvssScore)}`}>
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
                {hasExistingIncident(cve.cve) ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                    className="bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400"
                  >
                    Existing Incident for this CVE
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onCreateIncident(cve)}
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/30 dark:hover:border-green-600"
                  >
                    Create Incident
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDismissCVE(cve.cve)}
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 dark:hover:border-red-600"
                >
                  No Action Required
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onRestoreCVE(cve.cve)}
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
}; 