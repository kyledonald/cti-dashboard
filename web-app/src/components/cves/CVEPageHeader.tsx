import React from 'react';

interface CVEPageHeaderProps {
  lastUpdated: Date | null;
  showKevOnly: boolean;
  minCvssScore: number;
  sortBy: 'severity' | 'date';
  onFilterChange: (value: string) => void;
  onSortChange: (value: 'severity' | 'date') => void;
}

export const CVEPageHeader: React.FC<CVEPageHeaderProps> = ({
  lastUpdated,
  showKevOnly,
  minCvssScore,
  sortBy,
  onFilterChange,
  onSortChange
}) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Critical Vulnerabilities</h2>
        {lastUpdated && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="cvss-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority:
          </label>
          <select
            id="cvss-filter"
            value={showKevOnly ? 'kev' : minCvssScore.toString()}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="kev">Known Exploited Only</option>
            <option value={9.0}>Critical (9.0+)</option>
            <option value={8.0}>High Priority (8.0+)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as 'severity' | 'date')}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="severity">Severity (High to Low)</option>
            <option value="date">Date (Newest First)</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 
