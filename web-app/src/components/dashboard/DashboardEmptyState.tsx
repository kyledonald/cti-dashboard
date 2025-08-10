import React from 'react';

export const DashboardEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No high priority incidents</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Great! No critical or high priority incidents are currently active.</p>
    </div>
  );
}; 
