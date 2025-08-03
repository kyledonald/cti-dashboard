import React from 'react';

export const CVELoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">CVEs</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Monitor Common Vulnerabilities and Exposures</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">Loading CVEs...</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Fetching latest vulnerabilities from Shodan</p>
        </div>
      </div>
    </div>
  );
}; 