import { usersApi } from '../../../api';

interface UseUserProfileActionsProps {
  user: any;
  signOut: () => Promise<void>;
  setLeavingOrg: (leaving: boolean) => void;
  setShowLeaveConfirm: (show: boolean) => void;
}

export const useUserProfileActions = ({
  user,
  signOut,
  setLeavingOrg,
  setShowLeaveConfirm,
}: UseUserProfileActionsProps) => {
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLeaveOrganization = async () => {
    if (!user || user.role === 'admin') return;
    setShowLeaveConfirm(true);
  };

  const confirmLeaveOrganization = async () => {
    if (!user) return;
    
    setLeavingOrg(true);
    
    try {
      console.log('Attempting to leave organization for user:', user.userId);
      
      await usersApi.leaveOrganization(user.userId);
      
      console.log('Successfully left organization');
      // Redirect to refresh the app state
      window.location.reload();
    } catch (error: any) {
      console.error('Error leaving organization:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert('Failed to leave organization. Please try again.');
    } finally {
      setLeavingOrg(false);
      setShowLeaveConfirm(false);
    }
  };

  return {
    handleSignOut,
    handleLeaveOrganization,
    confirmLeaveOrganization,
  };
}; 