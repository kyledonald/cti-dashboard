import { useCallback } from 'react';

export const useIncidentStyling = () => {
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800 dark:text-blue-300';
      case 'Triaged': return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/10 dark:border-purple-800 dark:text-purple-300';
      case 'In Progress': return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-800 dark:text-yellow-300';
      case 'Resolved': return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/10 dark:border-green-800 dark:text-green-300';
      case 'Closed': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/10 dark:border-red-800 dark:text-red-300';
      default: return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-900/10 dark:border-gray-800 dark:text-gray-300';
    }
  }, []);

  return {
    getPriorityColor,
    getStatusColor
  };
}; 