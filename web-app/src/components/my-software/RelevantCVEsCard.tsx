import React from 'react';
import { Card } from '../ui/card';
import { CVECard } from './CVECard';
import type { ShodanCVE } from '../../api';

interface RelevantCVEsCardProps {
  softwareList: string[];
  matchingCVEs: ShodanCVE[];
  loading: boolean;
  getSeverityLabel: (score: number) => string;
  getSeverityColor: (score: number) => 'critical' | 'high' | 'medium' | 'low';
}

export const RelevantCVEsCard: React.FC<RelevantCVEsCardProps> = ({
  softwareList,
  matchingCVEs,
  loading,
  getSeverityLabel,
  getSeverityColor,
}) => {
  if (softwareList.length === 0) {
    return null;
  }

  return (
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
          {matchingCVEs.slice(0, 10).map((cve) => (
            <CVECard
              key={cve.cve}
              cve={cve}
              softwareList={softwareList}
              getSeverityLabel={getSeverityLabel}
              getSeverityColor={getSeverityColor}
            />
          ))}
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
  );
}; 
