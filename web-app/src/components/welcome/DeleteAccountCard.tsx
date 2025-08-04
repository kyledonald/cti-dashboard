import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteAccountCardProps {
  onShowDeleteDialog: () => void;
}

export const DeleteAccountCard: React.FC<DeleteAccountCardProps> = ({
  onShowDeleteDialog,
}) => {
  return (
    <Card className="border-red-200 dark:border-red-800">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-xl text-red-700 dark:text-red-300">Delete Account</CardTitle>
            <CardDescription>Permanently remove your account and all data</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">⚠️ Warning:</h4>
          <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
            <li>• This action cannot be undone</li>
            <li>• All your data will be permanently deleted</li>
            <li>• You'll need to create a new account to use the platform again</li>
          </ul>
        </div>

        <Button
          onClick={onShowDeleteDialog}
          variant="outline"
          className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete My Account
        </Button>
      </CardContent>
    </Card>
  );
}; 