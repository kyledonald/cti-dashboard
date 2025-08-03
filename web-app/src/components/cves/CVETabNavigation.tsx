import React from 'react';

interface CVETabNavigationProps {
  activeTab: 'active' | 'nar';
  activeCount: number;
  dismissedCount: number;
  onTabChange: (tab: 'active' | 'nar') => void;
}

export const CVETabNavigation: React.FC<CVETabNavigationProps> = ({
  activeTab,
  activeCount,
  dismissedCount,
  onTabChange
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8">
        <button
          onClick={() => onTabChange('active')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'active'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          Active Vulnerabilities
          {activeTab !== 'active' && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('nar')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'nar'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          No Action Required
          {activeTab !== 'nar' && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              {dismissedCount}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};