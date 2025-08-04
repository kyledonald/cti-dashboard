import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Edit } from 'lucide-react';
import type { User } from '../../api';

interface OrganizationUserManagementCardProps {
  organization: any;
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
}

export const OrganizationUserManagementCard: React.FC<OrganizationUserManagementCardProps> = ({
  organization,
  users,
  onAddUser,
  onEditUser,
}) => {
  if (!organization) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Manage users in your organization. Add new users, change roles, and remove access.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {users.length} member{users.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={onAddUser}
              className="flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User by Email
            </Button>
          </div>
        </div>

        {/* Current Organization Members */}
        {users.length > 0 && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg mt-8">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white">Organization Members</h4>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((orgUser) => (
                <div key={orgUser.userId} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      {orgUser.profilePictureUrl ? (
                        <img 
                          src={orgUser.profilePictureUrl} 
                          alt={`${orgUser.firstName} ${orgUser.lastName}`}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                          {orgUser.firstName[0]}{orgUser.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {orgUser.firstName} {orgUser.lastName}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {orgUser.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      orgUser.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                      orgUser.role === 'editor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      orgUser.role === 'viewer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }`}>
                      {orgUser.role}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEditUser(orgUser)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 