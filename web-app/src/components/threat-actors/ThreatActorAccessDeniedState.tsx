import React from 'react';
import { Card, CardContent } from '../ui/card';

export const ThreatActorAccessDeniedState: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to view threat actors.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 