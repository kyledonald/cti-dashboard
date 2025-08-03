import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface ThreatActorPageHeaderProps {
  permissions: {
    canManageThreatActors: boolean;
  };
  onAddThreatActor: () => void;
}

export const ThreatActorPageHeader: React.FC<ThreatActorPageHeaderProps> = ({
  permissions,
  onAddThreatActor
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Threat Actors
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create and track cyber threat actors
        </p>
      </div>
      {permissions.canManageThreatActors && (
        <Button onClick={onAddThreatActor} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Threat Actor
        </Button>
      )}
    </div>
  );
}; 
