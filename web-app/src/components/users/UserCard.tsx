import React from 'react';
import { Calendar, Mail } from 'lucide-react';

interface EnhancedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  joinedAt?: Date | null;
}

interface UserCardProps {
  user: EnhancedUser;
  currentUserId?: string;
  getRoleColor: (role: string) => string;
  getInitials: (firstName: string, lastName: string) => string;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  currentUserId,
  getRoleColor,
  getInitials,
}) => {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="relative">
          {user.profilePictureUrl ? (
            <img 
              src={user.profilePictureUrl} 
              alt={`${user.firstName} ${user.lastName}`}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {getInitials(user.firstName, user.lastName)}
              </span>
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
            {user.userId === currentUserId && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                You
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Mail className="w-3 h-3" />
              <span>{user.email}</span>
            </div>
            {user.joinedAt && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Account Created: {user.joinedAt.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 
