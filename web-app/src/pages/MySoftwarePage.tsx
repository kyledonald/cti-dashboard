import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { MySoftwareHeader } from '../components/my-software/MySoftwareHeader';
import { SoftwareInventoryCard } from '../components/my-software/SoftwareInventoryCard';
import { RelevantCVEsCard } from '../components/my-software/RelevantCVEsCard';
import { useSoftwareState } from '../components/my-software/hooks/useSoftwareState';
import { useSoftwareActions } from '../components/my-software/hooks/useSoftwareActions';
import { useRelevantCVEs } from '../components/my-software/hooks/useRelevantCVEs';
import { useSoftwareUtils } from '../components/my-software/hooks/useSoftwareUtils';

const MySoftwarePage: React.FC = () => {
  const {
    softwareList,
    setSoftwareList,
    newSoftware,
    setNewSoftware,
    searchTerm,
    setSearchTerm,
    showAddForm,
    setShowAddForm,
    isInventoryCollapsed,
    setIsInventoryCollapsed,
    filteredSoftware,
    user,
  } = useSoftwareState();
  
  const permissions = usePermissions();

  const { addSoftware, removeSoftware } = useSoftwareActions({
    user,
    softwareList,
    newSoftware,
    setSoftwareList,
    setNewSoftware,
    setShowAddForm,
  });

  const { matchingCVEs, loading } = useRelevantCVEs({
    softwareList,
    user,
  });

  const { getSeverityLabel, getSeverityColor } = useSoftwareUtils();

  return (
    <div className="space-y-6">
      <MySoftwareHeader />

      <SoftwareInventoryCard
        softwareList={softwareList}
        filteredSoftware={filteredSoftware}
        searchTerm={searchTerm}
        newSoftware={newSoftware}
        showAddForm={showAddForm}
        isInventoryCollapsed={isInventoryCollapsed}
        canManageSoftwareInventory={permissions.canManageSoftwareInventory}
        onToggleCollapse={() => setIsInventoryCollapsed(!isInventoryCollapsed)}
        onToggleAddForm={() => setShowAddForm(!showAddForm)}
        onNewSoftwareChange={setNewSoftware}
        onAddSoftware={addSoftware}
        onSearchChange={setSearchTerm}
        onRemoveSoftware={removeSoftware}
      />

      <RelevantCVEsCard
        softwareList={softwareList}
        matchingCVEs={matchingCVEs}
        loading={loading}
        getSeverityLabel={getSeverityLabel}
        getSeverityColor={getSeverityColor}
      />
    </div>
  );
};

export default MySoftwarePage; 
