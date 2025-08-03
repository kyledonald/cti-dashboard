import React from 'react';

export const ThreatActorLoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-2xl mb-4">⏳</div>
        <p className="text-gray-600 dark:text-gray-400">Loading threat actors...</p>
      </div>
    </div>
  );
}; 