import React from 'react';
import { usePermissions, useRole, type UserRole } from '../../hooks/usePermissions';

interface IfRoleProps {
  role: UserRole;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface IfRolesProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface IfPermissionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  // Permission checks
  canManageOrgUsers?: boolean;
  canViewOrgUsers?: boolean;
  canEditOrgSettings?: boolean;
  canViewOrgData?: boolean;
  canCreateIncidents?: boolean;
  canEditIncidents?: boolean;
  canDeleteIncidents?: boolean;
  canViewIncidents?: boolean;
  canViewThreatActors?: boolean;
  canManageThreatActors?: boolean;
  canViewCVEs?: boolean;
  canManageCVEs?: boolean;
  // State checks
  requireAssigned?: boolean;
  requireOrgAccess?: boolean;
}

// Render children only if user has specific role
export const IfRole: React.FC<IfRoleProps> = ({ role, children, fallback }) => {
  const { hasRole } = useRole();
  return hasRole(role) ? <>{children}</> : <>{fallback}</>;
};

// Render children only if user has any of the specified roles
export const IfRoles: React.FC<IfRolesProps> = ({ roles, children, fallback }) => {
  const { hasAnyRole } = useRole();
  return hasAnyRole(roles) ? <>{children}</> : <>{fallback}</>;
};

// Render children only if user has specific permissions
export const IfPermission: React.FC<IfPermissionProps> = ({ 
  children, 
  fallback,
  canManageOrgUsers,
  canViewOrgUsers,
  canEditOrgSettings,
  canViewOrgData,
  canCreateIncidents,
  canEditIncidents,
  canDeleteIncidents,
  canViewIncidents,
  canViewThreatActors,
  canManageThreatActors,
  canViewCVEs,
  canManageCVEs,
  requireAssigned,
  requireOrgAccess
}) => {
  const permissions = usePermissions();

  // Check all specified permission requirements
  const hasPermission = (
    (canManageOrgUsers === undefined || permissions.canManageOrgUsers === canManageOrgUsers) &&
    (canViewOrgUsers === undefined || permissions.canViewOrgUsers === canViewOrgUsers) &&
    (canEditOrgSettings === undefined || permissions.canEditOrgSettings === canEditOrgSettings) &&
    (canViewOrgData === undefined || permissions.canViewOrgData === canViewOrgData) &&
    (canCreateIncidents === undefined || permissions.canCreateIncidents === canCreateIncidents) &&
    (canEditIncidents === undefined || permissions.canEditIncidents === canEditIncidents) &&
    (canDeleteIncidents === undefined || permissions.canDeleteIncidents === canDeleteIncidents) &&
    (canViewIncidents === undefined || permissions.canViewIncidents === canViewIncidents) &&
    (canViewThreatActors === undefined || permissions.canViewThreatActors === canViewThreatActors) &&
    (canManageThreatActors === undefined || permissions.canManageThreatActors === canManageThreatActors) &&
    (canViewCVEs === undefined || permissions.canViewCVEs === canViewCVEs) &&
    (canManageCVEs === undefined || permissions.canManageCVEs === canManageCVEs) &&
    (requireAssigned === undefined || permissions.isAssigned === requireAssigned) &&
    (requireOrgAccess === undefined || permissions.hasOrgAccess === requireOrgAccess)
  );

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

// Convenience components for common use cases
export const IfOrgSettings: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <IfPermission canEditOrgSettings={true} fallback={fallback}>{children}</IfPermission>
);

export const IfOrgAdmin: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <IfPermission canManageOrgUsers={true} fallback={fallback}>{children}</IfPermission>
);

export const IfCanCreateIncidents: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <IfPermission canCreateIncidents={true} fallback={fallback}>{children}</IfPermission>
);

export const IfCanEditIncidents: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <IfPermission canEditIncidents={true} fallback={fallback}>{children}</IfPermission>
);

export const IfCanDeleteIncidents: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <IfPermission canDeleteIncidents={true} fallback={fallback}>{children}</IfPermission>
);

export const IfAssigned: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <IfPermission requireAssigned={true} fallback={fallback}>{children}</IfPermission>
);

export const IfUnassigned: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ children, fallback }) => (
  <IfPermission requireAssigned={false} fallback={fallback}>{children}</IfPermission>
); 