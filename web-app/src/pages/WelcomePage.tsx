import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { WelcomePageHeader } from '../components/welcome/WelcomePageHeader';
import { CreateOrganizationCard } from '../components/welcome/CreateOrganizationCard';
import { DeleteAccountCard } from '../components/welcome/DeleteAccountCard';
import { DeleteAccountDialog } from '../components/welcome/DeleteAccountDialog';
import { useWelcomeState } from '../components/welcome/hooks/useWelcomeState';
import { useWelcomeActions } from '../components/welcome/hooks/useWelcomeActions';

const WelcomePage: React.FC = () => {
  const { user, firebaseUser } = useAuth();
  
  // State management
  const {
    createOrgData,
    setCreateOrgData,
    creatingOrg,
    setCreatingOrg,
    createOrgError,
    setCreateOrgError,
    showDeleteDialog,
    setShowDeleteDialog,
    deletePassword,
    setDeletePassword,
    deletingAccount,
    setDeletingAccount,
    deleteError,
    setDeleteError,
  } = useWelcomeState();

  // Actions
  const {
    handleSignOut,
    handleCreateOrganization,
    handleDeleteAccount,
    handleCancelDelete,
  } = useWelcomeActions({
    user,
    firebaseUser,
    createOrgData,
    deletePassword,
    setCreatingOrg,
    setCreateOrgError,
    setDeletingAccount,
    setDeleteError,
    setShowDeleteDialog,
    setDeletePassword,
  });

  const handleFormDataChange = (field: string, value: string) => {
    setCreateOrgData({ ...createOrgData, [field]: value });
  };

  const isGoogleUser = firebaseUser?.providerData[0]?.providerId === 'google.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto py-8">
        <WelcomePageHeader 
          userEmail={user?.email || ''} 
          onSignOut={handleSignOut} 
        />

        <div className="max-w-2xl mx-auto space-y-6">
          <CreateOrganizationCard
            createOrgData={createOrgData}
            creatingOrg={creatingOrg}
            createOrgError={createOrgError}
            onFormDataChange={handleFormDataChange}
            onCreateOrganization={handleCreateOrganization}
          />

          <DeleteAccountCard
            onShowDeleteDialog={() => setShowDeleteDialog(true)}
          />
        </div>
      </div>

      <DeleteAccountDialog
        showDeleteDialog={showDeleteDialog}
        deletePassword={deletePassword}
        deleteError={deleteError}
        deletingAccount={deletingAccount}
        isGoogleUser={isGoogleUser}
        onPasswordChange={setDeletePassword}
        onDeleteAccount={handleDeleteAccount}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default WelcomePage; 
