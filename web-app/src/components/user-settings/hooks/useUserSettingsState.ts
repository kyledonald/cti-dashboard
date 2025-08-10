import { useState } from 'react';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organizationId?: string;
}

export const useUserSettingsState = (user: User | null) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return {
    // UI states
    isEditing,
    setIsEditing,
    isChangingPassword,
    setIsChangingPassword,
    isDeletingAccount,
    setIsDeletingAccount,
    
    // Form states
    firstName,
    setFirstName,
    lastName,
    setLastName,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    deleteConfirmPassword,
    setDeleteConfirmPassword,
    
    // UI states
    loading,
    setLoading,
    message,
    setMessage,
    showMessage,
  };
}; 
