import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';
// No additional imports needed - using inline SVGs
// import { IfSuperAdmin, IfPermission } from './PermissionGuards';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  requirePermission?: keyof ReturnType<typeof usePermissions>;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const permissions = usePermissions();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      description: 'Overview and key metrics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
        </svg>
      ),
    },
    {
      name: 'Incidents',
      path: '/incidents',
      description: 'Security incidents and responses',
      requirePermission: 'canViewIncidents',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
    },
    {
      name: 'Threat Actors',
      path: '/threat-actors',
      description: 'Known threat actors and groups',
      requirePermission: 'canViewThreatActors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: 'CVEs',
      path: '/cves',
      description: 'Common vulnerabilities and exposures',
      requirePermission: 'canViewCVEs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      name: 'Users',
      path: '/users',
      description: 'Organization directory',
      requirePermission: 'canViewOrgUsers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: 'Organization',
      path: '/organization',
      description: 'Organization management',
      requirePermission: 'canEditOrgSettings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4m0 0V9a2 2 0 012-2h2a2 2 0 012 2v12" />
        </svg>
      ),
    },
  ];

  const shouldShowNavItem = (item: NavItem): boolean => {
    // Show all items for viewers/editors (even without org) but they'll be disabled
    if (user?.role === 'viewer' || user?.role === 'editor') {
      return true;
    }
    
    // For other roles, check permissions normally
    if (item.requirePermission && !permissions[item.requirePermission]) {
      return false;
    }
    return true;
  };

  const isNavItemDisabled = (item: NavItem): boolean => {
    // For viewers/editors without org access, disable everything including dashboard
    if ((user?.role === 'viewer' || user?.role === 'editor') && !permissions.hasOrgAccess) {
      return true;
    }
    
    // Check if user has the required permission
    if (item.requirePermission && !permissions[item.requirePermission]) {
      return true;
    }
    
    return false;
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-16' : 'w-64'}
        lg:relative lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-[4.5rem] px-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">CTI Dashboard</span>
            </div>
          )}
          
          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
                        {navItems.filter(shouldShowNavItem).map((item) => {
              const disabled = isNavItemDisabled(item);
              
              if (disabled) {
                return (
                  <div
                    key={item.path}
                    className={`
                      group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                      text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={
                      isCollapsed 
                        ? `${item.name} - ${item.name === 'Organization' ? 'Requires admin permissions' : 'Requires organization assignment'}`
                        : item.name === 'Organization' ? 'Requires admin permissions' : 'Requires organization assignment'
                    }
                  >
                    <span className="flex-shrink-0 text-gray-400 dark:text-gray-600">
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <div className="ml-3 flex-1 min-w-0">
                        <span className="block truncate">{item.name}</span>
                        <span className="block text-xs text-gray-400 dark:text-gray-600 mt-0.5">
                          {item.name === 'Organization' ? 'Requires admin permissions' : 'Requires organization'}
                        </span>
                      </div>
                    )}
                    {!isCollapsed && (
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? `${item.name} - ${item.description}` : undefined}
                >
                  <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <div className="ml-3 flex-1 min-w-0">
                      <span className="block truncate">{item.name}</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Role indicator */}
          {!isCollapsed && (
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Access Level
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    user?.role === 'admin' ? 'bg-red-500' :
                    user?.role === 'editor' ? 'bg-yellow-500' :
                    user?.role === 'viewer' ? 'bg-green-500' :
                    user?.role === 'unassigned' ? 'bg-gray-400' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.role === 'admin' ? 'Admin' :
                     user?.role === 'editor' ? 'Editor' :
                     user?.role === 'viewer' ? 'Viewer' :
                     user?.role === 'unassigned' ? 'Unassigned' :
                     'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
}; 