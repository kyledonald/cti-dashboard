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

  // Check super admin requirement
  if (requireSuperAdmin && !permissions.isSuperAdmin) {
    return fallback || <UnauthorizedAccess message="Super admin access required" />;
  }

  // Check specific role requirement
  if (requireRole && user.role !== requireRole) {
    return fallback || <UnauthorizedAccess message={`${requireRole} role required`} />;
  }

  // Check multiple roles requirement
  if (requireRoles && !requireRoles.includes(user.role as UserRole)) {
    return fallback || <UnauthorizedAccess message="Insufficient role permissions" />;
  }

  // Check organization access requirement
  if (requireOrgAccess && !permissions.hasOrgAccess) {
    // If user is unassigned, show unassigned screen
    if (user.role === 'unassigned') {
      return fallback || <UnassignedUserScreen />;
    }
    // If user has a role but no org access, show org required page
    return fallback || <Navigate to="/organization-required" replace />;
  }

  // All checks passed - render children
  return <>{children}</>;
};

// Convenience components for specific protection levels
export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireSuperAdmin>{children}</ProtectedRoute>
);

export const OrgRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireOrgAccess>{children}</ProtectedRoute>
);

export const EditorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requireRole="editor">{children}</ProtectedRoute>
);

// Unauthorized access component
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

// Unassigned user screen
const UnassignedUserScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
          <svg className="h-10 w-10 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Waiting for Organization Assignment</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please wait for an organization administrator to add you to their organization to access the dashboard.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          An organization admin will add you and assign you to their team.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>What's next?</strong><br />
            An organization admin will invite you and assign you to their team. 
            You'll receive access to incidents, threat intelligence, and other security data.
          </p>
        </div>
      </div>
    </div>
  );
}; 