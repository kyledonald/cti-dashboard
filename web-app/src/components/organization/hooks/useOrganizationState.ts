import { useState } from 'react';
import type { Organization, User } from '../../../api';

export const useOrganizationState = () => {
  // Org states
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit org states
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

  // Delete org states
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

  return {
    // Org states
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

    // Delete org states
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
  };
}; 
