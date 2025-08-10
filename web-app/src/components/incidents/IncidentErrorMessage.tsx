import React from 'react';

interface IncidentErrorMessageProps {
  error: string | null;
}

export const IncidentErrorMessage: React.FC<IncidentErrorMessageProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
    </div>
  );
}; 
