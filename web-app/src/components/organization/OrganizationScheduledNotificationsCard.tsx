import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  scheduledFor: Date;
  targetUsers: string[];
}

interface OrganizationScheduledNotificationsCardProps {
  organization: any;
  scheduledNotifications: ScheduledNotification[];
  showScheduledNotifications: boolean;
  onToggleScheduledNotifications: () => void;
  onCancelScheduledNotification: (id: string) => void;
  onShowNotificationMessage: (type: 'success' | 'error', text: string) => void;
}

export const OrganizationScheduledNotificationsCard: React.FC<OrganizationScheduledNotificationsCardProps> = ({
  organization,
  scheduledNotifications,
  showScheduledNotifications,
  onToggleScheduledNotifications,
  onCancelScheduledNotification,
  onShowNotificationMessage,
}) => {
  if (!organization || scheduledNotifications.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggleScheduledNotifications}
        >
          <span>Scheduled Notifications ({scheduledNotifications.length})</span>
          <svg 
            className={`w-5 h-5 transition-transform ${showScheduledNotifications ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </CardTitle>
      </CardHeader>
      {showScheduledNotifications && (
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Notifications scheduled to be sent automatically.
          </p>
          
          <div className="space-y-3">
            {scheduledNotifications.map((sn) => (
              <div key={sn.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{sn.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sn.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                        sn.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                      }`}>
                        {sn.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{sn.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Scheduled: {sn.scheduledFor.toLocaleString()}</span>
                      <span>Recipients: {sn.targetUsers.length}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCancelScheduledNotification(sn.id);
                      onShowNotificationMessage('success', 'Scheduled notification cancelled');
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 