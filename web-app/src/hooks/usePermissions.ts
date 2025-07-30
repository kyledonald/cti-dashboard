import { useAuth } from '../contexts/AuthContext';
import { useMemo } from 'react';

export type UserRole = 'admin' | 'editor' | 'viewer' | 'unassigned';

export interface PermissionSet {
  // Organization-level permissions
  canManageOrgUsers: boolean; // Admin: add/remove users, change roles
  canViewOrgUsers: boolean;   // All assigned: view org directory
  canEditOrgSettings: boolean; // Admin: change org name, settings
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
  canViewMySoftware: boolean; // All assigned users can view/manage their software inventory
  canManageSoftwareInventory: boolean; // Admin and editor can manage software inventory
  
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
      // No user - no permissions
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
        canViewMySoftware: true, // Allow viewing My Software even without user
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
    // Admins can access everything (with or without org), others need org assignment
    const isOrgAdmin = isAdmin; // Admins are always org admins
    const hasOrgAccess = isAdmin || (isAssigned && (isEditor || isViewer));

    return {
      // Organization-level permissions
      canManageOrgUsers: isOrgAdmin, // Only org admins (admin role + assigned)
      canViewOrgUsers: isAssigned, // All assigned users can view org directory
      canEditOrgSettings: isOrgAdmin, // Only org admins (admin role + assigned)
      canViewOrgData: hasOrgAccess,
      
      // Data permissions (org-scoped)
      canCreateIncidents: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can create
      canEditIncidents: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can edit
      canDeleteIncidents: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can delete
      canViewIncidents: hasOrgAccess, // All assigned can view
      
      canViewThreatActors: hasOrgAccess, // All assigned can view
      canManageThreatActors: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can manage
      canViewCVEs: hasOrgAccess, // All assigned can view
      canManageCVEs: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can manage
      canViewMySoftware: true, // All roles can view My Software
      canManageSoftwareInventory: hasOrgAccess && (isAdmin || isEditor), // Admin and editor can manage software inventory
      
      // User state checks
      isAssigned,
      isOrgAdmin,
      isSuperAdmin: isAdmin, // Admin is the highest role in our system
      hasOrgAccess,
    };
  }, [user]);
};

// Convenience hook for role checking
export const useRole = () => {
  const { user } = useAuth();
  
  return useMemo(() => ({
    hasRole: (role: UserRole) => user?.role === role,
    hasAnyRole: (roles: UserRole[]) => user ? roles.includes(user.role as UserRole) : false,
    currentRole: user?.role as UserRole | null,
    isAuthenticated: !!user,
  }), [user]);
}; 