import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Building2, Plus, AlertCircle } from 'lucide-react';

interface CreateOrganizationCardProps {
  createOrgData: {
    name: string;
    industry: string;
    nationality: string;
    description: string;
  };
  creatingOrg: boolean;
  createOrgError: string | null;
  onFormDataChange: (field: string, value: string) => void;
  onCreateOrganization: () => void;
}

export const CreateOrganizationCard: React.FC<CreateOrganizationCardProps> = ({
  createOrgData,
  creatingOrg,
  createOrgError,
  onFormDataChange,
  onCreateOrganization,
}) => {
  return (
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
              onChange={(e) => onFormDataChange('name', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Industry</label>
            <Input
              placeholder="e.g., Technology, Finance, Healthcare"
              value={createOrgData.industry}
              onChange={(e) => onFormDataChange('industry', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country/Region</label>
            <Input
              placeholder="e.g., United States, United Kingdom"
              value={createOrgData.nationality}
              onChange={(e) => onFormDataChange('nationality', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <Input
              placeholder="Brief description of your organization"
              value={createOrgData.description}
              onChange={(e) => onFormDataChange('description', e.target.value)}
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
          onClick={onCreateOrganization}
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
  );
}; 