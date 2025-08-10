import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserSettingsHeader } from '../components/user-settings/UserSettingsHeader';
import { UserSettingsMessage } from '../components/user-settings/UserSettingsMessage';
import { UserProfileSection } from '../components/user-settings/UserProfileSection';
import { UserPasswordSection } from '../components/user-settings/UserPasswordSection';
import { UserDeleteSection } from '../components/user-settings/UserDeleteSection';
import { useUserSettingsState } from '../components/user-settings/hooks/useUserSettingsState';
import { usePasswordValidation } from '../components/user-settings/hooks/usePasswordValidation';
import { useUserSettingsActions } from '../components/user-settings/hooks/useUserSettingsActions';

const UserSettingsPage: React.FC = () => {
  const { user, firebaseUser, signOut, refreshUser } = useAuth();
  
  const {
    isEditing,
    setIsEditing,
    isChangingPassword,
    setIsChangingPassword,
    isDeletingAccount,
    setIsDeletingAccount,
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
    loading,
    setLoading,
    message,
    showMessage,
  } = useUserSettingsState(user);

  const { validatePasswordComplexity } = usePasswordValidation();

  const { handleUpdateProfile, handleChangePassword, handleDeleteAccount } = useUserSettingsActions({
    user,
    firebaseUser,
    signOut,
    refreshUser,
    setLoading,
    showMessage,
    validatePasswordComplexity,
  });

  const handleUpdateProfileWrapper = async (e: React.FormEvent) => {
    const success = await handleUpdateProfile(e, firstName, lastName);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleChangePasswordWrapper = async (e: React.FormEvent) => {
    const success = await handleChangePassword(e, currentPassword, newPassword, confirmPassword);
    if (success) {
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccountWrapper = async (e: React.FormEvent) => {
    await handleDeleteAccount(e, deleteConfirmPassword);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <UserSettingsHeader />

      <UserSettingsMessage message={message} />

      <UserProfileSection
        user={user}
        isEditing={isEditing}
        firstName={firstName}
        lastName={lastName}
        loading={loading}
        onEdit={() => setIsEditing(true)}
        onCancel={() => {
          setIsEditing(false);
          setFirstName(user.firstName);
          setLastName(user.lastName);
        }}
        onSave={handleUpdateProfileWrapper}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
      />

      <UserPasswordSection
        isChangingPassword={isChangingPassword}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        loading={loading}
        onEdit={() => setIsChangingPassword(true)}
        onCancel={() => {
          setIsChangingPassword(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }}
        onSave={handleChangePasswordWrapper}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
      />

      <UserDeleteSection
        user={user}
        isDeletingAccount={isDeletingAccount}
        deleteConfirmPassword={deleteConfirmPassword}
        loading={loading}
        onEdit={() => setIsDeletingAccount(true)}
        onCancel={() => {
          setIsDeletingAccount(false);
          setDeleteConfirmPassword('');
        }}
        onSave={handleDeleteAccountWrapper}
        onDeleteConfirmPasswordChange={setDeleteConfirmPassword}
      />
    </div>
  );
};

export default UserSettingsPage; 
