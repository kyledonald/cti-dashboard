import React from 'react';
import { Button } from '../ui/button';

interface UserProfileButtonProps {
  user: any;
  onToggle: () => void;
}

export const UserProfileButton: React.FC<UserProfileButtonProps> = ({
  user,
  onToggle,
}) => {
  // Get initials from name or email
  const getInitials = (firstName: string, lastName: string, email: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    // Use email prefix
    const emailPrefix = email.split('@')[0];
    return emailPrefix.slice(0, 2).toUpperCase();
  };

  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {user.profilePictureUrl ? (
        <img
          src={user.profilePictureUrl}
          alt={`${user.firstName} ${user.lastName}`}
          className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {getInitials(user.firstName, user.lastName, user.email)}
        </div>
      )}
      <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
        {user.firstName} {user.lastName}
      </span>
      <svg
        className="h-4 w-4 text-gray-500 dark:text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </Button>
  );
}; 
