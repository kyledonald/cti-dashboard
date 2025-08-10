import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/card';

interface DashboardQuickLinkCardProps {
  to: string;
  title: string;
  description: string;
  color: 'blue' | 'pink' | 'yellow' | 'indigo' | 'green' | 'orange';
}

export const DashboardQuickLinkCard: React.FC<DashboardQuickLinkCardProps> = ({
  to,
  title,
  description,
  color
}) => {
  const colorClasses = {
    blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    pink: 'hover:bg-pink-50 dark:hover:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    yellow: 'hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
    indigo: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    green: 'hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  };

  return (
    <Link to={to}>
      <Card className={`p-6 transition-colors cursor-pointer flex flex-col items-center ${colorClasses[color]}`}>
        <div className="text-2xl font-bold mb-2">{title}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
      </Card>
    </Link>
  );
}; 
