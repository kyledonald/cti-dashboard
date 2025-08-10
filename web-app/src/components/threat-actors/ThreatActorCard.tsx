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
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-300 dark:hover:border-blue-600 flex flex-col h-full">
      {/* Country Flag Corner */}
      <div className="absolute top-2 right-2 text-2xl opacity-80">
        {getCountryFlag(actor.country || 'Unknown')}
      </div>
      <CardContent className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-8">
            {actor.name}
          </h3>
          {/* Risk Score */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk:</span>
            <Badge className={`${getRiskColor(riskScore)} bg-transparent border`}>
              {getRiskLevel(riskScore)} ({riskScore}/10)
            </Badge>
          </div>
          {/* Status */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-2 h-2 rounded-full ${actor.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {actor.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {/* Sophistication & Resource Level */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Sophistication</span>
            <Badge className={`text-xs ${getSophisticationColor(actor.sophistication || 'Unknown')}`}>{actor.sophistication || 'Unknown'}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Resources</span>
            <Badge className={`text-xs ${getResourceLevelColor(actor.resourceLevel || 'Unknown')}`}>{actor.resourceLevel || 'Unknown'}</Badge>
          </div>
        </div>
        {/* Description */}
        {actor.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{actor.description}</p>
        )}
        {/* Aliases */}
        {actor.aliases && actor.aliases.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Aliases:</p>
            <div className="flex flex-wrap gap-1">
              {actor.aliases.slice(0, 3).map((alias, index) => (
                <Badge key={index} variant="outline" className="text-xs">{alias}</Badge>
              ))}
              {actor.aliases.length > 3 && (
                <Badge variant="outline" className="text-xs">+{actor.aliases.length - 3} more</Badge>
              )}
            </div>
          </div>
        )}
        {/* Primary Targets */}
        {actor.primaryTargets && actor.primaryTargets.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Targets:</p>
            <div className="flex flex-wrap gap-1">
                          {actor.primaryTargets.slice(0, 2).map((target, index) => (
              <Badge key={index} variant="outline" className="text-xs">{target}</Badge>
            ))}
              {actor.primaryTargets.length > 2 && (
                <Badge variant="outline" className="text-xs">+{actor.primaryTargets.length - 2} more</Badge>
              )}
            </div>
          </div>
        )}
        {/* Last Seen */}
        {actor.lastSeen && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Last seen: {new Date(actor.lastSeen).toLocaleDateString()}</p>
        )}
        {/* Action Buttons - always at bottom */}
        <div className="flex gap-2 mt-auto pt-4">
          {permissions.canManageThreatActors && (
            <>
              <Button variant="outline" size="sm" onClick={() => onEdit(actor)} className="flex-1"><Edit className="w-3 h-3 mr-1" />Edit</Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(actor)} className="px-2"><Trash2 className="w-3 h-3" /></Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 
