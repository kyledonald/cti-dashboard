import React from 'react';

export const DashboardHeader: React.FC = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Your organization's security at a glance</p>
    </div>
  );
}; 