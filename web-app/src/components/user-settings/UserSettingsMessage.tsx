import React from 'react';

interface UserSettingsMessageProps {
  message: { type: 'success' | 'error', text: string } | null;
}

export const UserSettingsMessage: React.FC<UserSettingsMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className={`p-4 rounded-lg ${
      message.type === 'success' 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
    }`}>
      {message.text}
    </div>
  );
}; 