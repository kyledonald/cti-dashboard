import { organizationsApi, usersApi, type User } from '../../../api';

interface UseOrganizationActionsProps {
  user: any;
  organization: any;
  users: User[];
  orgFormData: any;
  addUserEmail: string;
  addUserRole: 'viewer' | 'editor' | 'admin';
  editingUser: User | null;
  editUserRole: 'viewer' | 'editor' | 'admin';
  customTitle: string;
  customMessage: string;
  notificationPriority: 'low' | 'medium' | 'high';
  scheduleDate: string;
  scheduleTime: string;
  selectedUsers: string[];
  setOrganization: (org: any) => void;
  setUsers: (users: User[]) => void;
  setEditingOrg: (editing: boolean) => void;
  setShowAddUserModal: (show: boolean) => void;
  setAddUserEmail: (email: string) => void;
  setAddUserRole: (role: 'viewer' | 'editor' | 'admin') => void;
  setAddUserLoading: (loading: boolean) => void;
  setAddUserError: (error: string) => void;
  setEditingUser: (user: User | null) => void;
  setEditUserRole: (role: 'viewer' | 'editor' | 'admin') => void;
  setShowEditUserModal: (show: boolean) => void;
  setEditUserError: (error: string) => void;
  setEditUserLoading: (loading: boolean) => void;
  setRemoveUserLoading: (loading: boolean) => void;
  setShowRemoveUserConfirm: (show: boolean) => void;
  setEditUserSuccess: (success: string) => void;
  setShowDeleteOrgConfirm: (show: boolean) => void;
  setDeleteOrgLoading: (loading: boolean) => void;
  setCustomTitle: (title: string) => void;
  setCustomMessage: (message: string) => void;
  setNotificationPriority: (priority: 'low' | 'medium' | 'high') => void;
  setSchedulingNotification: (scheduling: boolean) => void;
  setScheduleDate: (date: string) => void;
  setScheduleTime: (time: string) => void;
  setSelectedUsers: (users: string[]) => void;
  setSelectAll: (select: boolean) => void;
  setNotificationMessage: (message: { type: 'success' | 'error', text: string } | null) => void;
  addOrganizationNotification: any;
  scheduleNotification: any;
}

export const useOrganizationActions = ({
  user,
  organization,
  users,
  orgFormData,
  addUserEmail,
  addUserRole,
  editingUser,
  editUserRole,
  customTitle,
  customMessage,
  notificationPriority,
  scheduleDate,
  scheduleTime,
  selectedUsers,
  setOrganization,
  setUsers,
  setEditingOrg,
  setShowAddUserModal,
  setAddUserEmail,
  setAddUserRole,
  setAddUserLoading,
  setAddUserError,
  setEditingUser,
  setEditUserRole,
  setShowEditUserModal,
  setEditUserError,
  setEditUserLoading,
  setRemoveUserLoading,
  setShowRemoveUserConfirm,
  setEditUserSuccess,
  setShowDeleteOrgConfirm,
  setDeleteOrgLoading,
  setCustomTitle,
  setCustomMessage,
  setNotificationPriority,
  setSchedulingNotification,
  setScheduleDate,
  setScheduleTime,
  setSelectedUsers,
  setSelectAll,
  setNotificationMessage,
  addOrganizationNotification,
  scheduleNotification,
}: UseOrganizationActionsProps) => {
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
      // Find user by email using the new endpoint
      const targetUser = await usersApi.getByEmail(addUserEmail.trim());
      
      if (!targetUser) {
        setAddUserError('User not found. They need to create an account first.');
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
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
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

  return {
    handleSave,
    handleAddUser,
    handleEditUser,
    handleUpdateUserRole,
    handleRemoveUser,
    confirmRemoveUser,
    handleDeleteOrganization,
    showNotificationMessage,
    triggerPasswordReminder,
    handleUserSelection,
    handleSelectAll,
    sendCustomNotification,
  };
}; 