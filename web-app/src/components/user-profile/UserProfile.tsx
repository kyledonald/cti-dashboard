import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { UserProfileButton } from './UserProfileButton';
import { UserProfileDropdown } from './UserProfileDropdown';
import { useUserProfileState } from './hooks/useUserProfileState';
import { useUserProfileActions } from './hooks/useUserProfileActions';

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  
  // State management
  const {
    isOpen,
    setIsOpen,
    leavingOrg,
    setLeavingOrg,
    showLeaveConfirm,
    setShowLeaveConfirm,
    dropdownRef,
  } = useUserProfileState();

  // Actions
  const {
    handleSignOut,
    handleLeaveOrganization,
    confirmLeaveOrganization,
  } = useUserProfileActions({
    user,
    signOut,
    setLeavingOrg,
    setShowLeaveConfirm,
  });

  if (!user) return null;

  return (
    <div className="relative">
      <UserProfileButton
        user={user}
        onToggle={() => setIsOpen(!isOpen)}
      />

      <UserProfileDropdown
        user={user}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onLeaveOrganization={handleLeaveOrganization}
        onSignOut={handleSignOut}
        dropdownRef={dropdownRef}
      />
      
      {/* Leave Organization Confirmation */}
      <ConfirmDialog
        open={showLeaveConfirm}
        onOpenChange={setShowLeaveConfirm}
        title="Leave Organization"
        message="Are you sure you want to leave your organization? You will lose access to all organization data and will need to be re-invited to join again."
        confirmText="Leave Organization"
        cancelText="Stay"
        variant="warning"
        icon="leave"
        onConfirm={confirmLeaveOrganization}
        loading={leavingOrg}
      />
    </div>
  );
}; 