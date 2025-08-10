import React from 'react';
import { Badge } from '../ui/badge';
import { IncidentCard } from './IncidentCard';
import { type Incident } from '../../api';

interface IncidentSwimlaneProps {
  status: string;
  incidents: Incident[];
  canEdit: boolean;
  onDragStart: (e: React.DragEvent, incident: Incident) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onClick: (incident: Incident) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

export const IncidentSwimlane: React.FC<IncidentSwimlaneProps> = ({
  status,
  incidents,
  canEdit,
  onDragStart,
  onDragOver,
  onDrop,
  onClick,
  getPriorityColor,
  getStatusColor
}) => {
  return (
    <div
      className={`min-h-[28rem] rounded-lg border-2 border-dashed p-4 ${getStatusColor(status)}`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, status)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {status}
        </h3>
        <Badge variant="outline" className="text-xs">
          {incidents.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => (
          <IncidentCard
            key={incident.incidentId}
            incident={incident}
            canEdit={canEdit}
            onDragStart={onDragStart}
            onClick={onClick}
            getPriorityColor={getPriorityColor}
          />
        ))}
      </div>
    </div>
  );
}; 
