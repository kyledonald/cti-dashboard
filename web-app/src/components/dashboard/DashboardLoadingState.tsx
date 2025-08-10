import React from 'react';

interface DashboardLoadingStateProps {
  skeletonCount?: number;
}

export const DashboardLoadingState: React.FC<DashboardLoadingStateProps> = ({
  skeletonCount = 3
}) => {
  return (
    <div className="space-y-4">
      {[...Array(skeletonCount)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}; 
