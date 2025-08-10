import React from 'react';

interface User {
  role: string;
  organizationId?: string;
}

interface UserDeleteSectionProps {
  user: User;
  isDeletingAccount: boolean;
  deleteConfirmPassword: string;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
  onDeleteConfirmPasswordChange: (value: string) => void;
}

export const UserDeleteSection: React.FC<UserDeleteSectionProps> = ({
  user,
  isDeletingAccount,
  deleteConfirmPassword,
  loading,
  onEdit,
  onCancel,
  onSave,
  onDeleteConfirmPasswordChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-red-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Delete Account
          </h2>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            This action cannot be undone
          </p>
        </div>
        {!isDeletingAccount && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Account
          </button>
        )}
      </div>

      {isDeletingAccount ? (
        <form onSubmit={onSave} className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm">
                <p className="text-red-800 dark:text-red-200 font-medium mb-1">
                  Warning: This will permanently delete your account
                </p>
                <ul className="text-red-700 dark:text-red-300 space-y-1">
                  <li>• All your data will be permanently removed</li>
                  <li>• You will lose access to all organizations</li>
                  {user.role === 'admin' && user.organizationId && (
                    <li>• If you are the only admin in your organization, you must promote another user, or delete the organization before deleting your account</li>
                  )}
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter your password to confirm deletion
            </label>
            <input
              type="password"
              value={deleteConfirmPassword}
              onChange={(e) => onDeleteConfirmPasswordChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
              placeholder="Enter your password"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete My Account'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">
          Permanently delete your account and all associated data.
        </p>
      )}
    </div>
  );
}; 
