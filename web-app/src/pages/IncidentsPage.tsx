import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { incidentsApi, usersApi, type Incident, type CreateIncidentDTO, type UpdateIncidentDTO, type User } from '../api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Badge } from '../components/ui/badge';

const IncidentsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  
  // State management
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);
  const [draggedIncident, setDraggedIncident] = useState<Incident | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
    type: '',
    assignedToUserId: '',
    cveIds: [] as string[],
    resolutionNotes: ''
  });
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
        // Load incidents and users in parallel
        const [incidentsData, usersData] = await Promise.all([
          incidentsApi.getAll(),
          usersApi.getAll()
        ]);

               // Filter incidents by organization
       const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
       setIncidents(orgIncidents);

       // Filter users by organization
       const orgUsers = usersData.filter((u: User) => u.organizationId === user?.organizationId);
        setUsers(orgUsers);


      } catch (error) {
        console.error('Error loading incidents data:', error);
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
          type: parsedData.isKev ? 'Known Exploited Vulnerability' : 'Vulnerability',
          assignedToUserId: '',
          cveIds: [parsedData.cveId],
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
      case 'Open': return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800';
      case 'Triaged': return 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800';
      case 'In Progress': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800';
      case 'Resolved': return 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800';
      case 'Closed': return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-900/10 dark:border-gray-800';
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      type: '',
      assignedToUserId: '',
      cveIds: [],
      resolutionNotes: ''
    });
    setCveInput('');
    setCveError('');
    setError('');
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
        threatActorIds: [],
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
      
      const updateData: UpdateIncidentDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        type: formData.type.trim() || null,
        cveIds: formData.cveIds,
        resolutionNotes: formData.resolutionNotes.trim() || null,
        assignedToUserId: assignedUser?.userId || null,
        assignedToUserName: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : null
      };

      await incidentsApi.update(editingIncident.incidentId, updateData);

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
    setDraggedIncident(incident);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (!draggedIncident || draggedIncident.status === newStatus) {
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

  // Modal handlers
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (incident: Incident) => {
    setEditingIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description,
      priority: incident.priority,
      type: incident.type || '',
      assignedToUserId: incident.assignedToUserId || '',
      cveIds: incident.cveIds || [],
      resolutionNotes: incident.resolutionNotes || ''
    });
    setCveInput((incident.cveIds || []).join(', '));
    setCveError('');
    setError('');
    setShowEditModal(true);
  };

  const openDeleteConfirm = (incident: Incident) => {
    setIncidentToDelete(incident);
    setShowDeleteConfirm(true);
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
              className={`min-h-96 rounded-lg border-2 border-dashed p-4 ${getStatusColor(status)}`}
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
                  <Card
                    key={incident.incidentId}
                    className="cursor-move hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, incident)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                            {incident.title}
                          </h4>
                          {permissions.canEditIncidents && (
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => openEditModal(incident)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {permissions.canDeleteIncidents && (
                                <button
                                  onClick={() => openDeleteConfirm(incident)}
                                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {incident.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${getPriorityColor(incident.priority)}`}>
                            {incident.priority}
                          </Badge>
                          {incident.cveIds && incident.cveIds.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {incident.cveIds.length} CVE{incident.cveIds.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <select
                value={formData.assignedToUserId}
                onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
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

      {/* Edit Incident Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl">Edit Incident</DialogTitle>
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
              <select
                value={formData.assignedToUserId}
                onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
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
                Resolution Notes
              </label>
              <textarea
                value={formData.resolutionNotes}
                onChange={(e) => setFormData({...formData, resolutionNotes: e.target.value})}
                placeholder="Notes about how this incident was resolved..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
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
                  setShowEditModal(false);
                  setEditingIncident(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditIncident}
                disabled={submitting || !formData.title.trim() || !formData.description.trim()}
              >
                {submitting ? 'Updating...' : 'Update Incident'}
              </Button>
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
    </div>
  );
};

export default IncidentsPage; 