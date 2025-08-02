import React from 'react';
import { Button } from '../ui/button';

interface IncidentPageHeaderProps {
  canCreateIncidents: boolean;
  onCreateClick: () => void;
}

export const IncidentPageHeader: React.FC<IncidentPageHeaderProps> = ({
  canCreateIncidents,
  onCreateClick
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Security Incidents
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track and manage security incidents in your organization
        </p>
      </div>
      {canCreateIncidents && (
        <Button onClick={onCreateClick} className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Incident
        </Button>
      )}
    </div>
  );
}; 