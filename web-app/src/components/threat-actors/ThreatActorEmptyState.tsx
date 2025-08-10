import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface ThreatActorEmptyStateProps {
  searchTerm: string;
  permissions: {
    canManageThreatActors: boolean;
  };
  onAddThreatActor: () => void;
}

export const ThreatActorEmptyState: React.FC<ThreatActorEmptyStateProps> = ({
  searchTerm,
  permissions,
  onAddThreatActor
}) => {
  return (
    <Card className="p-12">
      <div className="text-center">
        <div className="text-6xl mb-4">🕵️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {searchTerm ? 'No threat actors found' : 'No threat actors yet'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {searchTerm 
            ? `No threat actors match "${searchTerm}". Try a different search term.`
            : 'Start building your threat intelligence by adding known threat actors.'
          }
        </p>
        {permissions.canManageThreatActors && !searchTerm && (
          <Button onClick={onAddThreatActor} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add First Threat Actor
          </Button>
        )}
      </div>
    </Card>
  );
}; 
