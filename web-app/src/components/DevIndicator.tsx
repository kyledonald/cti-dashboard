import React from 'react';
import { Link } from 'react-router-dom';

const DevIndicator: React.FC = () => {
  // Only show in development mode
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2 text-sm">
          <span className="font-semibold">DEV</span>
          <Link 
            to="/testing" 
            className="text-blue-600 hover:text-blue-800 underline"
            title="Testing Dashboard"
          >
            🧪 Tests
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DevIndicator; 