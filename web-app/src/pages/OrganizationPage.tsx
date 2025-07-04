import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { organizationsApi, usersApi, type Organization, type User } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useNotifications } from '../contexts/NotificationContext';

const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { addOrganizationNotification, scheduleNotification, scheduledNotifications, cancelScheduledNotification } = useNotifications();
  
  // Organization states
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit organization states
  const [editingOrg, setEditingOrg] = useState(false);
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    industry: '',
    nationality: '',
    description: ''
  });
  
  // User management states
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserEmail, setAddUserEmail] = useState('');
  const [addUserRole, setAddUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  
  // Edit user states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserRole, setEditUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserError, setEditUserError] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [removeUserLoading, setRemoveUserLoading] = useState(false);
  const [showRemoveUserConfirm, setShowRemoveUserConfirm] = useState(false);
  const [editUserSuccess, setEditUserSuccess] = useState('');

  // Delete organization states
  const [showDeleteOrgConfirm, setShowDeleteOrgConfirm] = useState(false);
  const [deleteOrgLoading, setDeleteOrgLoading] = useState(false);

  // Notification states
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [notificationPriority, setNotificationPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [schedulingNotification, setSchedulingNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Advanced scheduling states
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showScheduledNotifications, setShowScheduledNotifications] = useState(false);

  // Load organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Load organization details
        const orgResponse = await organizationsApi.getById(user.organizationId);
        const orgData = orgResponse.organization || orgResponse;
        setOrganization(orgData);
        setOrgFormData({
          name: orgData.name || '',
          description: orgData.description || '',
          industry: orgData.industry || '',
          nationality: orgData.nationality || '',
        });

        // Load organization users
        const allUsers = await usersApi.getAll();
        const orgUsers = allUsers.filter((u: User) => u.organizationId === user.organizationId);
        setUsers(orgUsers);

      } catch (error) {
        console.error('Error loading organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [user?.organizationId]);

  if (!permissions.canEditOrgSettings) {
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
                You don't have permission to manage organization settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      if (organization) {
        // UPDATE existing organization
        await organizationsApi.update(organization.organizationId, orgFormData);
        setOrganization({ ...organization, ...orgFormData });
      } else {
        // CREATE new organization
        const newOrgResponse = await organizationsApi.create(orgFormData);
        const newOrg = newOrgResponse.organization || newOrgResponse;
        setOrganization(newOrg);
        
        // Assign current admin user to the new organization
        if (user) {
          await usersApi.update(user.userId, { 
            organizationId: newOrg.organizationId 
          });
          // Wait for state to update, then refresh
          await new Promise(resolve => setTimeout(resolve, 2000));
          window.location.reload();
        }
      }
      setEditingOrg(false);
    } catch (error) {
      console.error('Error saving organization:', error);
    }
      };

  const handleAddUser = async () => {
    if (!organization || !addUserEmail.trim()) return;
    
    setAddUserLoading(true);
    setAddUserError('');
    
    try {
      // Find user by email
      const allUsers = await usersApi.getAll();
      const targetUser = allUsers.find((u: User) => u.email.toLowerCase() === addUserEmail.toLowerCase().trim());
      
      if (!targetUser) {
        setAddUserError('User not found. They need to create an account first.');
        return;
      }
      
      // Check if user is unassigned
      if (targetUser.organizationId && targetUser.organizationId.trim() !== '') {
        setAddUserError('User is already assigned to another organization.');
        return;
      }
      
      // Check if we're updating the current user
      const isUpdatingCurrentUser = user?.email === addUserEmail.trim();
      
      // Assign user to organization with selected role
      await usersApi.update(targetUser.userId, {
        organizationId: organization.organizationId,
        role: addUserRole
      });
      
      // Refresh the organization users list
      const updatedUsers = await usersApi.getAll();
      const updatedOrgUsers = updatedUsers.filter((u: User) => u.organizationId === organization.organizationId);
      setUsers(updatedOrgUsers);
      
      // Reset form and close modal
      setAddUserEmail('');
      setAddUserRole('viewer');
      setAddUserError('');
      setShowAddUserModal(false);
      
      // If we updated the current user, refresh the page to update permissions
      if (isUpdatingCurrentUser) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('Error adding user to organization:', error);
      setAddUserError('Failed to add user. Please try again.');
    } finally {
      setAddUserLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditUserRole(user.role === 'unassigned' ? 'viewer' : user.role);
    setEditUserError('');
    setEditUserSuccess('');
    setShowEditUserModal(true);
  };

  const handleUpdateUserRole = async () => {
    if (!editingUser || !organization || !user) return;
    
    // Prevent admins from demoting themselves - organization must always have an admin
    if (editingUser.userId === user.userId && editingUser.role === 'admin' && editUserRole !== 'admin') {
      // Check if there are other admins in the organization
      const otherAdmins = users.filter(u => u.role === 'admin' && u.userId !== user.userId);
      if (otherAdmins.length === 0) {
        setEditUserError('Cannot demote yourself as you are the only admin. Either assign another admin first or delete the organization.');
        return;
      }
    }
    
    setEditUserLoading(true);
    setEditUserError('');
    
    // Check if we're updating the current user's role
    const isUpdatingCurrentUser = editingUser.userId === user.userId;
    
    try {
      // Update user role
      await usersApi.update(editingUser.userId, {
        role: editUserRole
      });
      
      // If we updated the current user's role, refresh the page to update permissions
      if (isUpdatingCurrentUser) {
        // Show a brief success message before refresh
        setEditUserError('');
        setEditUserSuccess('Role updated successfully! Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        return;
      }
      
      // For other users, just refresh the list
      const updatedUsers = await usersApi.getAll();
      const updatedOrgUsers = updatedUsers.filter((u: User) => u.organizationId === organization.organizationId);
      setUsers(updatedOrgUsers);
      
      // Close modal
      setShowEditUserModal(false);
      setEditingUser(null);
      
    } catch (error) {
      console.error('Error updating user role:', error);
      setEditUserError('Failed to update user role. Please try again.');
    } finally {
      // Only set loading to false if we're not refreshing the page
      if (!isUpdatingCurrentUser) {
        setEditUserLoading(false);
      }
    }
  };

  const handleRemoveUser = async () => {
    if (!editingUser || !organization || !user) return;
    
    // Prevent admins from removing themselves
    if (editingUser.userId === user.userId) {
      setEditUserError('You cannot remove yourself from the organization.');
      return;
    }
    
    setShowRemoveUserConfirm(true);
  };

  const confirmRemoveUser = async () => {
    if (!editingUser || !organization) return;
    
    setRemoveUserLoading(true);
    setEditUserError('');
    
    try {
      // Remove user from organization
      await usersApi.update(editingUser.userId, {
        organizationId: '',
        role: 'unassigned'
      });
      
      // Refresh the organization users list
      const updatedUsers = await usersApi.getAll();
      const updatedOrgUsers = updatedUsers.filter((u: User) => u.organizationId === organization.organizationId);
      setUsers(updatedOrgUsers);
      
      // Close modals
      setShowRemoveUserConfirm(false);
      setShowEditUserModal(false);
      setEditingUser(null);
      
    } catch (error) {
      console.error('Error removing user from organization:', error);
      setEditUserError('Failed to remove user. Please try again.');
    } finally {
      setRemoveUserLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!organization) return;
    
    try {
      // Delete the organization
      await organizationsApi.delete(organization.organizationId);
      
      // Clear local state
      setOrganization(null);
      setUsers([]);
      setOrgFormData({
        name: '',
        industry: '',
        nationality: '',
        description: ''
      });
      
      // Close confirmation dialog
      setShowDeleteOrgConfirm(false);
      
      // Refresh the page to update user context
      window.location.reload();
      
    } catch (error) {
      console.error('Error deleting organization:', error);
      // You might want to show an error message here
    } finally {
      setDeleteOrgLoading(false);
    }
  };

  // Notification functions
  const showNotificationMessage = (type: 'success' | 'error', text: string) => {
    setNotificationMessage({ type, text });
    setTimeout(() => setNotificationMessage(null), 5000);
  };

  const triggerPasswordReminder = () => {
    addOrganizationNotification({
      type: 'password_reminder',
      title: 'Password Security Reminder',
      message: 'This is a reminder to change your account password as part of our password rotation policy.',
      priority: 'medium',
      actionUrl: '/settings',
      actionText: 'Update Password'
    });
    showNotificationMessage('success', 'Password reminder notification sent to organization!');
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedUsers(users.map(u => u.userId));
    } else {
      setSelectedUsers([]);
    }
  };

  const sendCustomNotification = async () => {
    if (!customTitle.trim() || !customMessage.trim()) {
      showNotificationMessage('error', 'Please fill in both title and message');
      return;
    }

    if (selectedUsers.length === 0) {
      showNotificationMessage('error', 'Please select at least one user to notify');
      return;
    }

    setSchedulingNotification(true);
    try {
      const scheduleDateTime = scheduleDate && scheduleTime 
        ? new Date(`${scheduleDate}T${scheduleTime}`) 
        : null;

      if (scheduleDateTime && scheduleDateTime <= new Date()) {
        showNotificationMessage('error', 'Scheduled time must be in the future');
        setSchedulingNotification(false);
        return;
      }

      if (scheduleDateTime) {
        // Schedule the notification
        scheduleNotification({
          type: 'system',
          title: customTitle,
          message: customMessage,
          priority: notificationPriority,
          scheduledFor: scheduleDateTime,
          targetUsers: selectedUsers,
        });
      } else {
        // Send immediately
        addOrganizationNotification({
          type: 'system',
          title: customTitle,
          message: customMessage,
          priority: notificationPriority,
        });
      }

      // Reset form
      setCustomTitle('');
      setCustomMessage('');
      setNotificationPriority('medium');
      setScheduleDate('');
      setScheduleTime('');
      setSelectedUsers([]);
      setSelectAll(false);
      
      const userCount = selectedUsers.length;
      const scheduleText = scheduleDateTime 
        ? ` scheduled for ${scheduleDateTime.toLocaleString()}`
        : '';
      
      showNotificationMessage('success', `Custom notification ${scheduleDateTime ? 'scheduled' : 'sent'} for ${userCount} user${userCount > 1 ? 's' : ''}${scheduleText}!`);
    } catch (error) {
      showNotificationMessage('error', 'Failed to schedule notification');
    } finally {
      setSchedulingNotification(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {organization ? 'Organization Management' : 'Create Your Organization'}
        </h1>
      </div>

      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            {organization ? 'Organization Settings' : 'Organization Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!organization && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Welcome!</strong> As an admin, you need to create your organization first. 
                Fill in the details below to get started.
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization Name
            </label>
            {!organization || editingOrg ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={orgFormData.name}
                    onChange={(e) => setOrgFormData({...orgFormData, name: e.target.value})}
                    placeholder="Enter organization name"
                    className="flex-1"
                  />
                  <Button onClick={handleSave} size="sm">
                    {organization ? 'Save Changes' : 'Create Organization'}
                  </Button>
                  {organization && (
                    <Button 
                      onClick={() => {
                        setEditingOrg(false);
                        setOrgFormData({
                          name: organization?.name || '',
                          description: organization?.description || '',
                          industry: organization?.industry || '',
                          nationality: organization?.nationality || '',
                        });
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <Input
                    value={orgFormData.description}
                    onChange={(e) => setOrgFormData({...orgFormData, description: e.target.value})}
                    placeholder="Organization description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Industry
                    </label>
                    <Input
                      value={orgFormData.industry}
                      onChange={(e) => setOrgFormData({...orgFormData, industry: e.target.value})}
                      placeholder="e.g., Financial Services"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nationality
                    </label>
                    <Input
                      value={orgFormData.nationality}
                      onChange={(e) => setOrgFormData({...orgFormData, nationality: e.target.value})}
                      placeholder="e.g., United States"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {organization?.name || 'No organization name set'}
                    </div>
                    {organization?.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {organization.description}
                      </div>
                    )}
                  </div>
                  <Button onClick={() => setEditingOrg(true)} variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                
                {(organization?.industry || organization?.nationality) && (
                  <div className="grid grid-cols-2 gap-4">
                    {organization?.industry && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Industry
                        </label>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {organization.industry}
                        </div>
                      </div>
                    )}
                    {organization?.nationality && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nationality
                        </label>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {organization.nationality}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Organization ID
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {editingOrg 
                  ? (user?.organizationId || 'Not assigned to organization')
                  : (user?.organizationId ? '••••••••••••••••••••' : 'Not assigned to organization')
                }
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Management Section - Only show if organization exists */}
      {organization && (
        <Card>
        <CardHeader>
          <CardTitle>
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                Manage users in your organization. Add new users, change roles, and remove access.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {users.length} member{users.length !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add User by Email
              </Button>
            </div>
          </div>

          {/* Current Organization Members */}
          {users.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg mt-8">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">Organization Members</h4>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((orgUser) => (
                  <div key={orgUser.userId} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        {orgUser.profilePictureUrl ? (
                          <img 
                            src={orgUser.profilePictureUrl} 
                            alt={`${orgUser.firstName} ${orgUser.lastName}`}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                            {orgUser.firstName[0]}{orgUser.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {orgUser.firstName} {orgUser.lastName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {orgUser.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        orgUser.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        orgUser.role === 'editor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        orgUser.role === 'viewer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {orgUser.role}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(orgUser)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {/* Schedule Notifications - Only show if organization exists */}
      {organization && (
        <Card>
          <CardHeader>
            <CardTitle>
              Schedule Notifications (Admin Only)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {notificationMessage && (
              <div className={`p-3 rounded-lg border ${
                notificationMessage.type === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
              }`}>
                <p className="text-sm">{notificationMessage.text}</p>
              </div>
            )}

            {/* Password Reminder Section */}
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quick Org Actions</h4>
                <Button 
                  onClick={triggerPasswordReminder} 
                  className="bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600 hover:border-yellow-700"
                >
                  Trigger Password Reset Reminder
                </Button>
              </div>
            </div>

            {/* Custom Notification Section */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Custom Notification</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Send a custom notification to selected org members.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <Input
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Notification title..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Notification message..."
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={notificationPriority}
                    onChange={(e) => setNotificationPriority(e.target.value as 'low' | 'medium' | 'high')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {/* Schedule Section */}
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="font-medium text-gray-900 dark:text-white">Schedule (Optional)</h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                      </label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Time
                      </label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full [color-scheme:light] dark:[color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Leave empty to send immediately
                  </p>
                </div>

                {/* User Selection Section */}
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-gray-900 dark:text-white">Select Recipients</h5>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        disabled={loading || users.length === 0}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
                    </label>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    {loading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">Loading users...</div>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">No users found in organization</div>
                      </div>
                    ) : (
                      users.map((orgUser) => (
                        <label key={orgUser.userId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(orgUser.userId)}
                            onChange={(e) => handleUserSelection(orgUser.userId, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              {orgUser.profilePictureUrl ? (
                                <img 
                                  src={orgUser.profilePictureUrl} 
                                  alt={`${orgUser.firstName} ${orgUser.lastName}`}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                                  {orgUser.firstName[0]}{orgUser.lastName[0]}
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {orgUser.firstName} {orgUser.lastName}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              orgUser.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                              orgUser.role === 'editor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                              'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            }`}>
                              {orgUser.role}
                            </span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  
                  {selectedUsers.length > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                <Button 
                  onClick={sendCustomNotification}
                  disabled={loading || schedulingNotification || !customTitle.trim() || !customMessage.trim() || selectedUsers.length === 0}
                  className="w-full"
                >
                  {loading ? 'Loading users...' : 
                   schedulingNotification ? 'Scheduling...' : 
                   scheduleDate && scheduleTime ? 'Schedule Notification' : 'Send Notification'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Notifications - Only show if organization exists and user has scheduled notifications */}
      {organization && scheduledNotifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowScheduledNotifications(!showScheduledNotifications)}
            >
              <span>Scheduled Notifications ({scheduledNotifications.length})</span>
              <svg 
                className={`w-5 h-5 transition-transform ${showScheduledNotifications ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </CardTitle>
          </CardHeader>
          {showScheduledNotifications && (
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Notifications scheduled to be sent automatically.
              </p>
              
              <div className="space-y-3">
                {scheduledNotifications.map((sn) => (
                  <div key={sn.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{sn.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sn.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            sn.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}>
                            {sn.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{sn.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Scheduled: {sn.scheduledFor.toLocaleString()}</span>
                          <span>Recipients: {sn.targetUsers.length}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          cancelScheduledNotification(sn.id);
                          showNotificationMessage('success', 'Scheduled notification cancelled');
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Danger Zone - Only show if organization exists */}
      {organization && (
        <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-red-700 dark:text-red-300 text-sm">
              These actions cannot be undone. Please be careful.
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowDeleteOrgConfirm(true);
                }}
                variant="outline" 
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
              >
                Delete Organization
              </Button>
            </div>
          </div>
        </CardContent>
        </Card>
      )}

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add User to Organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Email
              </label>
              <Input
                type="email"
                value={addUserEmail}
                onChange={(e) => setAddUserEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Role
              </label>
              <select
                value={addUserRole}
                onChange={(e) => setAddUserRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {addUserError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{addUserError}</p>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddUserModal(false);
                  setAddUserEmail('');
                  setAddUserRole('viewer');
                  setAddUserError('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddUser}
                disabled={addUserLoading || !addUserEmail.trim()}
              >
                {addUserLoading ? 'Adding...' : 'Add User'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 px-1">
            {editingUser && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {editingUser.profilePictureUrl ? (
                      <img 
                        src={editingUser.profilePictureUrl} 
                        alt={`${editingUser.firstName} ${editingUser.lastName}`}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {editingUser.firstName[0]}{editingUser.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {editingUser.firstName} {editingUser.lastName}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {editingUser.email}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Role
              </label>
              <select
                value={editUserRole}
                onChange={(e) => setEditUserRole(e.target.value as 'viewer' | 'editor' | 'admin')}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              {editingUser && user && editingUser.userId === user.userId && editingUser.role === 'admin' && editUserRole !== 'admin' && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                  ⚠️ Warning: Organizations must always have at least one admin.
                </p>
              )}
            </div>

            {editUserError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{editUserError}</p>
              </div>
            )}

            {editUserSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm">{editUserSuccess}</p>
              </div>
            )}

            <div className="flex gap-3 justify-between pt-2">
              <Button
                variant="outline"
                onClick={handleRemoveUser}
                disabled={removeUserLoading || editUserLoading || (editingUser?.userId === user?.userId)}
                className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 disabled:opacity-50"
                title={editingUser && user && editingUser.userId === user.userId ? "You cannot remove yourself" : ""}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {removeUserLoading ? 'Removing...' : 'Remove from Org'}
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                    setEditUserError('');
                    setEditUserSuccess('');
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateUserRole}
                  disabled={editUserLoading || editUserRole === editingUser?.role || removeUserLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editUserLoading ? 'Updating...' : 'Update Role'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Remove User Confirmation */}
      <ConfirmDialog
        open={showRemoveUserConfirm}
        onOpenChange={setShowRemoveUserConfirm}
        title="Remove User from Organization"
        message={editingUser ? `Are you sure you want to remove ${editingUser.firstName} ${editingUser.lastName} from the organization? They will be set to unassigned status and lose access to all organization data.` : ''}
        confirmText="Remove User"
        cancelText="Cancel"
        variant="destructive"
        icon="delete"
        onConfirm={confirmRemoveUser}
        loading={removeUserLoading}
      />

      {/* Delete Organization Confirmation */}
      <ConfirmDialog
        open={showDeleteOrgConfirm}
        onOpenChange={setShowDeleteOrgConfirm}
        title="Delete Organization"
        message="Are you sure you want to delete this organization? This action cannot be undone."
        confirmText="Delete Organization"
        cancelText="Cancel"
        variant="destructive"
        icon="delete"
        onConfirm={() => {
          setDeleteOrgLoading(true);
          handleDeleteOrganization();
        }}
        loading={deleteOrgLoading}
      />
    </div>
  );
};

export default OrganizationPage; 