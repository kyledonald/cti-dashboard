import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { incidentsApi, usersApi, threatActorsApi, type Incident, type CreateIncidentDTO, type UpdateIncidentDTO, type User, type ThreatActor } from '../api';
import { Card, CardContent } from '../components/ui/card';

import { ConfirmDialog } from '../components/ConfirmDialog';

import { IncidentSwimlane } from '../components/incidents/IncidentSwimlane';
import { IncidentPageHeader } from '../components/incidents/IncidentPageHeader';
import { IncidentErrorMessage } from '../components/incidents/IncidentErrorMessage';
import { CreateIncidentModal } from '../components/incidents/CreateIncidentModal';
import { ViewIncidentModal } from '../components/incidents/ViewIncidentModal';
import { AISummaryModal } from '../components/incidents/AISummaryModal';
import { EditIncidentModal } from '../components/incidents/EditIncidentModal';
import { useIncidentStyling } from '../components/incidents/hooks/useIncidentStyling';
import { useCommentManagement } from '../components/incidents/hooks/useCommentManagement';
import { useNotificationService } from '../components/incidents/hooks/useNotificationService';
import { useDragAndDrop } from '../components/incidents/hooks/useDragAndDrop';
import { useAISummary } from '../components/incidents/hooks/useAISummary';
import { usePDFExport } from '../components/incidents/hooks/usePDFExport';
import 'jspdf-autotable';
import { useLocation } from 'react-router-dom';

const IncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();
  const { getPriorityColor, getStatusColor } = useIncidentStyling();
  const { sendAssignmentNotification, sendCommentNotification } = useNotificationService({ user });
  
  // State management
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);

  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingIncident, setViewingIncident] = useState<Incident | null>(null);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);
  const [showDeleteCommentConfirm, setShowDeleteCommentConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<{ incidentId: string; commentId: string } | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    status: 'Open' as 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed',
    type: '',
    assignedToUserId: '',
    cveIds: [] as string[],
    threatActorIds: [] as string[],
    resolutionNotes: ''
  });
  
  // Comment states
  const [cveInput, setCveInput] = useState('');
  const [cveError, setCveError] = useState('');
  
  // Error and loading states
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Drag and drop hook
  const { handleDragStart, handleDragOver, handleDrop } = useDragAndDrop({
    permissions,
    incidents,
    setIncidents,
    setError
  });

  // AI Summary hook
  const {
    aiSummary,
    generatingSummary,
    showAiSummary,
    setShowAiSummary,
    handleGenerateAISummary,
    closeAiSummary
  } = useAISummary({
    viewingIncident,
    users,
    threatActors,
    setError,
    onError: () => setShowViewModal(false) // Close the modal when there's an error
  });

  // PDF Export hook
  const { exportToPDF } = usePDFExport({
    viewingIncident,
    aiSummary
  });

  // Define swimlane statuses
  const swimlaneStatuses: Array<'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed'> = [
    'Open', 'Triaged', 'In Progress', 'Resolved', 'Closed'
  ];

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Load incidents, users, and threat actors in parallel (AI reports will be loaded separately)
        const [incidentsData, usersData, threatActorsData] = await Promise.all([
          incidentsApi.getAll(),
          usersApi.getAll(),
          threatActorsApi.getAll()
        ]);

        // Filter incidents by organization
        const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
        setIncidents(orgIncidents);

       // Filter users by organization
       const orgUsers = usersData.filter((u: User) => u.organizationId === user?.organizationId);
        setUsers(orgUsers);

       // Filter threat actors by organization (when organizationId is available)
       // If organizationId is not set on threat actors, show all (for backwards compatibility)
       const orgThreatActors = threatActorsData.filter((ta: ThreatActor) => 
         !ta.organizationId || ta.organizationId === user?.organizationId
       );
       setThreatActors(orgThreatActors);


      } catch (error) {
        // Only log errors that are not timeouts
        const err = error as any;
        if (!(err.code === 'ECONNABORTED' || (typeof err.message === 'string' && err.message.includes('timeout')))) {
          console.error('Error loading incidents data:', error);
        }
        setError('Failed to load incidents data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.organizationId]);

  // Check for CVE data from navigation and auto-open create modal
  useEffect(() => {
    const cveData = sessionStorage.getItem('createIncidentFromCVE');
    if (cveData) {
      try {
        const parsedData = JSON.parse(cveData);
        
        // Pre-fill form with CVE data
        setFormData({
          title: `Security Incident: ${parsedData.cveId}`,
          description: parsedData.description,
          priority: parsedData.cvssScore >= 9.0 ? 'Critical' : 'High',
          status: 'Open',
          type: parsedData.isKev ? 'Known Exploited Vulnerability' : 'Vulnerability',
          assignedToUserId: '',
          cveIds: [parsedData.cveId],
          threatActorIds: [],
          resolutionNotes: ''
        });
        
        // Set CVE input for display
        setCveInput(parsedData.cveId);
        
        // Open the create modal
        setShowCreateModal(true);
        
        // Clear the session storage
        sessionStorage.removeItem('createIncidentFromCVE');
      } catch (error) {
        console.error('Error parsing CVE data from session storage:', error);
        sessionStorage.removeItem('createIncidentFromCVE');
      }
    }
  }, [user?.organizationId]);

  // Auto-open incident modal if ?view=INCIDENT_ID or ?incidentId=INCIDENT_ID is present in the URL
  useEffect(() => {
    if (!incidents.length) return;
    const params = new URLSearchParams(location.search);
    const viewId = params.get('view') || params.get('incidentId');
    if (viewId) {
      const incident = incidents.find(i => i.incidentId === viewId);
      if (incident) {
        openViewModal(incident);
        // Clear the URL parameter to prevent reopening on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('view');
        newUrl.searchParams.delete('incidentId');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
    // Only run when incidents or location.search changes
  }, [incidents, location.search]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Open',
      type: '',
      assignedToUserId: '',
      cveIds: [],
      threatActorIds: [],
      resolutionNotes: ''
    });
    setCveInput('');
    setCveError('');
    setError('');
  };

  // Comment management hook
  const {
    newComment,
    setNewComment,
    submittingComment,
    handleAddComment,
    handleDeleteComment,
    formatCommentTime
  } = useCommentManagement({
    user,
    users,
    setIncidents,
    viewingIncident,
    setViewingIncident,
    setError,
    sendCommentNotification
  });

  // CRUD operations
  const handleCreateIncident = async () => {
    if (!user?.organizationId || !formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const assignedUser = users.find(u => u.userId === formData.assignedToUserId);
      
      const newIncidentData: CreateIncidentDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: 'Open',
        priority: formData.priority,
        type: formData.type.trim() || null,
        cveIds: formData.cveIds,
        threatActorIds: formData.threatActorIds,
        reportedByUserId: user.userId,
        reportedByUserName: `${user.firstName} ${user.lastName}`,
        organizationId: user.organizationId
      };

      const response = await incidentsApi.create(newIncidentData);
      const createdIncident = response.incident || response;
      
      // If assigned to someone, update the incident with assignment
      if (assignedUser && createdIncident?.incidentId) {
        await incidentsApi.update(createdIncident.incidentId, {
          assignedToUserId: assignedUser.userId,
          assignedToUserName: `${assignedUser.firstName} ${assignedUser.lastName}`
        });

        // Send assignment notification
        sendAssignmentNotification(assignedUser, {
          incidentId: createdIncident.incidentId,
          title: formData.title.trim()
        }, true);
      }

       // Reload incidents
       const incidentsData = await incidentsApi.getAll();
       const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
       setIncidents(orgIncidents);

       setShowCreateModal(false);
       resetForm();
    } catch (error) {
      console.error('Error creating incident:', error);
      setError('Failed to create incident');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditIncident = async () => {
    if (!editingIncident || !formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const assignedUser = users.find(u => u.userId === formData.assignedToUserId);
      const previousAssignedUserId = editingIncident.assignedToUserId;
      const newAssignedUserId = assignedUser?.userId || null;
      
      const updateData: UpdateIncidentDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        type: formData.type.trim() || null,
        cveIds: formData.cveIds,
        threatActorIds: formData.threatActorIds,
        resolutionNotes: formData.resolutionNotes.trim() || null,
        assignedToUserId: newAssignedUserId,
        assignedToUserName: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : null
      };

      await incidentsApi.update(editingIncident.incidentId, updateData);

      // Send notification if assignment changed and there's a new assignee
      if (previousAssignedUserId !== newAssignedUserId && assignedUser) {
        const isNewAssignment = !previousAssignedUserId; // true if previously unassigned
        sendAssignmentNotification(assignedUser, {
          incidentId: editingIncident.incidentId,
          title: formData.title.trim()
        }, isNewAssignment);
      }

       // Reload incidents
       const incidentsData = await incidentsApi.getAll();
       const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
       setIncidents(orgIncidents);

       setShowEditModal(false);
       setEditingIncident(null);
       resetForm();
    } catch (error) {
      console.error('Error updating incident:', error);
      setError('Failed to update incident');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIncident = async () => {
    if (!incidentToDelete) return;

    try {
      await incidentsApi.delete(incidentToDelete.incidentId);
      
      // Remove from local state
      setIncidents(incidents.filter(inc => inc.incidentId !== incidentToDelete.incidentId));
      
      setShowDeleteConfirm(false);
      setIncidentToDelete(null);
    } catch (error) {
      console.error('Error deleting incident:', error);
      setError('Failed to delete incident');
    }
  };

  // Handle "Assign to Me" in modals
  const handleAssignToMeInModal = () => {
    if (!user) return;
    
    setFormData({
      ...formData,
      assignedToUserId: user.userId
    });
  };

  // Modal handlers
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openViewModal = (incident: Incident) => {
    setViewingIncident(incident);
    setShowViewModal(true);
  };

  const openEditModal = (incident: Incident) => {
    setEditingIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description,
      priority: incident.priority,
      status: incident.status,
      type: incident.type || '',
      assignedToUserId: incident.assignedToUserId || '',
      cveIds: incident.cveIds || [],
      threatActorIds: incident.threatActorIds || [],
      resolutionNotes: incident.resolutionNotes || ''
    });
    setCveInput((incident.cveIds || []).join(', '));
    setCveError('');
    setError('');
    setShowViewModal(false); // Close view modal
    setShowEditModal(true);
  };

  const openDeleteConfirm = (incident: Incident) => {
    setIncidentToDelete(incident);
    setShowViewModal(false); // Close view modal
    setShowDeleteConfirm(true);
  };

  const openDeleteCommentConfirm = (incidentId: string, commentId: string) => {
    setCommentToDelete({ incidentId, commentId });
    setShowDeleteCommentConfirm(true);
  };

  const handleDeleteCommentConfirm = async () => {
    if (commentToDelete) {
      await handleDeleteComment(commentToDelete.incidentId, commentToDelete.commentId);
      setShowDeleteCommentConfirm(false);
      setCommentToDelete(null);
    }
  };

  // Permission check
  if (!permissions.canViewIncidents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to view incidents.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <IncidentPageHeader
        canCreateIncidents={permissions.canCreateIncidents}
        onCreateClick={openCreateModal}
      />

      {/* Error message */}
      <IncidentErrorMessage error={error} />

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-x-auto">
        {swimlaneStatuses.map((status) => {
          const statusIncidents = incidents.filter(inc => inc.status === status);
          
          return (
            <IncidentSwimlane
              key={status}
              status={status}
              incidents={statusIncidents}
              canEdit={permissions.canEditIncidents}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openViewModal}
              getPriorityColor={getPriorityColor}
              getStatusColor={getStatusColor}
            />
          );
        })}
      </div>

      {/* Create Incident Modal */}
      <CreateIncidentModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        formData={formData}
        setFormData={setFormData}
        cveInput={cveInput}
        setCveInput={setCveInput}
        cveError={cveError}
        setCveError={setCveError}
        users={users}
        threatActors={threatActors}
        error={error}
        submitting={submitting}
        onAssignToMe={handleAssignToMeInModal}
        onCreate={handleCreateIncident}
        onCancel={() => {
          setShowCreateModal(false);
          resetForm();
        }}
      />

      {/* View Incident Modal */}
      <ViewIncidentModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        incident={viewingIncident}
        user={user}
        threatActors={threatActors}
        permissions={permissions}
        newComment={newComment}
        setNewComment={setNewComment}
        submittingComment={submittingComment}
        generatingSummary={generatingSummary}
        getPriorityColor={getPriorityColor}
        getStatusColor={getStatusColor}
        formatCommentTime={formatCommentTime}
        onAddComment={handleAddComment}
        onDeleteComment={openDeleteCommentConfirm}
        onEdit={openEditModal}
        onDelete={openDeleteConfirm}
        onGenerateAISummary={handleGenerateAISummary}
        onClose={() => setShowViewModal(false)}
      />

      {/* AI Summary Modal */}
      <AISummaryModal
        open={showAiSummary}
        onOpenChange={setShowAiSummary}
        aiSummary={aiSummary}
        onClose={closeAiSummary}
        onCopyToClipboard={() => {
          navigator.clipboard.writeText(aiSummary);
          alert('AI Summary copied to clipboard!');
        }}
        onExportPDF={exportToPDF}
      />

      {/* Edit Incident Modal */}
      <EditIncidentModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        editingIncident={editingIncident}
        formData={formData}
        setFormData={setFormData}
        cveInput={cveInput}
        setCveInput={setCveInput}
        cveError={cveError}
        setCveError={setCveError}
        users={users}
        threatActors={threatActors}
        error={error}
        submitting={submitting}
        onAssignToMe={handleAssignToMeInModal}
        onEdit={handleEditIncident}
        onCancel={() => {
          setShowEditModal(false);
          setEditingIncident(null);
          resetForm();
        }}
        onBackToView={() => {
          setShowEditModal(false);
          setEditingIncident(null);
          resetForm();
          // Go back to view modal
          if (editingIncident) {
            setViewingIncident(editingIncident);
            setShowViewModal(true);
          }
        }}
      />

             {/* Delete Confirmation Dialog */}
       <ConfirmDialog
         open={showDeleteConfirm}
         onOpenChange={(open) => {
           setShowDeleteConfirm(open);
           if (!open) {
             setIncidentToDelete(null);
           }
         }}
         title="Delete Incident"
         message={`Are you sure you want to delete "${incidentToDelete?.title}"? This action cannot be undone.`}
         confirmText="Delete"
         variant="destructive"
         icon="delete"
         onConfirm={handleDeleteIncident}
       />

       {/* Delete Comment Confirmation Dialog */}
       <ConfirmDialog
         open={showDeleteCommentConfirm}
         onOpenChange={(open) => {
           setShowDeleteCommentConfirm(open);
           if (!open) {
             setCommentToDelete(null);
           }
         }}
         title="Delete Comment"
         message="Are you sure you want to delete this comment? This action cannot be undone."
         confirmText="Delete"
         variant="destructive"
         icon="delete"
         onConfirm={handleDeleteCommentConfirm}
       />
    </div>
  );
};

export default IncidentsPage; 
