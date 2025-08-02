import { useCallback } from 'react';
import { type User } from '../../../api';

interface UseNotificationServiceProps {
  user: User | null;
}

export const useNotificationService = ({ user }: UseNotificationServiceProps) => {
  const sendAssignmentNotification = useCallback((assignedUser: User, incident: { incidentId: string; title: string }, isNewAssignment: boolean = true) => {
    if (!user || !assignedUser || assignedUser.userId === user.userId) {
      // Don't send notification if assigning to yourself
      return;
    }

    const actionText = isNewAssignment ? 'assigned to' : 'reassigned to';
    const notificationTitle = `Incident Assignment`;
    const notificationMessage = `You have been ${actionText} incident "${incident.title}" (ID: ${incident.incidentId})`;

    // Send targeted notification to specific user
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'security' as const,
      title: notificationTitle,
      message: notificationMessage,
      timestamp: new Date(),
      read: false,
      priority: 'high' as const,
      organizationId: user.organizationId,
      sentBy: user.userId,
      actionUrl: '/incidents',
      actionText: 'View Incidents'
    };

    // Store notification specifically for the assigned user
    const userNotifications = JSON.parse(localStorage.getItem(`notifications-${assignedUser.userId}`) || '[]');
    userNotifications.unshift(newNotification);
    localStorage.setItem(`notifications-${assignedUser.userId}`, JSON.stringify(userNotifications));
  }, [user]);

  const sendCommentNotification = useCallback((assignedUser: User, incident: { incidentId: string; title: string }, commenterName: string) => {
    if (!user || !assignedUser || assignedUser.userId === user.userId) {
      // Don't send notification if commenting on your own assigned incident
      return;
    }

    const notificationTitle = `New Comment on Assigned Incident`;
    const notificationMessage = `${commenterName} has added a comment on your assigned incident "${incident.title}" (ID: ${incident.incidentId})`;

    // Send targeted notification to specific user
    const newNotification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: 'security' as const,
      title: notificationTitle,
      message: notificationMessage,
      timestamp: new Date(),
      read: false,
      priority: 'medium' as const,
      organizationId: user.organizationId,
      sentBy: user.userId,
      actionUrl: '/incidents',
      actionText: 'View Incidents'
    };

    // Store notification specifically for the assigned user
    const userNotifications = JSON.parse(localStorage.getItem(`notifications-${assignedUser.userId}`) || '[]');
    userNotifications.unshift(newNotification);
    localStorage.setItem(`notifications-${assignedUser.userId}`, JSON.stringify(userNotifications));
  }, [user]);

  return {
    sendAssignmentNotification,
    sendCommentNotification
  };
}; 