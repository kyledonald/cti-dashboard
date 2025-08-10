import React from 'react';

interface OrganizationPageHeaderProps {
  organization: any;
}

export const OrganizationPageHeader: React.FC<OrganizationPageHeaderProps> = ({ organization }) => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {organization ? 'Organization Management' : 'Create Your Organization'}
      </h1>
    </div>
  );
}; 
