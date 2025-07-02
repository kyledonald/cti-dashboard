import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { organizationsApi, usersApi } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Building2, Plus, LogOut, AlertCircle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const UnassignedUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Create Organization State
  const [createOrgData, setCreateOrgData] = useState({
    name: '',
    industry: '',
    nationality: '',
    description: ''
  });
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [createOrgError, setCreateOrgError] = useState<string | null>(null);

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
      const orgData = {
        name: createOrgData.name.trim(),
        industry: createOrgData.industry.trim() || 'Technology',
        nationality: createOrgData.nationality.trim() || 'Unknown',
        description: createOrgData.description.trim() || ''
      };

      const response = await organizationsApi.create(orgData);
      const newOrg = response.organization;

      // Auto-assign the creator as admin
      await usersApi.update(user.userId, {
        organizationId: newOrg.organizationId,
        role: 'admin'
      });

      // Redirect to dashboard
      navigate('/dashboard');
      window.location.reload(); // Refresh to update user context
    } catch (error: any) {
      console.error('Error creating organization:', error);
      setCreateOrgError(error.response?.data?.error || 'Failed to create organization');
    } finally {
      setCreatingOrg(false);
    }
  };

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
              Get started by creating your own organization below.
            </p>
          </div>
        </div>

        {/* Single Organization Creation Option */}
        <div className="max-w-2xl mx-auto">
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
        </div>
      </div>
    </div>
  );
};

export default UnassignedUserPage; 