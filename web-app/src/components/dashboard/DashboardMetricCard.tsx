import React from 'react';
import { Card } from '../ui/card';

interface DashboardMetricCardProps {
  value: string | number;
  label: string;
  color: 'purple' | 'green' | 'red' | 'yellow' | 'pink' | 'orange' | 'indigo' | 'rose';
  isLoading?: boolean;
}

export const DashboardMetricCard: React.FC<DashboardMetricCardProps> = ({
  value,
  label,
  color,
  isLoading = false
}) => {
  const colorClasses = {
    purple: 'text-purple-600 dark:text-purple-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    pink: 'text-pink-600 dark:text-pink-400',
    orange: 'text-orange-600 dark:text-orange-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    rose: 'text-rose-600 dark:text-rose-400',
  };

  return (
    <Card className="p-6 flex flex-col items-center justify-center">
      <div className={`text-2xl font-bold ${colorClasses[color]}`}>
        {isLoading ? '...' : value}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        {label}
      </div>
    </Card>
  );
}; 