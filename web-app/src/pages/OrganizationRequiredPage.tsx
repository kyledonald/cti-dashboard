import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationRequiredCard } from '../components/organization-required/OrganizationRequiredCard';

const OrganizationRequiredPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <OrganizationRequiredCard
        userEmail={user?.email || ''}
        userRole={user?.role || ''}
        organizationId={user?.organizationId || null}
      />
    </div>
  );
};

export default OrganizationRequiredPage; 
