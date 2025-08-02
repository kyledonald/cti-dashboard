import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { type Incident, type User, type ThreatActor } from '../../api';

interface ViewIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: Incident | null;
  user: User | null;
  threatActors: ThreatActor[];
  permissions: {
    canEditIncidents: boolean;
    canDeleteIncidents: boolean;
  };
  newComment: string;
  setNewComment: (comment: string) => void;
  submittingComment: boolean;
  generatingSummary: boolean;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
  formatCommentTime: (timestamp: any) => string;
  onAddComment: (incidentId: string) => void;
  onDeleteComment: (incidentId: string, commentId: string) => void;
  onEdit: (incident: Incident) => void;
  onDelete: (incident: Incident) => void;
  onGenerateAISummary: () => void;
  onClose: () => void;
}

export const ViewIncidentModal: React.FC<ViewIncidentModalProps> = ({
  open,
  onOpenChange,
  incident,
  user,
  threatActors,
  permissions,
  newComment,
  setNewComment,
  submittingComment,
  generatingSummary,
  getPriorityColor,
  getStatusColor,
  formatCommentTime,
  onAddComment,
  onDeleteComment,
  onEdit,
  onDelete,
  onGenerateAISummary,
  onClose
}) => {
  if (!incident) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Incident Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Incident ID and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Incident ID
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                {incident.incidentId}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <Badge className={`${getStatusColor(incident.status)} border-2`}>
                {incident.status}
              </Badge>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              {incident.title}
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded whitespace-pre-wrap">
              {incident.description}
            </p>
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <Badge className={`${getPriorityColor(incident.priority)}`}>
                {incident.priority}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <p className="text-sm text-gray-900 dark:text-gray-100">
                {incident.type || 'Not specified'}
              </p>
            </div>
          </div>

          {/* Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assigned To
            </label>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {incident.assignedToUserName ? (
                <span className="text-gray-600 dark:text-gray-400">
                  {incident.assignedToUserName}
                </span>
              ) : (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  Unassigned
                </span>
              )}
            </p>
          </div>

          {/* CVEs */}
          {incident.cveIds && incident.cveIds.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related CVEs
              </label>
              <div className="flex flex-wrap gap-2">
                {incident.cveIds.map((cveId) => (
                  <Badge key={cveId} variant="outline" className="text-xs">
                    {cveId}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Threat Actors */}
          {incident.threatActorIds && incident.threatActorIds.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Related Threat Actors
              </label>
              <div className="flex flex-wrap gap-2">
                {incident.threatActorIds.map((actorId) => {
                  const actor = threatActors.find(ta => ta.threatActorId === actorId);
                  return (
                    <Badge key={actorId} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800">
                      {actor?.name || actorId}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collaborative Comments Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-lg font-medium text-gray-900 dark:text-gray-100">
                Resolution Comments
              </label>
              <Badge variant="outline" className="text-xs">
                {incident.resolutionComments?.length || 0} 
                {' '}Comment{(incident.resolutionComments?.length || 0) !== 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Comments list */}
            <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
              {incident.resolutionComments && incident.resolutionComments.length > 0 ? (
                incident.resolutionComments.map((comment, index) => (
                  <div key={comment.commentId || index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          {comment.userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {comment.userName || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              • {formatCommentTime(comment.timestamp)}
                            </span>
                          </div>
                          {/* Delete button - show if user owns comment or user is admin */}
                          {comment.commentId && ((user && comment.userId === user.userId) || (user && user.role === 'admin')) && (
                            <button
                              onClick={() => onDeleteComment(incident.incidentId, comment.commentId)}
                              className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 p-1 rounded transition-colors"
                              title="Delete comment"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">No comments yet. Be the first to add insights about this incident.</p>
                </div>
              )}
            </div>

            {/* Add comment form */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add your analysis, findings, or resolution steps..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      onClick={() => onAddComment(incident.incidentId)}
                      disabled={submittingComment || !newComment.trim()}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {submittingComment ? 'Adding...' : 'Add Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            {permissions.canEditIncidents && (
              <Button
                onClick={() => onEdit(incident)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit Incident
              </Button>
            )}
            {permissions.canEditIncidents && (
              <Button
                onClick={onGenerateAISummary}
                disabled={generatingSummary}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {generatingSummary ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Summary
                  </>
                )}
              </Button>
            )}
            {permissions.canDeleteIncidents && (
              <Button
                variant="destructive"
                onClick={() => onDelete(incident)}
              >
                Delete Incident
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 