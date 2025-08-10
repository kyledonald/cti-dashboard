import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface OrganizationAddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addUserEmail: string;
  addUserRole: 'viewer' | 'editor' | 'admin';
  addUserLoading: boolean;
  addUserError: string;
  onEmailChange: (email: string) => void;
  onRoleChange: (role: 'viewer' | 'editor' | 'admin') => void;
  onAddUser: () => void;
  onCancel: () => void;
}

export const OrganizationAddUserModal: React.FC<OrganizationAddUserModalProps> = ({
  open,
  onOpenChange,
  addUserEmail,
  addUserRole,
  addUserLoading,
  addUserError,
  onEmailChange,
  onRoleChange,
  onAddUser,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Organization</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              User Email
            </label>
            <Input
              type="email"
              value={addUserEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
              placeholder="user@example.com"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={addUserRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onRoleChange(e.target.value as 'viewer' | 'editor' | 'admin')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {addUserError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{addUserError}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={onAddUser}
              disabled={addUserLoading || !addUserEmail.trim()}
            >
              {addUserLoading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
