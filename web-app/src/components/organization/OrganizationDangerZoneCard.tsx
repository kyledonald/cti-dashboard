import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface OrganizationDangerZoneCardProps {
  organization: any;
  onDeleteOrganization: () => void;
}

export const OrganizationDangerZoneCard: React.FC<OrganizationDangerZoneCardProps> = ({
  organization,
  onDeleteOrganization,
}) => {
  if (!organization) return null;

  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-red-700 dark:text-red-300 text-sm">
            These actions cannot be undone. Please be careful.
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={onDeleteOrganization}
              variant="outline" 
              className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              Delete Organization
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 