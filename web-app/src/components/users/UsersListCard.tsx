import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Users } from 'lucide-react';
import { UserCard } from './UserCard';
import { UsersPagination } from './UsersPagination';
import { UsersEmptyState } from './UsersEmptyState';

interface EnhancedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  joinedAt?: Date | null;
}

interface UsersListCardProps {
  filteredUsers: EnhancedUser[];
  users: EnhancedUser[];
  currentPage: number;
  itemsPerPage: number;
  currentUserId?: string;
  getRoleColor: (role: string) => string;
  getInitials: (firstName: string, lastName: string) => string;
  onPageChange: (page: number) => void;
  onScrollToTop: () => void;
}

export const UsersListCard: React.FC<UsersListCardProps> = ({
  filteredUsers,
  users,
  currentPage,
  itemsPerPage,
  currentUserId,
  getRoleColor,
  getInitials,
  onPageChange,
  onScrollToTop,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Organization Members ({filteredUsers.length})
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <UsersEmptyState hasUsers={users.length > 0} />
        ) : (
          <div className="space-y-4">
            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((u) => (
                  <UserCard
                    key={u.userId}
                    user={u}
                    currentUserId={currentUserId}
                    getRoleColor={getRoleColor}
                    getInitials={getInitials}
                  />
                ))}
            </div>

            <UsersPagination
              currentPage={currentPage}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onScrollToTop={onScrollToTop}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
