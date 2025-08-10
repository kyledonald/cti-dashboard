import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { Organization } from '../../api';

interface OrganizationSettingsCardProps {
  organization: Organization | null;
  editingOrg: boolean;
  orgFormData: {
    name: string;
    industry: string;
    nationality: string;
    description: string;
  };
  user: any;
  onSave: () => void;
  onEdit: () => void;
  onCancel: () => void;
  onFormDataChange: (field: string, value: string) => void;
}

export const OrganizationSettingsCard: React.FC<OrganizationSettingsCardProps> = ({
  organization,
  editingOrg,
  orgFormData,
  user,
  onSave,
  onEdit,
  onCancel,
  onFormDataChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {organization ? 'Organization Settings' : 'Organization Details'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!organization && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Welcome!</strong> As an admin, you need to create your organisation first. 
              Fill in the details below to get started.
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organization Name
          </label>
          {!organization || editingOrg ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={orgFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange('name', e.target.value)}
                  placeholder="Enter organization name"
                  className="flex-1"
                />
                <Button onClick={onSave} size="sm">
                  {organization ? 'Save Changes' : 'Create Organization'}
                </Button>
                {organization && (
                  <Button 
                    onClick={onCancel}
                    variant="outline" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <Input
                  value={orgFormData.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange('description', e.target.value)}
                  placeholder="Organization description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <Input
                    value={orgFormData.industry}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange('industry', e.target.value)}
                    placeholder="e.g., Financial Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nationality
                  </label>
                  <Input
                    value={orgFormData.nationality}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFormDataChange('nationality', e.target.value)}
                    placeholder="e.g., United States"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {organization?.name || 'No organization name set'}
                  </div>
                  {organization?.description && (
                    <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {organization.description}
                    </div>
                  )}
                </div>
                <Button onClick={onEdit} variant="outline" size="sm">
                  Edit
                </Button>
              </div>
              
              {(organization?.industry || organization?.nationality) && (
                <div className="grid grid-cols-2 gap-4">
                  {organization?.industry && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Industry
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {organization.industry}
                      </div>
                    </div>
                  )}
                  {organization?.nationality && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nationality
                      </label>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {organization.nationality}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Organization ID
          </label>
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300 text-sm">
              {editingOrg 
                ? (user?.organizationId || 'Not assigned to organization')
                : (user?.organizationId ? '••••••••••••••••••••' : 'Not assigned to organization')
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
