import React from 'react';
import { ConfirmDialog } from '../ConfirmDialog';
import type { User } from '../../api';

interface OrganizationConfirmationDialogsProps {
  showRemoveUserConfirm: boolean;
  showDeleteOrgConfirm: boolean;
  editingUser: User | null;
  removeUserLoading: boolean;
  deleteOrgLoading: boolean;
  onRemoveUserConfirmOpenChange: (open: boolean) => void;
  onDeleteOrgConfirmOpenChange: (open: boolean) => void;
  onConfirmRemoveUser: () => void;
  onConfirmDeleteOrganization: () => void;
}

export const OrganizationConfirmationDialogs: React.FC<OrganizationConfirmationDialogsProps> = ({
  showRemoveUserConfirm,
  showDeleteOrgConfirm,
  editingUser,
  removeUserLoading,
  deleteOrgLoading,
  onRemoveUserConfirmOpenChange,
  onDeleteOrgConfirmOpenChange,
  onConfirmRemoveUser,
  onConfirmDeleteOrganization,
}) => {
  return (
    <>
      {/* Remove User Confirmation */}
      <ConfirmDialog
        open={showRemoveUserConfirm}
        onOpenChange={onRemoveUserConfirmOpenChange}
        title="Remove User from Organization"
        message={editingUser ? `Are you sure you want to remove ${editingUser.firstName} ${editingUser.lastName} from the organization? They will be set to unassigned status and lose access to all organization data.` : ''}
        confirmText="Remove User"
        cancelText="Cancel"
        variant="destructive"
        icon="delete"
        onConfirm={onConfirmRemoveUser}
        loading={removeUserLoading}
      />

      {/* Delete Organization Confirmation */}
      <ConfirmDialog
        open={showDeleteOrgConfirm}
        onOpenChange={onDeleteOrgConfirmOpenChange}
        title="Delete Organization"
        message="Are you sure you want to delete this organization? This action cannot be undone."
        confirmText="Delete Organization"
        cancelText="Cancel"
        variant="destructive"
        icon="delete"
        onConfirm={onConfirmDeleteOrganization}
        loading={deleteOrgLoading}
      />
    </>
  );
}; 
