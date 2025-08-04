import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import WelcomePage from '../../pages/WelcomePage';

interface AuthenticatedRoutesProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
  hasOrganization: boolean;
}

export const AuthenticatedRoutes: React.FC<AuthenticatedRoutesProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onCloseSidebar,
  hasOrganization,
}) => {
  if (hasOrganization) {
    // Users with organizations - NO ACCESS to welcome page
    return (
      <Routes>
        {/* Redirect ANY user with an organization away from welcome page */}
        <Route path="/welcome" element={<Navigate to="/dashboard" replace />} />
        
        {/* Main App Routes - With sidebar/header */}
        <Route path="*" element={
          <AppLayout
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={onToggleSidebar}
            onCloseSidebar={onCloseSidebar}
          />
        } />
      </Routes>
    );
  } else {
    // Users WITHOUT organizations - Only these can access welcome page
    return (
      <Routes>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    );
  }
}; 