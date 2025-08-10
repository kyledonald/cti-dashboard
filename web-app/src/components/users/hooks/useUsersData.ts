import { useEffect } from 'react';
import { usersApi, type User } from '../../../api';

interface EnhancedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  joinedAt?: Date | null;
}

interface UseUsersDataProps {
  user: any;
  setUsers: (users: EnhancedUser[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useUsersData = ({ user, setUsers, setLoading }: UseUsersDataProps) => {
  const loadUsers = async () => {
    if (!user?.organizationId) return;
    
    setLoading(true);
    try {
      const allUsers = await usersApi.getAll();
      const orgUsers = allUsers.filter((u: User) => u.organizationId === user.organizationId);
      // Add join date to users
      const enhancedUsers: EnhancedUser[] = orgUsers.map(u => {
        // Convert Firestore timestamp to JS Date for join date
        const createdAt = u.createdAt ? 
          (u.createdAt._seconds ? new Date(u.createdAt._seconds * 1000) : new Date(u.createdAt)) : 
          null;

        return {
          ...u,
          joinedAt: createdAt
        };
      });
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load users data
  useEffect(() => {
    loadUsers();
  }, [user]);

  return {
    loadUsers,
  };
}; 
