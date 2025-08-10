import { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.tsx';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { UnauthenticatedRoutes } from './components/layout/UnauthenticatedRoutes';
import { AuthenticatedRoutes } from './components/layout/AuthenticatedRoutes';
import DevIndicator from './components/DevIndicator.tsx';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      {/* Environment Indicator - Only shown in dev */}
      <DevIndicator />
      
      {!user ? (
        <UnauthenticatedRoutes />
      ) : (
        <AuthenticatedRoutes
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          hasOrganization={!!(user.organizationId && user.organizationId.trim() !== '')}
        />
      )}
    </Router>
  );
}

export default App;
