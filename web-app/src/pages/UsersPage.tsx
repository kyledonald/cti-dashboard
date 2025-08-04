import React from 'react';
import { UsersPageHeader } from '../components/users/UsersPageHeader';
import { UsersFiltersCard } from '../components/users/UsersFiltersCard';
import { UsersLoadingState } from '../components/users/UsersLoadingState';
import { UsersListCard } from '../components/users/UsersListCard';
import { useUsersState } from '../components/users/hooks/useUsersState';
import { useUsersData } from '../components/users/hooks/useUsersData';
import { useUsersFilters } from '../components/users/hooks/useUsersFilters';
import { useUsersUtils } from '../components/users/hooks/useUsersUtils';

const UsersPage: React.FC = () => {
  const {
    users,
    setUsers,
    loading,
    setLoading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    user,
  } = useUsersState();

  useUsersData({ user, setUsers, setLoading });

  const { filteredUsers } = useUsersFilters({ users, searchTerm, roleFilter });

  const { getRoleColor, getInitials } = useUsersUtils();

  if (loading) {
    return <UsersLoadingState />;
  }

  return (
    <div className="space-y-6">
      <UsersPageHeader
        totalUsers={users.length}
        adminCount={users.filter(u => u.role === 'admin').length}
      />

      <UsersFiltersCard
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        onSearchChange={setSearchTerm}
        onRoleFilterChange={setRoleFilter}
      />

      <UsersListCard
        filteredUsers={filteredUsers}
        users={users}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        currentUserId={user?.userId}
        getRoleColor={getRoleColor}
        getInitials={getInitials}
        onPageChange={setCurrentPage}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
    </div>
  );
};

export default UsersPage; 
