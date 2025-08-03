import React from 'react';
import { Card } from '../ui/card';
import { Shield, AlertTriangle, Activity } from 'lucide-react';

interface ThreatActorStatisticsProps {
  statistics: {
    total: number;
    active: number;
    highRisk: number;
  };
}

export const ThreatActorStatistics: React.FC<ThreatActorStatisticsProps> = ({
  statistics
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Actors</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
            <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.active}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Risk</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.highRisk}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}; 