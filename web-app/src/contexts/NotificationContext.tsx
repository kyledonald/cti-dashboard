import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'password_reminder' | 'system' | 'security' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  incidentId?: string; // For incident-specific notifications
  priority: 'low' | 'medium' | 'high';
  organizationId?: string; // For organization-scoped notifications
  sentBy?: string; // User ID of who sent the notification
}

export interface ScheduledNotification {
  id: string;
  type: 'password_reminder' | 'system' | 'security' | 'info';
  title: string;
  message: string;
  scheduledFor: Date;
  priority: 'low' | 'medium' | 'high';
  organizationId: string;
  sentBy: string;
  targetUsers: string[]; // Array of user IDs
  actionUrl?: string;
  actionText?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  scheduledNotifications: ScheduledNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  addOrganizationNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'organizationId' | 'sentBy'>) => void;
  scheduleNotification: (notification: Omit<ScheduledNotification, 'id' | 'organizationId' | 'sentBy'>) => void;
  cancelScheduledNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    if (user) {
      // Load personal notifications
      const saved = localStorage.getItem(`notifications-${user.userId}`);
      let personalNotifications: Notification[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          personalNotifications = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
        } catch (error) {
          console.error('Error loading personal notifications:', error);
        }
      }

      // Load organization notifications if user is in an organization
      let orgNotifications: Notification[] = [];
      if (user.organizationId) {
        const orgSaved = localStorage.getItem(`org-notifications-${user.organizationId}`);
        if (orgSaved) {
          try {
            const parsed = JSON.parse(orgSaved);
            orgNotifications = parsed.map((n: any) => ({
              ...n,
              timestamp: new Date(n.timestamp)
            }));
          } catch (error) {
            console.error('Error loading organization notifications:', error);
          }
        }
      }

      // Combine and sort by timestamp (newest first)
      const allNotifications = [...personalNotifications, ...orgNotifications]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setNotifications(allNotifications);

      // Load scheduled notifications if user is in an organization
      if (user.organizationId) {
        const scheduledSaved = localStorage.getItem(`scheduled-notifications-${user.organizationId}`);
        if (scheduledSaved) {
          try {
            const parsed = JSON.parse(scheduledSaved);
            const scheduledNotifications = parsed.map((n: any) => ({
              ...n,
              scheduledFor: new Date(n.scheduledFor)
            }));
            setScheduledNotifications(scheduledNotifications);
          } catch (error) {
            console.error('Error loading scheduled notifications:', error);
          }
        }
      }
    }
  }, [user]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (user && notifications.length > 0) {
      // Separate personal and organization notifications
      const personalNotifications = notifications.filter(n => !n.organizationId);
      const orgNotifications = notifications.filter(n => n.organizationId === user.organizationId);
      
      // Save personal notifications
      if (personalNotifications.length > 0) {
        localStorage.setItem(`notifications-${user.userId}`, JSON.stringify(personalNotifications));
      }
      
      // Save organization notifications (if user is in an org and there are org notifications)
      if (user.organizationId && orgNotifications.length > 0) {
        localStorage.setItem(`org-notifications-${user.organizationId}`, JSON.stringify(orgNotifications));
      }
    }
  }, [notifications, user]);



  // Check for scheduled notifications that are ready to be sent
  useEffect(() => {
    if (!user?.organizationId || scheduledNotifications.length === 0) return;

    const checkScheduledNotifications = () => {
      const now = new Date();
      const readyToSend = scheduledNotifications.filter(sn => sn.scheduledFor <= now);
      
      if (readyToSend.length > 0) {
        // Send the ready notifications
        readyToSend.forEach(sn => {
          // Create notification for each target user
          const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            type: sn.type,
            title: sn.title,
            message: sn.message,
            timestamp: new Date(),
            read: false,
            priority: sn.priority,
            organizationId: sn.organizationId,
            sentBy: sn.sentBy,
            actionUrl: sn.actionUrl,
            actionText: sn.actionText
          };

          // Add to organization notifications
          const orgNotifications = JSON.parse(localStorage.getItem(`org-notifications-${sn.organizationId}`) || '[]');
          orgNotifications.unshift(newNotification);
          localStorage.setItem(`org-notifications-${sn.organizationId}`, JSON.stringify(orgNotifications));
        });

        // Remove sent notifications from scheduled list
        const remainingScheduled = scheduledNotifications.filter(sn => sn.scheduledFor > now);
        setScheduledNotifications(remainingScheduled);
        localStorage.setItem(`scheduled-notifications-${user.organizationId}`, JSON.stringify(remainingScheduled));

        // Refresh current notifications
        const orgNotifications = JSON.parse(localStorage.getItem(`org-notifications-${user.organizationId}`) || '[]');
        const personalNotifications = JSON.parse(localStorage.getItem(`notifications-${user.userId}`) || '[]');
        const allNotifications = [...personalNotifications, ...orgNotifications]
          .map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) }))
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setNotifications(allNotifications);
      }
    };

    // Check immediately and then every minute
    checkScheduledNotifications();
    const interval = setInterval(checkScheduledNotifications, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user, scheduledNotifications]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const addOrganizationNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read' | 'organizationId' | 'sentBy'>) => {
    if (!user?.organizationId) return;

    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      organizationId: user.organizationId,
      sentBy: user.userId
    };

    // Store organization notification for all users in the organization
    const orgNotifications = JSON.parse(localStorage.getItem(`org-notifications-${user.organizationId}`) || '[]');
    orgNotifications.unshift(newNotification); // Add to beginning for newest first
    localStorage.setItem(`org-notifications-${user.organizationId}`, JSON.stringify(orgNotifications));

    // Update current user's notifications immediately
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updatedNotifications = prev.map(n => n.id === id ? { ...n, read: true } : n);
      
      if (user) {
        // Separate personal and organization notifications
        const personalNotifications = updatedNotifications.filter(n => !n.organizationId);
        const orgNotifications = updatedNotifications.filter(n => n.organizationId === user.organizationId);
        
        // Update localStorage for personal notifications
        localStorage.setItem(`notifications-${user.userId}`, JSON.stringify(personalNotifications));
        
        // Update localStorage for organization notifications
        if (user.organizationId) {
          localStorage.setItem(`org-notifications-${user.organizationId}`, JSON.stringify(orgNotifications));
        }
      }
      
      return updatedNotifications;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updatedNotifications = prev.map(n => ({ ...n, read: true }));
      
      if (user) {
        // Separate personal and organization notifications
        const personalNotifications = updatedNotifications.filter(n => !n.organizationId);
        const orgNotifications = updatedNotifications.filter(n => n.organizationId === user.organizationId);
        
        // Update localStorage for personal notifications
        localStorage.setItem(`notifications-${user.userId}`, JSON.stringify(personalNotifications));
        
        // Update localStorage for organization notifications
        if (user.organizationId) {
          localStorage.setItem(`org-notifications-${user.organizationId}`, JSON.stringify(orgNotifications));
        }
      }
      
      return updatedNotifications;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updatedNotifications = prev.filter(n => n.id !== id);
      
      if (user) {
        // Separate personal and organization notifications
        const personalNotifications = updatedNotifications.filter(n => !n.organizationId);
        const orgNotifications = updatedNotifications.filter(n => n.organizationId === user.organizationId);
        
        // Update localStorage for personal notifications
        localStorage.setItem(`notifications-${user.userId}`, JSON.stringify(personalNotifications));
        
        // Update localStorage for organization notifications
        if (user.organizationId) {
          localStorage.setItem(`org-notifications-${user.organizationId}`, JSON.stringify(orgNotifications));
        }
      }
      
      return updatedNotifications;
    });
  };

  const clearAll = () => {
    setNotifications([]);
    if (user) {
      localStorage.removeItem(`notifications-${user.userId}`);
      if (user.organizationId) {
        localStorage.removeItem(`org-notifications-${user.organizationId}`);
      }
    }
  };

  const scheduleNotification = (notificationData: Omit<ScheduledNotification, 'id' | 'organizationId' | 'sentBy'>) => {
    if (!user?.organizationId) return;

    const newScheduledNotification: ScheduledNotification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      organizationId: user.organizationId,
      sentBy: user.userId
    };

    const updatedScheduled = [...scheduledNotifications, newScheduledNotification];
    setScheduledNotifications(updatedScheduled);
    
    // Save to localStorage
    localStorage.setItem(`scheduled-notifications-${user.organizationId}`, JSON.stringify(updatedScheduled));
  };

  const cancelScheduledNotification = (id: string) => {
    const updatedScheduled = scheduledNotifications.filter(n => n.id !== id);
    setScheduledNotifications(updatedScheduled);
    
    // Update localStorage
    if (user?.organizationId) {
      localStorage.setItem(`scheduled-notifications-${user.organizationId}`, JSON.stringify(updatedScheduled));
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      scheduledNotifications,
      unreadCount,
      addNotification,
      addOrganizationNotification,
      scheduleNotification,
      cancelScheduledNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 