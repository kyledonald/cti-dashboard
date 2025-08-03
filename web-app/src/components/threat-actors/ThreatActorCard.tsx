import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { type ThreatActor } from '../../api';

interface ThreatActorCardProps {
  actor: ThreatActor;
  permissions: {
    canManageThreatActors: boolean;
  };
  getSophisticationColor: (sophistication: string) => string;
  getResourceLevelColor: (resourceLevel: string) => string;
  getRiskColor: (score: number) => string;
  getRiskLevel: (score: number) => string;
  calculateRiskScore: (actor: ThreatActor) => number;
  getCountryFlag: (country: string) => string;
  onEdit: (actor: ThreatActor) => void;
  onDelete: (actor: ThreatActor) => void;
}

export const ThreatActorCard: React.FC<ThreatActorCardProps> = ({
  actor,
  permissions,
  getSophisticationColor,
  getResourceLevelColor,
  getRiskColor,
  getRiskLevel,
  calculateRiskScore,
  getCountryFlag,
  onEdit,
  onDelete
}) => {
  const riskScore = calculateRiskScore(actor);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header with name and country */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {actor.name}
              </h3>
              {actor.country && (
                <span className="text-lg" title={actor.country}>
                  {getCountryFlag(actor.country)}
                </span>
              )}
            </div>
            {actor.aliases && actor.aliases.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AKA: {actor.aliases.slice(0, 2).join(', ')}
                {actor.aliases.length > 2 && ` +${actor.aliases.length - 2} more`}
              </p>
            )}
          </div>
          
          {/* Risk Score Badge */}
          <Badge className={`${getRiskColor(riskScore)} text-xs font-medium`}>
            {getRiskLevel(riskScore)}
          </Badge>
        </div>

        {/* Description */}
        {actor.description && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-3">
            {actor.description}
          </p>
        )}

        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {actor.sophistication && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Sophistication
              </p>
              <Badge className={`${getSophisticationColor(actor.sophistication)} text-xs mt-1`}>
                {actor.sophistication}
              </Badge>
            </div>
          )}
          
          {actor.resourceLevel && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Resources
              </p>
              <Badge className={`${getResourceLevelColor(actor.resourceLevel)} text-xs mt-1`}>
                {actor.resourceLevel}
              </Badge>
            </div>
          )}
        </div>

        {/* Additional Details */}
        <div className="space-y-2 mb-4">
          {actor.motivation && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Motivation
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {actor.motivation}
              </p>
            </div>
          )}
          
          {actor.primaryTargets && actor.primaryTargets.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Primary Targets
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {actor.primaryTargets.slice(0, 3).join(', ')}
                {actor.primaryTargets.length > 3 && ` +${actor.primaryTargets.length - 3} more`}
              </p>
            </div>
          )}
        </div>

        {/* Status and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${actor.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {actor.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          {permissions.canManageThreatActors && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(actor)}
                className="h-8 px-3"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(actor)}
                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 