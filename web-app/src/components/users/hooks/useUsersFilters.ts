interface EnhancedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  joinedAt?: Date | null;
}

interface UseUsersFiltersProps {
  users: EnhancedUser[];
  searchTerm: string;
  roleFilter: string;
}

export const useUsersFilters = ({ users, searchTerm, roleFilter }: UseUsersFiltersProps) => {
  // Filter users based on both search and filters
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return {
    filteredUsers,
  };
}; 
