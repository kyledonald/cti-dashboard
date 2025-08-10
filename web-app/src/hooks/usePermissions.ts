import { useAuth } from '../contexts/AuthContext';
import { useMemo } from 'react';

export type UserRole = 'admin' | 'editor' | 'viewer' | 'unassigned';

export interface PermissionSet {
  canManageOrgUsers: boolean;
  canViewOrgUsers: boolean;
  canEditOrgSettings: boolean;
  canViewOrgData: boolean;
  
  // Data permissions (org-scoped)
  canCreateIncidents: boolean;
  canEditIncidents: boolean;
  canDeleteIncidents: boolean;
  canViewIncidents: boolean;
  
  canViewThreatActors: boolean;
  canManageThreatActors: boolean;
  canViewCVEs: boolean;
  canManageCVEs: boolean;
  canViewMySoftware: boolean;
  canManageSoftwareInventory: boolean;
  
  // User state checks
  isAssigned: boolean;
  isOrgAdmin: boolean;
  isSuperAdmin: boolean;
  hasOrgAccess: boolean;
}

export const usePermissions = (): PermissionSet => {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user) {
      return {
        canManageOrgUsers: false,
        canViewOrgUsers: false,
        canEditOrgSettings: false,
        canViewOrgData: false,
        canCreateIncidents: false,
        canEditIncidents: false,
        canDeleteIncidents: false,
        canViewIncidents: false,
        canViewThreatActors: false,
        canManageThreatActors: false,
        canViewCVEs: false,
        canManageCVEs: false,
        canViewMySoftware: true,
        canManageSoftwareInventory: false,
        isAssigned: false,
        isOrgAdmin: false,
        isSuperAdmin: false,
        hasOrgAccess: false,
      };
    }

    const isAdmin = user.role === 'admin';
    const isEditor = user.role === 'editor';
    const isViewer = user.role === 'viewer';
    const isUnassigned = user.role === 'unassigned';
    const isAssigned = !!user.organizationId && !isUnassigned;
    const isOrgAdmin = isAdmin; // Admins are always org admins
    const hasOrgAccess = isAdmin || (isAssigned && (isEditor || isViewer));

    return {
      // Orglevel permissions
      canManageOrgUsers: isOrgAdmin, // Only org admins (admin role + assigned)
      canViewOrgUsers: isAssigned, // All assigned users can view org directory
      canEditOrgSettings: isOrgAdmin, // Only org admins (admin role + assigned)
      canViewOrgData: hasOrgAccess,
      
      // Data permissions (org-scoped)
      canCreateIncidents: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can create INCs
      canEditIncidents: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can edit INCs
      canDeleteIncidents: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can delete INCs
      canViewIncidents: hasOrgAccess, // All assigned can view INCs
      
      canViewThreatActors: hasOrgAccess, // All assigned can view TAs
      canManageThreatActors: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can manage TAs
      canViewCVEs: hasOrgAccess, // All assigned can view CVEs
      canManageCVEs: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can manage CVEs
      canViewMySoftware: true, // All roles can view 'My Software'
      canManageSoftwareInventory: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can manage software inventory
      
      // User state checks
      isAssigned,
      isOrgAdmin,
      isSuperAdmin: isAdmin,
      hasOrgAccess,
    };
  }, [user]);
};

// hook for role checking
export const useRole = () => {
  const { user } = useAuth();
  
  return useMemo(() => ({
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => user ? roles.includes(user.role as UserRole) : false,
    currentRole: user?.role as UserRole | null,
    isAuthenticated: !!user,
  }), [user]);
}; 
