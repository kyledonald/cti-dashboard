import React from 'react';
import { Card } from '../ui/card';

interface DashboardChartCardProps {
  title: string;
  children: React.ReactNode;
  centerChart?: boolean;
}

export const DashboardChartCard: React.FC<DashboardChartCardProps> = ({
  title,
  children,
  centerChart = false
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className={centerChart ? "flex justify-center" : ""}>
        <div className="w-full max-w-2xl h-72 mx-auto">
          {children}
        </div>
      </div>
    </Card>
  );
}; 
