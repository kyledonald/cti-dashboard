import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext.tsx';
import { useAuth } from './contexts/AuthContext.tsx';
import { UserProfile } from './components/UserProfile';
import { Sidebar } from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import { ProtectedRoute, OrgRoute } from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage.tsx';
import OrganizationPage from './pages/OrganizationPage.tsx';
import OrganizationRequiredPage from './pages/OrganizationRequiredPage.tsx';
import UsersPage from './pages/UsersPage.tsx';
import ThreatActorsPage from './pages/ThreatActorsPage.tsx';
import IncidentsPage from './pages/IncidentsPage.tsx';
import CVEsPage from './pages/CVEsPage.tsx';
import MySoftwarePage from './pages/MySoftwarePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import LandingPage from './pages/LandingPage.tsx';
import WelcomePage from './pages/WelcomePage.tsx';
import UserSettingsPage from './pages/UserSettingsPage.tsx';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        // Unauthenticated Routes - No sidebar/header
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      ) : (
        <Routes>
          {/* Welcome page for unassigned users who specifically need to create/join an org */}
          <Route path="/welcome" element={<WelcomePage />} />
          
          {user.role === 'unassigned' && !user.organizationId ? (
            // Only redirect unassigned users with no org to welcome
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          ) : (
            // Main App Routes - With sidebar/header
            <Route path="*" element={
              <div className="h-screen w-full flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-hidden">
                {/* Enhanced Sidebar with Role-Based Navigation */}
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                {/* Main Content */}
                <main className="flex-1 w-full min-h-screen">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    {/* Left side - Mobile menu button */}
                    <button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    
                    {/* Right side - Theme toggle, notifications, and user profile */}
                    <div className="flex items-center space-x-4 ml-auto">
                      {/* Theme Toggle */}
                      <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                      >
                        {theme === 'light' ? (
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Notification Bell */}
                      <NotificationBell />
                      
                      {/* User Profile */}
                      <UserProfile />
                    </div>
                  </div>
                </header>

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
                    
                    {/* Special Pages */}
                    <Route path="/organization-required" element={<OrganizationRequiredPage />} />
                    
                    <Route path="/my-software" element={<OrgRoute><MySoftwarePage /></OrgRoute>} />
                    
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </div>
              </main>
            </div>
          } />
          )}
        </Routes>
      )}
    </Router>
  );
}

export default App;
