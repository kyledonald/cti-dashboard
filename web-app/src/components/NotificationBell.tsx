import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <div className="flex items-center gap-2">
                             {unreadCount > 0 && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={markAllAsRead}
                   className="text-xs p-1 h-auto text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                 >
                   <CheckCheck className="w-3 h-3 mr-1" />
                   Mark all read
                 </Button>
               )}
                {notifications.length > 0 && (
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={clearAll}
                   className="text-xs p-1 h-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                 >
                   <Trash2 className="w-3 h-3" />
                 </Button>
               )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-l-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1 pl-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${
                          notification.read ? 'text-gray-500 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Action Button */}
                        {notification.actionUrl && notification.actionText && (
                          <div className="mt-2">
                            <Link
                              to={notification.actionUrl}
                              onClick={() => {
                                markAsRead(notification.id);
                                setIsOpen(false);
                              }}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                            >
                              {notification.actionText} →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 