import React from 'react';
import { Button } from '../ui/button';

interface AddSoftwareFormProps {
  showAddForm: boolean;
  newSoftware: string;
  onNewSoftwareChange: (value: string) => void;
  onAddSoftware: () => void;
  canManageSoftwareInventory: boolean;
}

export const AddSoftwareForm: React.FC<AddSoftwareFormProps> = ({
  showAddForm,
  newSoftware,
  onNewSoftwareChange,
  onAddSoftware,
  canManageSoftwareInventory,
}) => {
  if (!showAddForm || !canManageSoftwareInventory) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Add Software (comma-separated)
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={newSoftware}
          onChange={(e) => onNewSoftwareChange(e.target.value)}
          placeholder="e.g., Microsoft Office, Adobe Photoshop, Google Chrome, WordPress"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <Button onClick={onAddSoftware} disabled={!newSoftware.trim()}>
          Add
        </Button>
      </div>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Examples: "Microsoft Windows", "Apache Tomcat", "WordPress", "Cisco IOS"
      </p>
    </div>
  );
}; 