import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../contexts/AuthContext';

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
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">CTI Dashboard</span>
            </div>
          )}
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems
              .filter(shouldShowNavItem)
              .map((item) => {
                const disabled = isNavItemDisabled(item);
                const active = isActive(item.path);
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={disabled ? (e) => e.preventDefault() : undefined}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                          : disabled
                          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                      title={disabled ? 'Organization access required' : item.description}
                    >
                      {/* Icon placeholder - you can add specific icons for each item */}
                      <div className={`mr-3 h-5 w-5 rounded ${
                        active ? 'bg-blue-600' : disabled ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-400 dark:bg-gray-500'
                      }`} />
                      
                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}; 