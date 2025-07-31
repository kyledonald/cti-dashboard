import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { incidentsApi, usersApi, threatActorsApi, generateAISummary, type Incident, type CreateIncidentDTO, type UpdateIncidentDTO, type User, type ThreatActor } from '../api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Badge } from '../components/ui/badge';
import { IncidentCard } from '../components/incidents/IncidentCard';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useLocation } from 'react-router-dom';

const IncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();
  
  // State management
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);

  const [loading, setLoading] = useState(true);
  const [draggedIncident, setDraggedIncident] = useState<Incident | null>(null);
  
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
  
  // AI Summary states
  const [aiSummary, setAiSummary] = useState<string>('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  
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
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [cveInput, setCveInput] = useState('');
  const [cveError, setCveError] = useState('');
  
  // Error and loading states
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  // Auto-open incident modal if ?view=INCIDENT_ID is present in the URL
  useEffect(() => {
    if (!incidents.length) return;
    const params = new URLSearchParams(location.search);
    const viewId = params.get('view');
    if (viewId) {
      const incident = incidents.find(i => i.incidentId === viewId);
      if (incident) {
        openViewModal(incident);
      }
    }
    // Only run when incidents or location.search changes
  }, [incidents, location.search]);

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-300';
      case 'Triaged': return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/10 dark:border-purple-800 dark:text-purple-300';
      case 'In Progress': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-800 dark:text-yellow-300';
      case 'Resolved': return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300';
      case 'Closed': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300';
      default: return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/10 dark:border-gray-800 dark:text-gray-300';
    }
  };

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

  // Helper function to add a comment
  const handleAddComment = async (incidentId: string) => {
    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await incidentsApi.addComment({
        incidentId,
        content: newComment.trim(),
        userId: user.userId,
        userName: `${user.firstName} ${user.lastName}`
      });
      
      // Reload incidents to get updated comments
      const incidentsData = await incidentsApi.getAll();
      const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
      setIncidents(orgIncidents);
      
      // Update viewing incident
      if (viewingIncident && viewingIncident.incidentId === incidentId) {
        const updatedIncident = orgIncidents.find(inc => inc.incidentId === incidentId);
        if (updatedIncident) {
          setViewingIncident(updatedIncident);
          
          // Send notification to assigned user if incident is assigned to someone else
          if (updatedIncident.assignedToUserId && updatedIncident.assignedToUserId !== user.userId) {
            const assignedUser = users.find(u => u.userId === updatedIncident.assignedToUserId);
            if (assignedUser) {
              sendCommentNotification(assignedUser, {
                incidentId: updatedIncident.incidentId,
                title: updatedIncident.title
              }, `${user.firstName} ${user.lastName}`);
            }
          }
        }
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Helper function to delete a comment
  const handleDeleteComment = async (incidentId: string, commentId: string) => {
    if (!user) return;

    try {
      await incidentsApi.deleteComment(incidentId, commentId, user.userId, user.role);
      
      // Reload incidents to get updated comments
      const incidentsData = await incidentsApi.getAll();
      const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
      setIncidents(orgIncidents);
      
      // Update viewing incident
      if (viewingIncident && viewingIncident.incidentId === incidentId) {
        const updatedIncident = orgIncidents.find(inc => inc.incidentId === incidentId);
        if (updatedIncident) {
          setViewingIncident(updatedIncident);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  // Helper function to format comment timestamp
  const formatCommentTime = (timestamp: any) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      let date: Date;
      
      // Handle Firestore Timestamp object (has toDate method)
      if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        date = timestamp.toDate();
      }
      // Handle serialized Firestore timestamp (has _seconds property)
      else if (typeof timestamp === 'object' && '_seconds' in timestamp) {
        date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
      }
      // Handle regular timestamp formats
      else {
        date = new Date(timestamp);
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Unknown time';
    }
  };

  // Helper function to send assignment notification
  const sendAssignmentNotification = (assignedUser: User, incident: { incidentId: string; title: string }, isNewAssignment: boolean = true) => {
    if (!user || !assignedUser || assignedUser.userId === user.userId) {
      // Don't send notification if assigning to yourself
      return;
    }

    const actionText = isNewAssignment ? 'assigned to' : 'reassigned to';
    const notificationTitle = `Incident Assignment`;
    const notificationMessage = `You have been ${actionText} incident "${incident.title}" (ID: ${incident.incidentId})`;

    // Send targeted notification to specific user
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'security' as const,
      title: notificationTitle,
      message: notificationMessage,
      timestamp: new Date(),
      read: false,
      priority: 'high' as const,
      organizationId: user.organizationId,
      sentBy: user.userId,
      actionUrl: '/incidents',
      actionText: 'View Incidents'
    };

    // Store notification specifically for the assigned user
    const userNotifications = JSON.parse(localStorage.getItem(`notifications-${assignedUser.userId}`) || '[]');
    userNotifications.unshift(newNotification);
    localStorage.setItem(`notifications-${assignedUser.userId}`, JSON.stringify(userNotifications));
  };

  // Helper function to send comment notification
  const sendCommentNotification = (assignedUser: User, incident: { incidentId: string; title: string }, commenterName: string) => {
    if (!user || !assignedUser || assignedUser.userId === user.userId) {
      // Don't send notification if commenting on your own assigned incident
      return;
    }

    const notificationTitle = `New Comment on Assigned Incident`;
    const notificationMessage = `${commenterName} has added a comment on your assigned incident "${incident.title}" (ID: ${incident.incidentId})`;

    // Send targeted notification to specific user
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'security' as const,
      title: notificationTitle,
      message: notificationMessage,
      timestamp: new Date(),
      read: false,
      priority: 'medium' as const,
      organizationId: user.organizationId,
      sentBy: user.userId,
      actionUrl: '/incidents',
      actionText: 'View Incidents'
    };

    // Store notification specifically for the assigned user
    const userNotifications = JSON.parse(localStorage.getItem(`notifications-${assignedUser.userId}`) || '[]');
    userNotifications.unshift(newNotification);
    localStorage.setItem(`notifications-${assignedUser.userId}`, JSON.stringify(userNotifications));
  };

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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, incident: Incident) => {
    // Prevent viewers from dragging incidents
    if (!permissions.canEditIncidents) {
      e.preventDefault();
      return;
    }
    setDraggedIncident(incident);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
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

  // AI Summary generation
  const handleGenerateAISummary = async () => {
    if (!viewingIncident) return;

    setGeneratingSummary(true);
    setError('');
    
    try {
      const summary = await generateAISummary(viewingIncident, users, threatActors);
      setAiSummary(summary);
      setShowAiSummary(true);
    } catch (error: any) {
      console.error('Error generating AI summary:', error);
      setError('Error: ' + error.message);
    } finally {
      setGeneratingSummary(false);
    }
  };

  const closeAiSummary = () => {
    setShowAiSummary(false);
    setAiSummary('');
  };

  // PDF Export function
  const exportToPDF = () => {
    if (!viewingIncident || !aiSummary) return;

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('AI Threat Intelligence Summary', 20, 20);
    
    // Add incident details
    doc.setFontSize(12);
    doc.text(`Incident: ${viewingIncident.title}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
    doc.text(`Generated by: CTI Dashboard AI`, 20, 55);
    
    // Add summary content
    doc.setFontSize(10);
    const splitText = doc.splitTextToSize(aiSummary, 170);
    doc.text(splitText, 20, 75);
    
    // Save the PDF
    doc.save(`ai-summary-${viewingIncident.incidentId}-${new Date().toISOString().split('T')[0]}.pdf`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Incidents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage security incidents in your organization
          </p>
        </div>
        {permissions.canCreateIncidents && (
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Incident
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-x-auto">
        {swimlaneStatuses.map((status) => {
          const statusIncidents = incidents.filter(inc => inc.status === status);
          
          return (
            <div
              key={status}
              className={`min-h-[28rem] rounded-lg border-2 border-dashed p-4 ${getStatusColor(status)}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {status}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {statusIncidents.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {statusIncidents.map((incident) => (
                  <IncidentCard
                    key={incident.incidentId}
                    incident={incident}
                    canEdit={permissions.canEditIncidents}
                    onDragStart={handleDragStart}
                    onClick={openViewModal}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Incident Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Create New Incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Brief description of the incident"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description of the security incident"
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assign To
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.assignedToUserId}
                  onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value})}
                  className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Unassigned</option>
                  {users.filter(user => user.role !== 'viewer').map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAssignToMeInModal}
                  className="h-10 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:border-blue-600"
                  title="Assign to me"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Incident Type
              </label>
              <Input
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                placeholder="e.g., Data Breach, Malware, Phishing, etc."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related CVEs
              </label>
              <Input
                value={cveInput}
                onChange={(e) => {
                  setCveInput(e.target.value);
                  setCveError(''); // Clear error when typing
                }}
                onBlur={() => {
                  // Parse and validate CVEs when user finishes typing
                  setCveError('');
                  const cveInputs = cveInput.split(',').map(cve => cve.trim()).filter(cve => cve.length > 0);
                  const validCves: string[] = [];
                  const invalidCves: string[] = [];
                  
                  cveInputs.forEach(cve => {
                    // Validate CVE format: CVE-YYYY-NNNN or CVE-YYYY-NNNNN
                    const cvePattern = /^CVE-\d{4}-\d{4,5}$/i;
                    if (cvePattern.test(cve)) {
                      validCves.push(cve.toUpperCase());
                    } else {
                      invalidCves.push(cve);
                    }
                  });
                  
                  if (invalidCves.length > 0) {
                    setCveError(`Invalid CVE format: ${invalidCves.join(', ')}. Please use format CVE-YYYY-NNNN or CVE-YYYY-NNNNN`);
                  }
                  
                  setFormData({...formData, cveIds: validCves});
                }}
                placeholder="CVE-2024-1234, CVE-2024-56789"
                className="w-full"
              />
              {cveError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {cveError}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter CVE IDs separated by commas (format: CVE-YYYY-NNNN or CVE-YYYY-NNNNN)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Threat Actors
              </label>
              <div className="max-h-32 overflow-y-auto border border-input rounded-md p-3 bg-background">
                {threatActors.length > 0 ? (
                  <div className="space-y-2">
                    {threatActors.map((actor) => (
                      <label key={actor.threatActorId} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.threatActorIds.includes(actor.threatActorId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                threatActorIds: [...formData.threatActorIds, actor.threatActorId]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                threatActorIds: formData.threatActorIds.filter(id => id !== actor.threatActorId)
                              });
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{actor.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No threat actors available</p>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select threat actors associated with this incident
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateIncident}
                disabled={submitting || !formData.title.trim() || !formData.description.trim()}
              >
                {submitting ? 'Creating...' : 'Create Incident'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Incident Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Incident Details</DialogTitle>
          </DialogHeader>
          {viewingIncident && (
            <div className="space-y-6">
              {/* Incident ID and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Incident ID
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {viewingIncident.incidentId}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <Badge className={`${getStatusColor(viewingIncident.status)} border-2`}>
                    {viewingIncident.status}
                  </Badge>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  {viewingIncident.title}
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded whitespace-pre-wrap">
                  {viewingIncident.description}
                </p>
              </div>

              {/* Priority and Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <Badge className={`${getPriorityColor(viewingIncident.priority)}`}>
                    {viewingIncident.priority}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {viewingIncident.type || 'Not specified'}
                  </p>
                </div>
              </div>



              {/* Assignment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned To
                </label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {viewingIncident.assignedToUserName ? (
                    <span className="text-gray-600 dark:text-gray-400">
                      {viewingIncident.assignedToUserName}
                    </span>
                  ) : (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      Unassigned
                    </span>
                  )}
                </p>
              </div>

              {/* CVEs */}
              {viewingIncident.cveIds && viewingIncident.cveIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Related CVEs
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {viewingIncident.cveIds.map((cveId) => (
                      <Badge key={cveId} variant="outline" className="text-xs">
                        {cveId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Threat Actors */}
              {viewingIncident.threatActorIds && viewingIncident.threatActorIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Related Threat Actors
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {viewingIncident.threatActorIds.map((actorId) => {
                      const actor = threatActors.find(ta => ta.threatActorId === actorId);
                      return (
                        <Badge key={actorId} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                          {actor?.name || actorId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Collaborative Comments Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-lg font-medium text-gray-900 dark:text-gray-100">
                    Resolution Comments
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {viewingIncident.resolutionComments?.length || 0} 
                    {' '}Comment{(viewingIncident.resolutionComments?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                </div>



                {/* Comments list */}
                <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
                  {viewingIncident.resolutionComments && viewingIncident.resolutionComments.length > 0 ? (
                    viewingIncident.resolutionComments.map((comment, index) => (
                      <div key={comment.commentId || index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {comment.userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {comment.userName || 'Unknown User'}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  • {formatCommentTime(comment.timestamp)}
                                </span>
                              </div>
                              {/* Delete button - show if user owns comment or user is admin */}
                              {comment.commentId && ((user && comment.userId === user.userId) || (user && user.role === 'admin')) && (
                                <button
                                  onClick={() => openDeleteCommentConfirm(viewingIncident.incidentId, comment.commentId)}
                                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded transition-colors"
                                  title="Delete comment"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p className="text-sm">No comments yet. Be the first to add insights about this incident.</p>
                    </div>
                  )}
                </div>

                {/* Add comment form */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your analysis, findings, or resolution steps..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                                              <div className="flex justify-end mt-2">
                          <Button
                            onClick={() => handleAddComment(viewingIncident.incidentId)}
                            disabled={submittingComment || !newComment.trim()}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {submittingComment ? 'Adding...' : 'Add Comment'}
                          </Button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>



              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
                {permissions.canEditIncidents && (
                  <Button
                    onClick={() => openEditModal(viewingIncident)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Edit Incident
                  </Button>
                )}
                {permissions.canEditIncidents && (
                  <Button
                    onClick={handleGenerateAISummary}
                    disabled={generatingSummary}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    {generatingSummary ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Summary
                      </>
                    )}
                  </Button>
                )}
                {permissions.canDeleteIncidents && (
                  <Button
                    variant="destructive"
                    onClick={() => openDeleteConfirm(viewingIncident)}
                  >
                    Delete Incident
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Summary Modal */}
      <Dialog open={showAiSummary} onOpenChange={setShowAiSummary}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto p-6 bg-white dark:bg-gray-800">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Threat Intelligence Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Generated by AI • {new Date().toLocaleString()}
                </span>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                  {aiSummary}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={closeAiSummary}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  // Copy to clipboard
                  navigator.clipboard.writeText(aiSummary);
                  alert('AI Summary copied to clipboard!');
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Summary
              </Button>
              <Button
                onClick={() => exportToPDF()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Incident Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-8">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold">Edit Incident</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Incident ID
                  </label>
                  <Input
                    value={editingIncident?.incidentId || ''}
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || editingIncident?.status || 'Open'}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Open" className="text-blue-800">Open</option>
                    <option value="Triaged" className="text-purple-800">Triaged</option>
                    <option value="In Progress" className="text-yellow-800">In Progress</option>
                    <option value="Resolved" className="text-green-800">Resolved</option>
                    <option value="Closed" className="text-red-800">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Brief description of the incident"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description of the security incident"
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>
            </div>

            {/* Classification Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Classification
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Incident Type
                  </label>
                  <Input
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    placeholder="e.g., Data Breach, Malware, Phishing, etc."
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assign To
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.assignedToUserId}
                    onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value})}
                    className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {users.filter(user => user.role !== 'viewer').map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.firstName} {user.lastName} ({user.role})
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAssignToMeInModal}
                    className="h-10 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:border-blue-600"
                    title="Assign to me"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Related Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2">
                Related Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Related CVEs
                </label>
                <Input
                  value={cveInput}
                  onChange={(e) => {
                    setCveInput(e.target.value);
                    setCveError(''); // Clear error when typing
                  }}
                  onBlur={() => {
                    // Parse and validate CVEs when user finishes typing
                    setCveError('');
                    const cveInputs = cveInput.split(',').map(cve => cve.trim()).filter(cve => cve.length > 0);
                    const validCves: string[] = [];
                    const invalidCves: string[] = [];
                    
                    cveInputs.forEach(cve => {
                      // Validate CVE format: CVE-YYYY-NNNN or CVE-YYYY-NNNNN
                      const cvePattern = /^CVE-\d{4}-\d{4,5}$/i;
                      if (cvePattern.test(cve)) {
                        validCves.push(cve.toUpperCase());
                      } else {
                        invalidCves.push(cve);
                      }
                    });
                    
                    if (invalidCves.length > 0) {
                      setCveError(`Invalid CVE format: ${invalidCves.join(', ')}. Please use format CVE-YYYY-NNNN or CVE-YYYY-NNNNN`);
                    }
                    
                    setFormData({...formData, cveIds: validCves});
                  }}
                  placeholder="CVE-2024-1234, CVE-2024-56789"
                  className="w-full"
                />
                {cveError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {cveError}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter CVE IDs separated by commas (format: CVE-YYYY-NNNN or CVE-YYYY-NNNNN)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Related Threat Actors
                </label>
                <div className="max-h-32 overflow-y-auto border border-input rounded-md p-3 bg-background">
                  {threatActors.length > 0 ? (
                    <div className="space-y-2">
                      {threatActors.map((actor) => (
                        <label key={actor.threatActorId} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.threatActorIds.includes(actor.threatActorId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  threatActorIds: [...formData.threatActorIds, actor.threatActorId]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  threatActorIds: formData.threatActorIds.filter(id => id !== actor.threatActorId)
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900 dark:text-gray-100">{actor.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No threat actors available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select threat actors associated with this incident
                </p>
              </div>
            </div>





            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingIncident(null);
                  resetForm();
                  // Go back to view modal
                  if (editingIncident) {
                    setViewingIncident(editingIncident);
                    setShowViewModal(true);
                  }
                }}
                className="px-4 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to View
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingIncident(null);
                    resetForm();
                  }}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditIncident}
                  disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  {submitting ? 'Updating...' : 'Update Incident'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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