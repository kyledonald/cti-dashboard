import React from 'react';
import { Button } from '../ui/button';

interface SoftwareListProps {
  filteredSoftware: string[];
  softwareList: string[];
  searchTerm: string;
  canManageSoftwareInventory: boolean;
  onRemoveSoftware: (software: string) => void;
}

export const SoftwareList: React.FC<SoftwareListProps> = ({
  filteredSoftware,
  softwareList,
  searchTerm,
  canManageSoftwareInventory,
  onRemoveSoftware,
}) => {
  if (filteredSoftware.length > 0) {
    return (
      <div className="space-y-2">
        {filteredSoftware.map((software) => (
          <div key={software} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {software}
              </span>
            </div>
            {canManageSoftwareInventory && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveSoftware(software)}
                className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-red-800"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (softwareList.length > 0 && searchTerm) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p>No software found matching "{searchTerm}"</p>
      </div>
    );
  }

  if (softwareList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p>No software added yet</p>
        <p className="text-sm">Add your organization's software to get personalized vulnerability alerts</p>
      </div>
    );
  }

  return null;
}; 
