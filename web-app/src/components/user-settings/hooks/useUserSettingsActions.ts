import { updateProfile, updatePassword, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { usersApi } from '../../../api';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId?: string;
}

import type { User as FirebaseAuthUser } from 'firebase/auth';

interface FirebaseUser extends FirebaseAuthUser {
  email: string | null;
}

interface UseUserSettingsActionsProps {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  showMessage: (type: 'success' | 'error', text: string) => void;
  validatePasswordComplexity: (password: string) => { isValid: boolean; message: string };
}

export const useUserSettingsActions = ({
  user,
  firebaseUser,
  signOut,
  refreshUser,
  setLoading,
  showMessage,
  validatePasswordComplexity,
}: UseUserSettingsActionsProps) => {
  const handleUpdateProfile = async (e: React.FormEvent, firstName: string, lastName: string) => {
    e.preventDefault();
    if (!user || !firebaseUser) return;

    setLoading(true);
    try {
      // Update Firebase profile
      await updateProfile(firebaseUser, {
        displayName: `${firstName} ${lastName}`.trim()
      });

      // Update backend user
      await usersApi.update(user.userId, {
        firstName,
        lastName
      });

      // Refresh user context
      await refreshUser();
      
      showMessage('success', 'Profile updated successfully!');
      return true; // Indicate success for state management
    } catch (error: any) {
      console.error('Error updating profile:', error);
      showMessage('error', error.message || 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent, currentPassword: string, newPassword: string, confirmPassword: string) => {
    e.preventDefault();
    if (!firebaseUser || !firebaseUser.email) return;

    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return false;
    }

    // Password complexity validation
    const passwordValidation = validatePasswordComplexity(newPassword);
    if (!passwordValidation.isValid) {
      showMessage('error', passwordValidation.message);
      return false;
    }

    setLoading(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

      showMessage('success', 'Password changed successfully!');
      return true; // Indicate success for state management
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Current password is incorrect');
      } else {
        showMessage('error', error.message || 'Failed to change password');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent, deleteConfirmPassword: string) => {
    e.preventDefault();
    if (!user || !firebaseUser || !firebaseUser.email) return;

    setLoading(true);
    try {
      // Check if user is an admin and if there are other users in the organization
      if (user.role === 'admin' && user.organizationId) {
        const allUsers = await usersApi.getAll();
        const orgUsers = allUsers.filter((u: any) => u.organizationId === user.organizationId);
        const otherAdmins = orgUsers.filter((u: any) => u.role === 'admin' && u.userId !== user.userId);
        const otherUsers = orgUsers.filter((u: any) => u.userId !== user.userId);

        if (otherUsers.length > 0 && otherAdmins.length === 0) {
          showMessage('error', 'You cannot delete your account as you are the only admin. Please promote another user to admin first, or remove all other users from the organization.');
          setLoading(false);
          return false;
        }
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(firebaseUser.email, deleteConfirmPassword);
      await reauthenticateWithCredential(firebaseUser, credential);

      // Delete from backend first
      await usersApi.delete(user.userId);

      // Delete Firebase user
      await deleteUser(firebaseUser);

      // Sign out
      await signOut();
      
      showMessage('success', 'Account deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        showMessage('error', 'Password is incorrect');
      } else {
        showMessage('error', error.message || 'Failed to delete account');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    handleUpdateProfile,
    handleChangePassword,
    handleDeleteAccount,
  };
}; 