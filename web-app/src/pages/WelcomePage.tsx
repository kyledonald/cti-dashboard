import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { organizationsApi, usersApi } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Building2, Plus, LogOut, AlertCircle, Trash2 } from 'lucide-react';
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, firebaseUser } = useAuth();
  
  // Create Organization State
  const [createOrgData, setCreateOrgData] = useState({
    name: '',
    industry: '',
    nationality: '',
    description: ''
  });
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [createOrgError, setCreateOrgError] = useState<string | null>(null);

  // Delete Account State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // The auth context will handle redirecting to login
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateOrganization = async () => {
    if (!user || !createOrgData.name.trim()) {
      setCreateOrgError('Organization name is required');
      return;
    }

    setCreatingOrg(true);
    setCreateOrgError(null);

    try {
      // First, ensure user exists in backend by attempting to fetch user data
      try {
        await usersApi.getById(user.userId);
      } catch (userError: any) {
        if (userError.response?.status === 404) {
          setCreateOrgError('User account is still being set up. Please wait a moment and try again, or sign out and back in.');
          setCreatingOrg(false);
          return;
        }
      }

      const orgData = {
        name: createOrgData.name.trim(),
        industry: createOrgData.industry.trim() || 'Technology',
        nationality: createOrgData.nationality.trim() || 'Unknown',
        description: createOrgData.description.trim() || ''
      };

      const response = await organizationsApi.create(orgData);
      const newOrg = response.organization;

      // Auto-assign the creator as admin with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await usersApi.update(user.userId, {
            organizationId: newOrg.organizationId,
            role: 'admin'
          });
          break; // Success, exit retry loop
        } catch (updateError: any) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw updateError; // Re-throw if all retries failed
          }
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Redirect to dashboard
      navigate('/dashboard');
      window.location.reload(); // Refresh to update user context
    } catch (error: any) {
      console.error('Error creating organization:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create organization';
      
      if (errorMessage.includes('User not found') || errorMessage.includes('user not found')) {
        setCreateOrgError('User account is still being set up. Please sign out and back in, then try again.');
      } else {
        setCreateOrgError(errorMessage);
      }
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !firebaseUser || !firebaseUser.email) return;

    setDeletingAccount(true);
    setDeleteError(null);

    try {
      // Re-authenticate user for Google sign-in users (no password needed)
      if (firebaseUser.providerData[0]?.providerId === 'google.com') {
        // For Google users, we can't re-authenticate with password
        // Delete from backend first
        await usersApi.delete(user.userId);
        
        // Delete Firebase user
        await deleteUser(firebaseUser);
      } else {
        // For email/password users, re-authenticate first
        if (!deletePassword) {
          setDeleteError('Password is required to delete your account');
          setDeletingAccount(false);
          return;
        }

        const credential = EmailAuthProvider.credential(firebaseUser.email, deletePassword);
        await reauthenticateWithCredential(firebaseUser, credential);

        // Delete from backend first
        await usersApi.delete(user.userId);

        // Delete Firebase user
        await deleteUser(firebaseUser);
      }

      // Sign out after deletion
      await signOut(auth);
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setDeleteError('Incorrect password');
      } else if (error.code === 'auth/requires-recent-login') {
        setDeleteError('Please sign out and sign back in before deleting your account');
      } else {
        setDeleteError(error.message || 'Failed to delete account');
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const isGoogleUser = firebaseUser?.providerData[0]?.providerId === 'google.com';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header with Sign Out */}
        <div className="relative mb-12">
          {/* Sign Out Button - Absolute positioned top right */}
          <div className="absolute top-0 right-0 flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
          
          {/* Centered Title */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to CTI Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Get started by creating your own organization below. Or, ask your admin to add your email to their organization!
            </p>
          </div>
        </div>

        {/* Single Organization Creation Option */}
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Organization Option */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl">Create Organization</CardTitle>
                  <CardDescription>Start your own CTI organization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Perfect if you:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Want to manage your own threat intelligence</li>
                  <li>• Need to add team members by email</li>
                  <li>• Require full administrative control</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Organization Name *</label>
                  <Input
                    placeholder="e.g., Acme Security Team"
                    value={createOrgData.name}
                    onChange={(e) => setCreateOrgData({ ...createOrgData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Industry</label>
                  <Input
                    placeholder="e.g., Technology, Finance, Healthcare"
                    value={createOrgData.industry}
                    onChange={(e) => setCreateOrgData({ ...createOrgData, industry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country/Region</label>
                  <Input
                    placeholder="e.g., United States, United Kingdom"
                    value={createOrgData.nationality}
                    onChange={(e) => setCreateOrgData({ ...createOrgData, nationality: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <Input
                    placeholder="Brief description of your organization"
                    value={createOrgData.description}
                    onChange={(e) => setCreateOrgData({ ...createOrgData, description: e.target.value })}
                  />
                </div>
              </div>

              {createOrgError && (
                <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{createOrgError}</span>
                </div>
              )}

              <Button
                onClick={handleCreateOrganization}
                disabled={creatingOrg || !createOrgData.name.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {creatingOrg ? (
                  <>Creating Organization...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Organization
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account Option */}
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
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteDialog && (
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
                    onChange={(e) => setDeletePassword(e.target.value)}
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
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setDeletePassword('');
                    setDeleteError(null);
                  }}
                  disabled={deletingAccount}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount || (!isGoogleUser && !deletePassword)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WelcomePage; 