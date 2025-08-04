import React from 'react';

export const UsersLoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading organization users...</p>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </div>
  );
}; 