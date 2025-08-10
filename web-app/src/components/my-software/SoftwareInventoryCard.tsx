import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AddSoftwareForm } from './AddSoftwareForm';
import { SoftwareSearchBar } from './SoftwareSearchBar';
import { SoftwareList } from './SoftwareList';

interface SoftwareInventoryCardProps {
  softwareList: string[];
  filteredSoftware: string[];
  searchTerm: string;
  newSoftware: string;
  showAddForm: boolean;
  isInventoryCollapsed: boolean;
  canManageSoftwareInventory: boolean;
  onToggleCollapse: () => void;
  onToggleAddForm: () => void;
  onNewSoftwareChange: (value: string) => void;
  onAddSoftware: () => void;
  onSearchChange: (value: string) => void;
  onRemoveSoftware: (software: string) => void;
}

export const SoftwareInventoryCard: React.FC<SoftwareInventoryCardProps> = ({
  softwareList,
  filteredSoftware,
  searchTerm,
  newSoftware,
  showAddForm,
  isInventoryCollapsed,
  canManageSoftwareInventory,
  onToggleCollapse,
  onToggleAddForm,
  onNewSoftwareChange,
  onAddSoftware,
  onSearchChange,
  onRemoveSoftware,
}) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${isInventoryCollapsed ? '-rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Software Inventory ({softwareList.length})
          </h3>
        </div>
        {canManageSoftwareInventory && (
          <Button onClick={onToggleAddForm}>
            {showAddForm ? 'Cancel' : (softwareList.length > 0 ? 'Add' : '+ Add Software')}
          </Button>
        )}
      </div>

      {!isInventoryCollapsed && (
        <>
          <AddSoftwareForm
            showAddForm={showAddForm}
            newSoftware={newSoftware}
            onNewSoftwareChange={onNewSoftwareChange}
            onAddSoftware={onAddSoftware}
            canManageSoftwareInventory={canManageSoftwareInventory}
          />

          <SoftwareSearchBar
            softwareListLength={softwareList.length}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
          />

          <SoftwareList
            filteredSoftware={filteredSoftware}
            softwareList={softwareList}
            searchTerm={searchTerm}
            canManageSoftwareInventory={canManageSoftwareInventory}
            onRemoveSoftware={onRemoveSoftware}
          />
        </>
      )}
    </Card>
  );
}; 
