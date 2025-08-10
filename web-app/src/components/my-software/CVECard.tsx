import React from 'react';
import { Badge } from '../ui/badge';
import type { ShodanCVE } from '../../api';

interface CVECardProps {
  cve: ShodanCVE;
  softwareList: string[];
  getSeverityLabel: (score: number) => string;
  getSeverityColor: (score: number) => 'critical' | 'high' | 'medium' | 'low';
}

export const CVECard: React.FC<CVECardProps> = ({
  cve,
  softwareList,
  getSeverityLabel,
  getSeverityColor,
}) => {
  const cvssScore = cve.cvss3?.score || cve.cvss || 0;
  const severityLabel = getSeverityLabel(cvssScore);
  const affectedSoftware = softwareList.filter(software => {
    const summary = cve.summary.toLowerCase();
    return summary.includes(software.toLowerCase());
  });

  return (
    <div className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10">
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
}; 
