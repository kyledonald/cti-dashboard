import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
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
      description: 'Overview and analytics',
      requirePermission: 'canViewOrgData',
    },
    {
      name: 'Incidents',
      path: '/incidents',
      description: 'Security incidents and responses',
      requirePermission: 'canViewIncidents',
    },
    {
      name: 'Threat Actors',
      path: '/threat-actors',
      description: 'Known threat actors and groups',
      requirePermission: 'canViewThreatActors',
    },
    {
      name: 'CVEs',
      path: '/cves',
      description: 'Common vulnerabilities and exposures',
      requirePermission: 'canViewCVEs',
    },
    {
      name: 'My Software',
      path: '/my-software',
      description: 'Manage your software inventory',
      requirePermission: 'canViewMySoftware',
    },
    {
      name: 'Users',
      path: '/users',
      description: 'Organization directory',
      requirePermission: 'canViewOrgUsers',
    },
    {
      name: 'Organization',
      path: '/organization',
      description: 'Organization management',
      requirePermission: 'canEditOrgSettings',
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
        <div className="flex items-center justify-between h-[4.5rem] px-4">
          {!isCollapsed && (
            <Link 
              to="/dashboard" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => window.innerWidth < 1024 && onClose()}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">CTI Dashboard</span>
            </Link>
          )}
          
          <div className="flex items-center space-x-2">
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
