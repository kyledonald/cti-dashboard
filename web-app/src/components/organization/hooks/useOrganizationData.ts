import { useEffect } from 'react';
import { organizationsApi, usersApi, type User } from '../../../api';

interface UseOrganizationDataProps {
  user: any;
  setOrganization: (org: any) => void;
  setUsers: (users: User[]) => void;
  setOrgFormData: (data: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useOrganizationData = ({
  user,
  setOrganization,
  setUsers,
  setOrgFormData,
  setLoading,
}: UseOrganizationDataProps) => {
  // Load org data
  useEffect(() => {
    const loadOrganizationData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Load org details
        const orgResponse = await organizationsApi.getById(user.organizationId);
        const orgData = orgResponse.organization || orgResponse;
        setOrganization(orgData);
        setOrgFormData({
          name: orgData.name || '',
          description: orgData.description || '',
          industry: orgData.industry || '',
          nationality: orgData.nationality || '',
        });

        // Load org users
        const allUsers = await usersApi.getAll();
        const orgUsers = allUsers.filter((u: User) => u.organizationId === user.organizationId);
        setUsers(orgUsers);

      } catch (error) {
        console.error('Error loading organization data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, [user?.organizationId, setOrganization, setUsers, setOrgFormData, setLoading]);
}; 
