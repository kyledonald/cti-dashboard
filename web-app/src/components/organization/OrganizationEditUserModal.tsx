import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Trash2, Save, X } from 'lucide-react';
import type { User } from '../../api';

interface OrganizationEditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  editUserRole: 'viewer' | 'editor' | 'admin';
  editUserError: string;
  editUserSuccess: string;
  editUserLoading: boolean;
  removeUserLoading: boolean;
  currentUser: any;
  onRoleChange: (role: 'viewer' | 'editor' | 'admin') => void;
  onUpdateUserRole: () => void;
  onRemoveUser: () => void;
  onCancel: () => void;
}

export const OrganizationEditUserModal: React.FC<OrganizationEditUserModalProps> = ({
  open,
  onOpenChange,
  editingUser,
  editUserRole,
  editUserError,
  editUserSuccess,
  editUserLoading,
  removeUserLoading,
  currentUser,
  onRoleChange,
  onUpdateUserRole,
  onRemoveUser,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 px-1">
          {editingUser && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  {editingUser.profilePictureUrl ? (
                    <img 
                      src={editingUser.profilePictureUrl} 
                      alt={`${editingUser.firstName} ${editingUser.lastName}`}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {editingUser.firstName[0]}{editingUser.lastName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {editingUser.firstName} {editingUser.lastName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {editingUser.email}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Role
            </label>
            <select
              value={editUserRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onRoleChange(e.target.value as 'viewer' | 'editor' | 'admin')}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
            {editingUser && currentUser && editingUser.userId === currentUser.userId && editingUser.role === 'admin' && editUserRole !== 'admin' && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                ⚠️ Warning: Organisations must always have at least one admin.
              </p>
            )}
          </div>

          {editUserError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{editUserError}</p>
            </div>
          )}

          {editUserSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm">{editUserSuccess}</p>
            </div>
          )}

          <div className="flex gap-3 justify-between pt-2">
            <Button
              variant="outline"
              onClick={onRemoveUser}
              disabled={removeUserLoading || editUserLoading || (editingUser?.userId === currentUser?.userId)}
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 disabled:opacity-50"
              title={editingUser && currentUser && editingUser.userId === currentUser.userId ? "You cannot remove yourself" : ""}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {removeUserLoading ? 'Removing...' : 'Remove from Org'}
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={onUpdateUserRole}
                disabled={editUserLoading || editUserRole === editingUser?.role || removeUserLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {editUserLoading ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
