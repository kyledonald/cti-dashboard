import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
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
import { useOrganizationState } from '../components/organization/hooks/useOrganizationState';
import { useOrganizationData } from '../components/organization/hooks/useOrganizationData';
import { useOrganizationActions } from '../components/organization/hooks/useOrganizationActions';

const OrganizationPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  const { addOrganizationNotification, scheduleNotification, scheduledNotifications, cancelScheduledNotification } = useNotifications();
  
  const {
    // Organization states
    organization,
    setOrganization,
    loading,
    setLoading,
    
    // Edit organization states
    editingOrg,
    setEditingOrg,
    orgFormData,
    setOrgFormData,
    
    // User management states
    users,
    setUsers,
    showAddUserModal,
    setShowAddUserModal,
    addUserEmail,
    setAddUserEmail,
    addUserRole,
    setAddUserRole,
    addUserLoading,
    setAddUserLoading,
    addUserError,
    setAddUserError,
    
    // Edit user states
    editingUser,
    setEditingUser,
    editUserRole,
    setEditUserRole,
    showEditUserModal,
    setShowEditUserModal,
    editUserError,
    setEditUserError,
    editUserLoading,
    setEditUserLoading,
    removeUserLoading,
    setRemoveUserLoading,
    showRemoveUserConfirm,
    setShowRemoveUserConfirm,
    editUserSuccess,
    setEditUserSuccess,

    // Delete organization states
    showDeleteOrgConfirm,
    setShowDeleteOrgConfirm,
    deleteOrgLoading,
    setDeleteOrgLoading,

    // Notification states
    customTitle,
    setCustomTitle,
    customMessage,
    setCustomMessage,
    notificationPriority,
    setNotificationPriority,
    schedulingNotification,
    setSchedulingNotification,
    notificationMessage,
    setNotificationMessage,
    
    // Advanced scheduling states
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    selectedUsers,
    setSelectedUsers,
    selectAll,
    setSelectAll,
    showScheduledNotifications,
    setShowScheduledNotifications,
  } = useOrganizationState();

  // Load organization data
  useOrganizationData({
    user,
    setOrganization,
    setUsers,
    setOrgFormData,
    setLoading,
  });

  // Organization actions
  const {
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
  } = useOrganizationActions({
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
  });

  if (!permissions.canEditOrgSettings) {
    return <OrganizationAccessDeniedState />;
  }

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