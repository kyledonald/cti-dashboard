import { useState } from 'react';

export const useWelcomeState = () => {
  // Create Org State
  const [createOrgData, setCreateOrgData] = useState({
    name: '',
    industry: '',
    nationality: '',
    description: ''
  });
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [createOrgError, setCreateOrgError] = useState<string | null>(null);

  // Delete Account State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return {
    // Create Org State
    createOrgData,
    setCreateOrgData,
    creatingOrg,
    setCreatingOrg,
    createOrgError,
    setCreateOrgError,

    // Delete Account State
    showDeleteDialog,
    setShowDeleteDialog,
    deletePassword,
    setDeletePassword,
    deletingAccount,
    setDeletingAccount,
    deleteError,
    setDeleteError,
  };
}; 
