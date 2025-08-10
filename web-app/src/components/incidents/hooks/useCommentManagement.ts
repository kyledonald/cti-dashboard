import { useState, useCallback } from 'react';
import { incidentsApi, type Incident, type User } from '../../../api';

interface UseCommentManagementProps {
  user: User | null;
  users: User[];
  setIncidents: (incidents: Incident[]) => void;
  viewingIncident: Incident | null;
  setViewingIncident: (incident: Incident | null) => void;
  setError: (error: string) => void;
  sendCommentNotification: (assignedUser: User, incident: { incidentId: string; title: string }, commenterName: string) => void;
}

export const useCommentManagement = ({
  user,
  users,
  setIncidents,
  viewingIncident,
  setViewingIncident,
  setError,
  sendCommentNotification
}: UseCommentManagementProps) => {
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleAddComment = useCallback(async (incidentId: string) => {
    if (!user || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await incidentsApi.addComment({
        incidentId,
        content: newComment.trim(),
        userId: user.userId,
        userName: `${user.firstName} ${user.lastName}`
      });
      
      // Reload incidents to get updated comments
      const incidentsData = await incidentsApi.getAll();
      const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
      setIncidents(orgIncidents);
      
      // Update viewing incident
      if (viewingIncident && viewingIncident.incidentId === incidentId) {
        const updatedIncident = orgIncidents.find(inc => inc.incidentId === incidentId);
        if (updatedIncident) {
          setViewingIncident(updatedIncident);
          
          // Send notification to assigned user if incident is assigned to someone else
          if (updatedIncident.assignedToUserId && updatedIncident.assignedToUserId !== user.userId) {
            const assignedUser = users.find(u => u.userId === updatedIncident.assignedToUserId);
            if (assignedUser) {
              sendCommentNotification(assignedUser, {
                incidentId: updatedIncident.incidentId,
                title: updatedIncident.title
              }, `${user.firstName} ${user.lastName}`);
            }
          }
        }
      }
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  }, [user, newComment, viewingIncident, users, setIncidents, setViewingIncident, setError, sendCommentNotification]);

  const handleDeleteComment = useCallback(async (incidentId: string, commentId: string) => {
    if (!user) return;

    try {
      await incidentsApi.deleteComment(incidentId, commentId, user.userId, user.role);
      
      // Reload incidents to get updated comments
      const incidentsData = await incidentsApi.getAll();
      const orgIncidents = incidentsData.filter((inc: Incident) => inc.organizationId === user?.organizationId);
      setIncidents(orgIncidents);
      
      // Update viewing incident
      if (viewingIncident && viewingIncident.incidentId === incidentId) {
        const updatedIncident = orgIncidents.find(inc => inc.incidentId === incidentId);
        if (updatedIncident) {
          setViewingIncident(updatedIncident);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  }, [user, viewingIncident, setIncidents, setViewingIncident, setError]);

  const formatCommentTime = useCallback((timestamp: any) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      let date: Date;
      
      // Handle Firestore Timestamp object
      if (typeof timestamp === 'object' && 'toDate' in timestamp) {
        date = timestamp.toDate();
      }
      // Handle serialised Firestore timestamp
      else if (typeof timestamp === 'object' && '_seconds' in timestamp) {
        date = new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
      }
      // Handle regular timestamp formats
      else {
        date = new Date(timestamp);
      }
      
      // Validate the date
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Unknown time';
    }
  }, []);

  return {
    newComment,
    setNewComment,
    submittingComment,
    handleAddComment,
    handleDeleteComment,
    formatCommentTime
  };
}; 
