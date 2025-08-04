import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LandingPageHeader } from '../components/landing-page/LandingPageHeader';
import { LandingPageHero } from '../components/landing-page/LandingPageHero';
import { LandingPageFeatures } from '../components/landing-page/LandingPageFeatures';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-all duration-500">
      <LandingPageHeader 
        theme={theme} 
        onToggleTheme={toggleTheme} 
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LandingPageHero />
        <LandingPageFeatures />
      </main>
    </div>
  );
};

export default LandingPage; 
