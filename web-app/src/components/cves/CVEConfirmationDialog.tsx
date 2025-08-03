import React from 'react';
import { type Incident } from '../../api';

interface CVEConfirmationDialogProps {
  showCloseIncidentConfirm: boolean;
  incidentToClose: Incident | null;
  cveToClose: string;
  closingIncident: boolean;
  onCloseIncidentConfirm: () => void;
  onDismissWithoutClosing: () => void;
}

export const CVEConfirmationDialog: React.FC<CVEConfirmationDialogProps> = ({
  showCloseIncidentConfirm,
  incidentToClose,
  cveToClose,
  closingIncident,
  onCloseIncidentConfirm,
  onDismissWithoutClosing
}) => {
  if (!showCloseIncidentConfirm || !incidentToClose) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Close Associated Incident?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This CVE (<strong>{cveToClose}</strong>) has an existing incident:
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="font-medium text-blue-900 dark:text-blue-100">
            {incidentToClose.title}
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Status: {incidentToClose.status} | Priority: {incidentToClose.priority}
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Would you like to move this incident to the "Closed" column since you're marking the CVE as No Action Required?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCloseIncidentConfirm}
            disabled={closingIncident}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {closingIncident ? 'Closing...' : 'Yes, Close Incident'}
          </button>
          <button
            onClick={onDismissWithoutClosing}
            disabled={closingIncident}
            className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors dark:bg-gray-700 dark:hover:bg-gray-600 dark:disabled:bg-gray-800 dark:text-gray-200"
          >
            No, Keep Incident Open
          </button>
        </div>
      </div>
    </div>
  );
}; 