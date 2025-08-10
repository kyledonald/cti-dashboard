import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { type ThreatActor } from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ThreatActorPageHeader } from '../components/threat-actors/ThreatActorPageHeader';
import { ThreatActorStatistics } from '../components/threat-actors/ThreatActorStatistics';
import { ThreatActorSearch } from '../components/threat-actors/ThreatActorSearch';
import { ThreatActorCard } from '../components/threat-actors/ThreatActorCard';
import { ThreatActorEmptyState } from '../components/threat-actors/ThreatActorEmptyState';
import { ThreatActorPagination } from '../components/threat-actors/ThreatActorPagination';
import { ThreatActorLoadingState } from '../components/threat-actors/ThreatActorLoadingState';
import { ThreatActorAccessDeniedState } from '../components/threat-actors/ThreatActorAccessDeniedState';
import { ThreatActorForm } from '../components/threat-actors/ThreatActorForm';
import { useThreatActorForm } from '../components/threat-actors/hooks/useThreatActorForm';
import { useThreatActorModals } from '../components/threat-actors/hooks/useThreatActorModals';
import { useThreatActorActions } from '../components/threat-actors/hooks/useThreatActorActions';
import { useThreatActorData } from '../components/threat-actors/hooks/useThreatActorData';

// Country flag mapping
const getCountryFlag = (country: string): string => {
  const countryFlags: { [key: string]: string } = {
    'China': '🇨🇳', 'Russia': '🇷🇺', 'North Korea': '🇰🇵', 'Iran': '🇮🇷',
    'United States': '🇺🇸', 'Israel': '🇮🇱', 'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪', 'France': '🇫🇷', 'South Korea': '🇰🇷',
    'Japan': '🇯🇵', 'India': '🇮🇳', 'Brazil': '🇧🇷', 'Turkey': '🇹🇷',
    'Ukraine': '🇺🇦', 'Belarus': '🇧🇾', 'Syria': '🇸🇾', 'Vietnam': '🇻🇳',
    'Pakistan': '🇵🇰', 'Bangladesh': '🇧🇩', 'Unknown': '🏴‍☠️'
  };
  return countryFlags[country] || '🌍';
};

const ThreatActorsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  
  // Data management
  const {
    threatActors,
    organization,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredActors,
    paginatedActors,
    totalPages,
    statistics,
    setThreatActors
  } = useThreatActorData(user);

  // Modal states
  const {
    showCreateModal,
    showEditModal,
    showDeleteConfirm,
    editingActor,
    actorToDelete,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteConfirm,
    closeDeleteConfirm
  } = useThreatActorModals();

  // Form state
  const {
    formData,
    setFormData,
    aliasInput,
    setAliasInput,
    targetInput,
    setTargetInput,
    error: formError,
    setError: setFormError,
    resetForm,
    populateFormForEdit,
  } = useThreatActorForm();

  // CRUD operations
  const {
    submitting,
    handleCreateThreatActor,
    handleEditThreatActor,
    handleDeleteThreatActor
  } = useThreatActorActions(
    user,
    setThreatActors,
    setFormError,
    resetForm,
    closeCreateModal,
    closeEditModal,
    closeDeleteConfirm
  );

  // Helper functions
  const getSophisticationColor = (sophistication: string) => {
    switch (sophistication) {
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Advanced': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'Minimal': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getResourceLevelColor = (resourceLevel: string) => {
    switch (resourceLevel) {
      case 'Government': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Organization': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Team': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
      case 'Individual': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Risk assessment functions
  const calculateRiskScore = (actor: ThreatActor): number => {
    let score = 0;
    
    // Sophistication scoring
    switch (actor.sophistication) {
      case 'Expert': score += 5; break;
      case 'Advanced': score += 4; break;
      case 'Intermediate': score += 3; break;
      case 'Minimal': score += 2; break;
      default: score += 1;
    }
    
    // Resource level scoring
    switch (actor.resourceLevel) {
      case 'Government': score += 5; break;
      case 'Organization': score += 4; break;
      case 'Team': score += 3; break;
      case 'Individual': score += 1; break;
      default: score += 1;
    }
    
    // Activity bonus
    if (actor.isActive) score += 2;
    
    if (actor.lastSeen) {
      const lastSeenDate = new Date(actor.lastSeen);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (lastSeenDate > oneYearAgo) score += 2;
    }
    
    if (organization && actor.primaryTargets?.length) {
      const orgIndustry = organization.industry?.toLowerCase();
      const orgCountry = organization.nationality?.toLowerCase();
      const actorTargets = actor.primaryTargets.map(target => target.toLowerCase());
      
      if (orgIndustry && actorTargets.includes(orgIndustry)) {
        score += 3;
      }
      if (orgCountry && actorTargets.includes(orgCountry)) {
        score += 2;
      }
    }
    
    return Math.min(score, 10); // Cap at 10
  };

  const getRiskColor = (score: number): string => {
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 6) return 'text-orange-600 dark:text-orange-400';
    if (score >= 4) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 8) return 'Critical';
    if (score >= 6) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  if (!permissions.canViewThreatActors) {
    return <ThreatActorAccessDeniedState />;
  }

  if (loading) {
    return <ThreatActorLoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <ThreatActorPageHeader
        permissions={permissions}
        onAddThreatActor={() => openCreateModal(resetForm)}
      />

      {/* Statistics Dashboard */}
      <ThreatActorStatistics statistics={statistics} />

      {/* Search and Filters */}
      <ThreatActorSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Threat Actor Cards Grid */}
      {filteredActors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedActors.map((actor) => (
              <ThreatActorCard
                key={actor.threatActorId}
                actor={actor}
                permissions={permissions}
                getSophisticationColor={getSophisticationColor}
                getResourceLevelColor={getResourceLevelColor}
                getRiskColor={getRiskColor}
                getRiskLevel={getRiskLevel}
                calculateRiskScore={calculateRiskScore}
                getCountryFlag={getCountryFlag}
                onEdit={(actor) => openEditModal(actor, populateFormForEdit)}
                onDelete={openDeleteConfirm}
              />
            ))}
          </div>

          {/* Pagination */}
          <ThreatActorPagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredActors.length}
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <ThreatActorEmptyState
          searchTerm={searchTerm}
          permissions={permissions}
          onAddThreatActor={() => openCreateModal(resetForm)}
        />
      )}

      {formError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{formError}</p>
        </div>
      )}

      {/* Create Modal */}
      <ThreatActorForm
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        mode="create"
        formData={formData}
        onFormDataChange={setFormData}
        aliasInput={aliasInput}
        onAliasInputChange={setAliasInput}
        targetInput={targetInput}
        onTargetInputChange={setTargetInput}
        onSubmit={() => handleCreateThreatActor(formData)}
        onCancel={() => {
          closeCreateModal();
          resetForm();
        }}
        submitting={submitting}
        error={formError}
      />

      {/* Edit Modal */}
      <ThreatActorForm
        isOpen={showEditModal}
        onClose={closeEditModal}
        mode="edit"
        formData={formData}
        onFormDataChange={setFormData}
        aliasInput={aliasInput}
        onAliasInputChange={setAliasInput}
        targetInput={targetInput}
        onTargetInputChange={setTargetInput}
        onSubmit={() => handleEditThreatActor(formData, editingActor)}
        onCancel={() => {
          closeEditModal();
          resetForm();
        }}
        submitting={submitting}
        error={formError}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteConfirm();
          }
        }}
        title="Delete Threat Actor"
        message={`Are you sure you want to delete "${actorToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        icon="delete"
        onConfirm={() => handleDeleteThreatActor(actorToDelete, threatActors)}
      />
    </div>
  );
};

export default ThreatActorsPage; 
