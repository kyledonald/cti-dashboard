import React from 'react';

interface UserPasswordSectionProps {
  isChangingPassword: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  loading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (e: React.FormEvent) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

export const UserPasswordSection: React.FC<UserPasswordSectionProps> = ({
  isChangingPassword,
  currentPassword,
  newPassword,
  confirmPassword,
  loading,
  onEdit,
  onCancel,
  onSave,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Change Password
        </h2>
        {!isChangingPassword && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Change Password
          </button>
        )}
      </div>

      {isChangingPassword ? (
        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
              minLength={8}
            />
          </div>
          
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <p className="font-medium">Password requirements:</p>
            <ul className="space-y-1 ml-4">
              <li className={`${newPassword.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                • At least 8 characters
              </li>
              <li className={`${/[A-Z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                • One uppercase letter
              </li>
              <li className={`${/[a-z]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                • One lowercase letter
              </li>
              <li className={`${/[0-9]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                • One number
              </li>
              <li className={`${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-green-600 dark:text-green-400' : ''}`}>
                • One special character
              </li>
            </ul>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Changing...' : 'Change Password'}
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
          Keep your account secure by using a strong, unique password.
        </p>
      )}
    </div>
  );
}; 
