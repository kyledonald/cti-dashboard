import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { organizationsApi, usersApi, type Organization, type User } from '../api';




import { useNotifications } from '../contexts/NotificationContext';
import { OrganizationPageHeader } from '../components/organization/OrganizationPageHeader';
import { OrganizationSettingsCard } from '../components/organization/OrganizationSettingsCard';
import { OrganizationAccessDeniedState } from '../components/organization/OrganizationAccessDeniedState';
import { OrganizationLoadingState } from '../components/organization/OrganizationLoadingState';
import { OrganizationUserManagementCard } from '../components/organization/OrganizationUserManagementCard';
import { OrganizationDangerZoneCard } from '../components/organization/OrganizationDangerZoneCard';
import { OrganizationAddUserModal } from '../components/organization/OrganizationAddUserModal';
import { OrganizationEditUserModal } from '../components/organization/OrganizationEditUserModal';
import { OrganizationNotificationsCard } from '../components/organization/OrganizationNotificationsCard';
import { OrganizationScheduledNotificationsCard } from '../components/organization/OrganizationScheduledNotificationsCard';
import { OrganizationConfirmationDialogs } from '../components/organization/OrganizationConfirmationDialogs';

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
    return <OrganizationAccessDeniedState />;
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
    return <OrganizationLoadingState />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <OrganizationPageHeader organization={organization} />

      <OrganizationSettingsCard
        organization={organization}
        editingOrg={editingOrg}
        orgFormData={orgFormData}
        user={user}
        onSave={handleSave}
        onEdit={() => setEditingOrg(true)}
        onCancel={() => {
          setEditingOrg(false);
          setOrgFormData({
            name: organization?.name || '',
            description: organization?.description || '',
            industry: organization?.industry || '',
            nationality: organization?.nationality || '',
          });
        }}
        onFormDataChange={(field, value) => setOrgFormData({...orgFormData, [field]: value})}
      />

      <OrganizationUserManagementCard
        organization={organization}
        users={users}
        onAddUser={() => setShowAddUserModal(true)}
        onEditUser={handleEditUser}
      />

      <OrganizationNotificationsCard
        organization={organization}
        users={users}
        loading={loading}
        notificationMessage={notificationMessage}
        customTitle={customTitle}
        customMessage={customMessage}
        notificationPriority={notificationPriority}
        scheduleDate={scheduleDate}
        scheduleTime={scheduleTime}
        selectedUsers={selectedUsers}
        selectAll={selectAll}
        schedulingNotification={schedulingNotification}
        onTriggerPasswordReminder={triggerPasswordReminder}
        onCustomTitleChange={setCustomTitle}
        onCustomMessageChange={setCustomMessage}
        onNotificationPriorityChange={setNotificationPriority}
        onScheduleDateChange={setScheduleDate}
        onScheduleTimeChange={setScheduleTime}
        onUserSelection={handleUserSelection}
        onSelectAll={handleSelectAll}
        onSendCustomNotification={sendCustomNotification}
      />

      <OrganizationScheduledNotificationsCard
        organization={organization}
        scheduledNotifications={scheduledNotifications}
        showScheduledNotifications={showScheduledNotifications}
        onToggleScheduledNotifications={() => setShowScheduledNotifications(!showScheduledNotifications)}
        onCancelScheduledNotification={cancelScheduledNotification}
        onShowNotificationMessage={showNotificationMessage}
      />

      <OrganizationDangerZoneCard
        organization={organization}
        onDeleteOrganization={() => setShowDeleteOrgConfirm(true)}
      />

      <OrganizationAddUserModal
        open={showAddUserModal}
        onOpenChange={setShowAddUserModal}
        addUserEmail={addUserEmail}
        addUserRole={addUserRole}
        addUserLoading={addUserLoading}
        addUserError={addUserError}
        onEmailChange={setAddUserEmail}
        onRoleChange={setAddUserRole}
        onAddUser={handleAddUser}
        onCancel={() => {
          setShowAddUserModal(false);
          setAddUserEmail('');
          setAddUserRole('viewer');
          setAddUserError('');
        }}
      />

      <OrganizationEditUserModal
        open={showEditUserModal}
        onOpenChange={setShowEditUserModal}
        editingUser={editingUser}
        editUserRole={editUserRole}
        editUserError={editUserError}
        editUserSuccess={editUserSuccess}
        editUserLoading={editUserLoading}
        removeUserLoading={removeUserLoading}
        currentUser={user}
        onRoleChange={setEditUserRole}
        onUpdateUserRole={handleUpdateUserRole}
        onRemoveUser={handleRemoveUser}
        onCancel={() => {
          setShowEditUserModal(false);
          setEditingUser(null);
          setEditUserError('');
          setEditUserSuccess('');
        }}
      />
      
      <OrganizationConfirmationDialogs
        showRemoveUserConfirm={showRemoveUserConfirm}
        showDeleteOrgConfirm={showDeleteOrgConfirm}
        editingUser={editingUser}
        removeUserLoading={removeUserLoading}
        deleteOrgLoading={deleteOrgLoading}
        onRemoveUserConfirmOpenChange={setShowRemoveUserConfirm}
        onDeleteOrgConfirmOpenChange={setShowDeleteOrgConfirm}
        onConfirmRemoveUser={confirmRemoveUser}
        onConfirmDeleteOrganization={() => {
          setDeleteOrgLoading(true);
          handleDeleteOrganization();
        }}
      />
    </div>
  );
};

export default OrganizationPage; 