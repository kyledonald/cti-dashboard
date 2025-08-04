import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { AppHeader } from './AppHeader';
import { ProtectedRoute, OrgRoute } from '../ProtectedRoute';
import DashboardPage from '../../pages/DashboardPage';
import OrganizationPage from '../../pages/OrganizationPage';
import UsersPage from '../../pages/UsersPage';
import ThreatActorsPage from '../../pages/ThreatActorsPage';
import IncidentsPage from '../../pages/IncidentsPage';
import CVEsPage from '../../pages/CVEsPage';
import MySoftwarePage from '../../pages/MySoftwarePage';
import UserSettingsPage from '../../pages/UserSettingsPage';
import TestingDashboardPage from '../../pages/TestingDashboardPage';
import OrganizationRequiredPage from '../../pages/OrganizationRequiredPage';

interface AppLayoutProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
}) => {
  return (
    <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
      {/* Enhanced Sidebar with Role-Based Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />

      {/* Main Content */}
      <main className="flex-1 w-full min-h-screen">
        {/* Header */}
        <AppHeader 
          onToggleSidebar={onToggleSidebar}
        />

        {/* Page Content */}
        <div className="p-6 bg-gray-50 dark:bg-gray-900 h-[calc(100vh-4.5rem)] overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<OrgRoute><DashboardPage /></OrgRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Organization-Scoped Routes */}
            <Route path="/users" element={<OrgRoute><UsersPage /></OrgRoute>} />
            <Route path="/organization" element={<ProtectedRoute requireRoles={['admin']}><OrganizationPage /></ProtectedRoute>} />
            <Route path="/incidents" element={<OrgRoute><IncidentsPage /></OrgRoute>} />
            <Route path="/threat-actors" element={<OrgRoute><ThreatActorsPage /></OrgRoute>} />
            <Route path="/cves" element={<OrgRoute><CVEsPage /></OrgRoute>} />
            
            {/* User Settings */}
            <Route path="/settings" element={<ProtectedRoute><UserSettingsPage /></ProtectedRoute>} />
            
            {/* Testing Dashboard - Development Only */}
            {import.meta.env.DEV && (
              <Route path="/testing" element={<TestingDashboardPage />} />
            )}
            
            {/* Special Pages */}
            <Route path="/organization-required" element={<OrganizationRequiredPage />} />
            
            <Route path="/my-software" element={<OrgRoute><MySoftwarePage /></OrgRoute>} />
            
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}; 