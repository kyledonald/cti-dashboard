import React from 'react';

interface UsersPageHeaderProps {
  totalUsers: number;
  adminCount: number;
}

export const UsersPageHeader: React.FC<UsersPageHeaderProps> = ({
  totalUsers,
  adminCount,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and filter users in your organization
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          To manage users in your org and their roles, visit the organization page as an admin.
        </p>
      </div>
      
      {/* Stats */}
      <div className="flex items-center space-x-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{adminCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Admins</div>
        </div>
      </div>
    </div>
  );
}; 
