import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Trash2, AlertCircle } from 'lucide-react';

interface DeleteAccountDialogProps {
  showDeleteDialog: boolean;
  deletePassword: string;
  deleteError: string | null;
  deletingAccount: boolean;
  isGoogleUser: boolean;
  onPasswordChange: (password: string) => void;
  onDeleteAccount: () => void;
  onCancel: () => void;
}

export const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  showDeleteDialog,
  deletePassword,
  deleteError,
  deletingAccount,
  isGoogleUser,
  onPasswordChange,
  onDeleteAccount,
  onCancel,
}) => {
  if (!showDeleteDialog) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-700 dark:text-red-300">Delete Account</CardTitle>
              <CardDescription>Are you absolutely sure? This action cannot be undone.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isGoogleUser && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter your password to confirm:
              </label>
              <Input
                type="password"
                placeholder="Password"
                value={deletePassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          
          {isGoogleUser && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Since you signed in with Google, no password confirmation is required.
              </p>
            </div>
          )}

          {deleteError && (
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{deleteError}</span>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={deletingAccount}
            >
              Cancel
            </Button>
            <Button
              onClick={onDeleteAccount}
              disabled={deletingAccount || (!isGoogleUser && !deletePassword)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingAccount ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
