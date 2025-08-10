import { useState, useCallback } from 'react';
import { incidentsApi, type Incident, type UpdateIncidentDTO } from '../../../api';

interface UseDragAndDropProps {
  permissions: { canEditIncidents: boolean };
  incidents: Incident[];
  setIncidents: (incidents: Incident[]) => void;
  setError: (error: string) => void;
}

export const useDragAndDrop = ({
  permissions,
  incidents,
  setIncidents,
  setError
}: UseDragAndDropProps) => {
  const [draggedIncident, setDraggedIncident] = useState<Incident | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, incident: Incident) => {
    // Prevent viewers from dragging incidents
    if (!permissions.canEditIncidents) {
      e.preventDefault();
      return;
    }
    setDraggedIncident(incident);
    e.dataTransfer.effectAllowed = 'move';
  }, [permissions.canEditIncidents]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedIncident || draggedIncident.status === newStatus || !permissions.canEditIncidents) {
      setDraggedIncident(null);
      return;
    }

    try {
      const updateData: UpdateIncidentDTO = {
        status: newStatus as 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed'
      };

      await incidentsApi.update(draggedIncident.incidentId, updateData);

      // Update local state
      setIncidents(incidents.map(inc => 
        inc.incidentId === draggedIncident.incidentId 
          ? { ...inc, status: newStatus as any }
          : inc
      ));
    } catch (error) {
      console.error('Error updating incident status:', error);
      setError('Failed to update incident status');
    } finally {
      setDraggedIncident(null);
    }
  }, [draggedIncident, permissions.canEditIncidents, incidents, setIncidents, setError]);

  return {
    draggedIncident,
    handleDragStart,
    handleDragOver,
    handleDrop
  };
}; 
