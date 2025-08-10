import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { type Incident } from '../../api';

interface IncidentCardProps {
  incident: Incident;
  canEdit: boolean;
  onDragStart: (e: React.DragEvent, incident: Incident) => void;
  onClick: (incident: Incident) => void;
  getPriorityColor: (priority: string) => string;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  canEdit,
  onDragStart,
  onClick,
  getPriorityColor
}) => {
  return (
    <Card
      className={`${canEdit ? 'cursor-move' : 'cursor-pointer'} hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200`}
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, incident)}
      onClick={() => onClick(incident)}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 leading-relaxed">
              {incident.title}
            </h4>
          </div>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {incident.description}
          </p>

          {/* Priority and Badges */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={`text-xs px-2 py-1 ${getPriorityColor(incident.priority)}`}>
                {incident.priority}
              </Badge>
            </div>
            
            {/* Info badges */}
            <div className="flex gap-2 flex-wrap">
              {incident.cveIds && incident.cveIds.length > 0 && (
                <Badge variant="outline" className="text-xs px-2 py-1">
                  {incident.cveIds.length} CVE{incident.cveIds.length > 1 ? 's' : ''}
                </Badge>
              )}
              {incident.threatActorIds && incident.threatActorIds.length > 0 && (
                <Badge variant="outline" className="text-xs px-2 py-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                  {incident.threatActorIds.length} Actor{incident.threatActorIds.length > 1 ? 's' : ''}
                </Badge>
              )}
              {((incident.resolutionComments && incident.resolutionComments.length > 0) || (incident.resolutionNotes && incident.resolutionNotes.trim())) && (
                <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                  {incident.resolutionComments && incident.resolutionComments.length > 0 
                    ? `${incident.resolutionComments.length} Comment${incident.resolutionComments.length > 1 ? 's' : ''}`
                    : 'Analyst Notes'
                  }
                </Badge>
              )}
            </div>
          </div>

          {/* Assignment */}
          <div className="flex items-center gap-2 text-xs pt-2 border-t border-gray-100 dark:border-gray-700">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {incident.assignedToUserName ? (
              <span className="text-gray-600 dark:text-gray-400">
                Assigned to {incident.assignedToUserName}
              </span>
            ) : (
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                Unassigned
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
