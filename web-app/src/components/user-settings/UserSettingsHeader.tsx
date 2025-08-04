import React from 'react';

export const UserSettingsHeader: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Account Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Manage your profile information, security settings, and account preferences.
      </p>
    </div>
  );
}; 