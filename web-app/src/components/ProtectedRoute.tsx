import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions, type UserRole } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: UserRole;
  requireRoles?: UserRole[];
  requireOrgAccess?: boolean;
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireRole,
  requireRoles,
  requireOrgAccess = false,
  requireSuperAdmin = false,
  fallback
}) => {
  const { user, loading } = useAuth();
  const permissions = usePermissions();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !permissions.isSuperAdmin) {
    return fallback || <UnauthorizedAccess message="Super admin access required" />;
  }

  if (requireRole && user.role !== requireRole) {
    return fallback || <UnauthorizedAccess message={`${requireRole} role required`} />;
  }

  if (requireRoles && !requireRoles.includes(user.role as UserRole)) {
    return fallback || <UnauthorizedAccess message="Insufficient role permissions" />;
  }

  if (requireOrgAccess && !permissions.hasOrgAccess) {
    // If user is unassigned, redirect to welcome page
    if (user.role === 'unassigned') {
      return fallback || <Navigate to="/welcome" replace />;
    }
    // If user has a role but no org access, show org required page
    return fallback || <Navigate to="/organization-required" replace />;
  }

  return <>{children}</>;
};

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireSuperAdmin>{children}</ProtectedRoute>
);

export const OrgRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireOrgAccess>{children}</ProtectedRoute>
);

export const EditorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireRole="editor">{children}</ProtectedRoute>
);

// Unauthorised access component
const UnauthorizedAccess: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{message}</p>
      <button 
        onClick={() => window.history.back()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);
