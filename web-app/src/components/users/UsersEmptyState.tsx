import React from 'react';
import { Users } from 'lucide-react';

interface UsersEmptyStateProps {
  hasUsers: boolean;
}

export const UsersEmptyState: React.FC<UsersEmptyStateProps> = ({ hasUsers }) => {
  return (
    <div className="text-center py-8">
      <Users className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {hasUsers ? 'No users match your filters' : 'No users found'}
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {hasUsers ? 'Try adjusting your search or filters.' : 'Add users to your organization to see them here.'}
      </p>
    </div>
  );
}; 
