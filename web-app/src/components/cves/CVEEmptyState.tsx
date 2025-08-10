import React from 'react';

interface CVEEmptyStateProps {
  activeTab: 'active' | 'nar';
}

export const CVEEmptyState: React.FC<CVEEmptyStateProps> = ({ activeTab }) => {
  return (
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
  );
}; 
