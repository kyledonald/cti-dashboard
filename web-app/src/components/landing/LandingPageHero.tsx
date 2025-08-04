import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';

export const LandingPageHero: React.FC = () => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
        Cyber Threat Intelligence Dashboard
      </h1>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Track security incidents, monitor vulnerabilities, and manage threat intelligence for your organization.
      </p>

      <Link to="/login">
        <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
          Get Started
        </Button>
      </Link>
    </div>
  );
}; 