import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

interface EnhancedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  joinedAt?: Date | null;
}

export const useUsersState = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  return {
    // State
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
  };
}; 
