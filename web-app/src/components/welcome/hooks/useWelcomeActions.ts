import { useNavigate } from 'react-router-dom';
import { organizationsApi, usersApi } from '../../../api';
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../../config/firebase';

interface UseWelcomeActionsProps {
  user: any;
  firebaseUser: any;
  createOrgData: {
    name: string;
    industry: string;
    nationality: string;
    description: string;
  };
  deletePassword: string;
  setCreatingOrg: (creating: boolean) => void;
  setCreateOrgError: (error: string | null) => void;
  setDeletingAccount: (deleting: boolean) => void;
  setDeleteError: (error: string | null) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setDeletePassword: (password: string) => void;
}

export const useWelcomeActions = ({
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
}: UseWelcomeActionsProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // auth context will handle redirecting to login
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateOrganization = async () => {
    if (!user || !createOrgData.name.trim()) {
      setCreateOrgError('Organization name is required');
      return;
    }

    setCreatingOrg(true);
    setCreateOrgError(null);

    try {
      // ensure user exists in backend by attempting to fetch their data
      try {
        await usersApi.getById(user.userId);
      } catch (userError: any) {
        if (userError.response?.status === 404) {
          setCreateOrgError('User account is still being set up. Please wait a moment and try again, or sign out and back in.');
          setCreatingOrg(false);
          return;
        }
      }

      const orgData = {
        name: createOrgData.name.trim(),
        industry: createOrgData.industry.trim() || 'Technology',
        nationality: createOrgData.nationality.trim() || 'Unknown',
        description: createOrgData.description.trim() || ''
      };

      const response = await organizationsApi.create(orgData);
      const newOrg = response.organization;

      // Auto-assign the creator as admin with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await usersApi.update(user.userId, {
            organizationId: newOrg.organizationId,
            role: 'admin'
          });
          break;
        } catch (updateError: any) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw updateError;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      navigate('/dashboard');
      window.location.reload(); // Refresh to update user context
    } catch (error: any) {
      console.error('Error creating organization:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create organization';
      
      if (errorMessage.includes('User not found') || errorMessage.includes('user not found')) {
        setCreateOrgError('User account is still being set up. Please sign out and back in, then try again.');
      } else {
        setCreateOrgError(errorMessage);
      }
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !firebaseUser || !firebaseUser.email) return;

    setDeletingAccount(true);
    setDeleteError(null);

    try {
      if (firebaseUser.providerData[0]?.providerId === 'google.com') {
        await usersApi.delete(user.userId);
        await deleteUser(firebaseUser);
      } else {
        if (!deletePassword) {
          setDeleteError('Password is required to delete your account');
          setDeletingAccount(false);
          return;
        }

        const credential = EmailAuthProvider.credential(firebaseUser.email, deletePassword);
        await reauthenticateWithCredential(firebaseUser, credential);

        // Delete from backend first
        await usersApi.delete(user.userId);

        // then delete Firebase user
        await deleteUser(firebaseUser);
      }

      // Sign out after deletion
      await signOut(auth);
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setDeleteError('Incorrect password');
      } else if (error.code === 'auth/requires-recent-login') {
        setDeleteError('Please sign out and sign back in before deleting your account');
      } else {
        setDeleteError(error.message || 'Failed to delete account');
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletePassword('');
    setDeleteError(null);
  };

  return {
    handleSignOut,
    handleCreateOrganization,
    handleDeleteAccount,
    handleCancelDelete,
  };
}; 
