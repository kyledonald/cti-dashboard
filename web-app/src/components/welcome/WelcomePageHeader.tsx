import React from 'react';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

interface WelcomePageHeaderProps {
  userEmail: string;
  onSignOut: () => void;
}

export const WelcomePageHeader: React.FC<WelcomePageHeaderProps> = ({
  userEmail,
  onSignOut,
}) => {
  return (
    <div className="relative mb-12">
      {/* Sign Out Button */}
      <div className="absolute top-0 right-0 flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{userEmail}</p>
        </div>
        <Button
          onClick={onSignOut}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </Button>
      </div>
      
      {/* Centered Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to CTI Dashboard
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get started by creating your own organization below. Or, ask your admin to add your email to their organization!
        </p>
      </div>
    </div>
  );
}; 
