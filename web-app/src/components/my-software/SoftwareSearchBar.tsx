import React from 'react';

interface SoftwareSearchBarProps {
  softwareListLength: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SoftwareSearchBar: React.FC<SoftwareSearchBarProps> = ({
  softwareListLength,
  searchTerm,
  onSearchChange,
}) => {
  if (softwareListLength === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search your software..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}; 