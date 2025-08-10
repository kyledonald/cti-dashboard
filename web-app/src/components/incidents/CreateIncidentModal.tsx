import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { type User, type ThreatActor } from '../../api';

interface CreateIncidentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    title: string;
    description: string;
    priority: string;
    assignedToUserId: string;
    type: string;
    cveIds: string[];
    threatActorIds: string[];
  };
  setFormData: (data: any) => void;
  cveInput: string;
  setCveInput: (input: string) => void;
  cveError: string;
  setCveError: (error: string) => void;
  users: User[];
  threatActors: ThreatActor[];
  error: string | null;
  submitting: boolean;
  onAssignToMe: () => void;
  onCreate: () => void;
  onCancel: () => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  open,
  onOpenChange,
  formData,
  setFormData,
  cveInput,
  setCveInput,
  cveError,
  setCveError,
  users,
  threatActors,
  error,
  submitting,
  onAssignToMe,
  onCreate,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl">Create New Incident</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Brief description of the incident"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Detailed description of the security incident"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Assign To
            </label>
            <div className="flex gap-2">
              <select
                value={formData.assignedToUserId}
                onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value})}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {users.filter(user => user.role !== 'viewer').map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName} ({user.role})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="outline"
                onClick={onAssignToMe}
                className="h-10 px-3 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:border-blue-600"
                title="Assign to me"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Incident Type
            </label>
            <Input
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              placeholder="e.g., Data Breach, Malware, Phishing, etc."
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related CVEs
            </label>
            <Input
              value={cveInput}
              onChange={(e) => {
                setCveInput(e.target.value);
                setCveError(''); 
              }}
              onBlur={() => {
                setCveError('');
                const cveInputs = cveInput.split(',').map(cve => cve.trim()).filter(cve => cve.length > 0);
                const validCves: string[] = [];
                const invalidCves: string[] = [];
                
                cveInputs.forEach(cve => {
                  // Validate CVE format: CVE-YYYY-NNNN or CVE-YYYY-NNNNN
                  const normalizedCve = cve.replace(/\s+/g, '');
                  const cvePattern = /^CVE-\d{4}-\d{4,5}$/i;
                  if (cvePattern.test(normalizedCve)) {
                    validCves.push(normalizedCve.toUpperCase());
                  } else {
                    invalidCves.push(cve);
                  }
                });
                
                if (invalidCves.length > 0) {
                  setCveError(`Invalid CVE format: ${invalidCves.join(', ')}. Please use format CVE-YYYY-NNNN or CVE-YYYY-NNNNN`);
                }
                
                setFormData({...formData, cveIds: validCves});
              }}
              placeholder="CVE-2024-1234, CVE-2024-56789"
              className="w-full"
            />
            {cveError && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                {cveError}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter CVE IDs separated by commas (format: CVE-YYYY-NNNN or CVE-YYYY-NNNNN)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Related Threat Actors
            </label>
            <div className="max-h-32 overflow-y-auto border border-input rounded-md p-3 bg-background">
              {threatActors.length > 0 ? (
                <div className="space-y-2">
                  {threatActors.map((actor) => (
                    <label key={actor.threatActorId} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.threatActorIds.includes(actor.threatActorId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              threatActorIds: [...formData.threatActorIds, actor.threatActorId]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              threatActorIds: formData.threatActorIds.filter(id => id !== actor.threatActorId)
                            });
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{actor.name}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No threat actors available</p>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select threat actors associated with this incident
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={onCreate}
              disabled={submitting || !formData.title.trim() || !formData.description.trim() || !!cveError}
            >
              {submitting ? 'Creating...' : 'Create Incident'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
