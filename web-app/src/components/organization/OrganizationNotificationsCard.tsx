import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { User } from '../../api';

interface OrganizationNotificationsCardProps {
  organization: any;
  users: User[];
  loading: boolean;
  notificationMessage: { type: 'success' | 'error', text: string } | null;
  customTitle: string;
  customMessage: string;
  notificationPriority: 'low' | 'medium' | 'high';
  scheduleDate: string;
  scheduleTime: string;
  selectedUsers: string[];
  selectAll: boolean;
  schedulingNotification: boolean;
  onTriggerPasswordReminder: () => void;
  onCustomTitleChange: (title: string) => void;
  onCustomMessageChange: (message: string) => void;
  onNotificationPriorityChange: (priority: 'low' | 'medium' | 'high') => void;
  onScheduleDateChange: (date: string) => void;
  onScheduleTimeChange: (time: string) => void;
  onUserSelection: (userId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onSendCustomNotification: () => void;
}

export const OrganizationNotificationsCard: React.FC<OrganizationNotificationsCardProps> = ({
  organization,
  users,
  loading,
  notificationMessage,
  customTitle,
  customMessage,
  notificationPriority,
  scheduleDate,
  scheduleTime,
  selectedUsers,
  selectAll,
  schedulingNotification,
  onTriggerPasswordReminder,
  onCustomTitleChange,
  onCustomMessageChange,
  onNotificationPriorityChange,
  onScheduleDateChange,
  onScheduleTimeChange,
  onUserSelection,
  onSelectAll,
  onSendCustomNotification,
}) => {
  if (!organization) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Schedule Notifications (Admin Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {notificationMessage && (
          <div className={`p-3 rounded-lg border ${
            notificationMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            <p className="text-sm">{notificationMessage.text}</p>
          </div>
        )}

        {/* Password Reminder Section */}
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Quick Org Actions</h4>
            <Button 
              onClick={onTriggerPasswordReminder} 
              className="bg-yellow-600 text-white hover:bg-yellow-700 border-yellow-600 hover:border-yellow-700"
            >
              Trigger Password Reset Reminder
            </Button>
          </div>
        </div>

        {/* Custom Notification Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Custom Notification</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Send a custom notification to selected org members.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <Input
                value={customTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onCustomTitleChange(e.target.value)}
                placeholder="Notification title..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onCustomMessageChange(e.target.value)}
                placeholder="Notification message..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div>
              <label htmlFor="notification-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                id="notification-priority"
                value={notificationPriority}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onNotificationPriorityChange(e.target.value as 'low' | 'medium' | 'high')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            {/* Schedule Section */}
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <h5 className="font-medium text-gray-900 dark:text-white">Schedule (Optional)</h5>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="schedule-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onScheduleDateChange(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
                <div>
                  <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <Input
                    id="schedule-time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onScheduleTimeChange(e.target.value)}
                    className="w-full [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Leave empty to send immediately
              </p>
            </div>

            {/* User Selection Section */}
            <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-gray-900 dark:text-white">Select Recipients</h5>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSelectAll(e.target.checked)}
                    disabled={loading || users.length === 0}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Select All</span>
                </label>
              </div>
              
              <div className="max-h-40 overflow-y-auto space-y-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                {loading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Loading users...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">No users found in organization</div>
                  </div>
                ) : (
                  users.map((orgUser) => (
                    <label key={orgUser.userId} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(orgUser.userId)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUserSelection(orgUser.userId, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {orgUser.profilePictureUrl ? (
                            <img 
                              src={orgUser.profilePictureUrl} 
                              alt={`${orgUser.firstName} ${orgUser.lastName}`}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <span className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                              {orgUser.firstName[0]}{orgUser.lastName[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {orgUser.firstName} {orgUser.lastName}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          orgUser.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                          orgUser.role === 'editor' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {orgUser.role}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
              
              {selectedUsers.length > 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            <Button 
              onClick={onSendCustomNotification}
              disabled={loading || schedulingNotification || !customTitle.trim() || !customMessage.trim() || selectedUsers.length === 0}
              className="w-full"
            >
              {loading ? 'Loading users...' : 
               schedulingNotification ? 'Scheduling...' : 
               scheduleDate && scheduleTime ? 'Schedule Notification' : 'Send Notification'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 