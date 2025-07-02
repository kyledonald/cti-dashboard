import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const OrganizationRequiredPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m0 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
            </svg>
          </div>
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            Organization Assignment Required
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            You must be assigned to an organization to access this content.
          </p>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Current Status:
            </h3>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Role:</strong> {user?.role}</div>
              <div><strong>Organization:</strong> {user?.organizationId || 'Not assigned'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationRequiredPage; 