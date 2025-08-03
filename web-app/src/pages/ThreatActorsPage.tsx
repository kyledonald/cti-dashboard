import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { threatActorsApi, organizationsApi, type ThreatActor, type CreateThreatActorDTO, type UpdateThreatActorDTO, type Organization } from '../api';

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
  
  // State management
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Show 6 threat actors per page

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingActor, setEditingActor] = useState<ThreatActor | null>(null);
  const [actorToDelete, setActorToDelete] = useState<ThreatActor | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    aliases: [] as string[],
    country: '',
    firstSeen: '',
    lastSeen: '',
    motivation: '',
    sophistication: 'Unknown' as 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert',
    resourceLevel: 'Unknown' as 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government',
    primaryTargets: [] as string[],
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [aliasInput, setAliasInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  // Removed unused state variables

  // Load threat actors and organization data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Load threat actors and organization data in parallel
        const [threatActorsData, organizationData] = await Promise.all([
          threatActorsApi.getAll(),
          organizationsApi.getById(user.organizationId)
        ]);

        // Filter threat actors by organization
        const orgThreatActors = threatActorsData.filter((ta: ThreatActor) => 
          ta.organizationId === user?.organizationId
        );
        
        setThreatActors(orgThreatActors);
        setOrganization(organizationData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load threat actors. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.organizationId]);

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
      case 'Club': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300';
      case 'Contest': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300';
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
      case 'Club': score += 2; break;
      case 'Contest': score += 2; break;
      case 'Individual': score += 1; break;
      default: score += 1;
    }
    
    // Activity bonus
    if (actor.isActive) score += 2;
    
    // Recent activity bonus (within last year)
    if (actor.lastSeen) {
      const lastSeenDate = new Date(actor.lastSeen);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (lastSeenDate > oneYearAgo) score += 2;
    }
    
    // Industry/Country targeting bonus (case-insensitive)
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

  // Statistics calculations using useMemo to handle dependencies properly
  const statistics = useMemo(() => {
    const total = threatActors.length;
    const active = threatActors.filter(ta => ta.isActive).length;
    

    
    const highRisk = threatActors.filter(ta => calculateRiskScore(ta) >= 6).length;

    return { total, active, highRisk };
  }, [threatActors, organization]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      aliases: [],
      country: '',
      firstSeen: '',
      lastSeen: '',
      motivation: '',
      sophistication: 'Unknown',
      resourceLevel: 'Unknown',
      primaryTargets: [],
      isActive: true
    });
    setAliasInput('');
    setTargetInput('');
    setError('');
  };



  // CRUD operations
  const handleCreateThreatActor = async () => {
    if (!formData.name.trim() || !user?.organizationId) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const newActorData: CreateThreatActorDTO = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        aliases: formData.aliases,
        country: formData.country.trim() || undefined,
        firstSeen: formData.firstSeen || undefined,
        lastSeen: formData.lastSeen || undefined,
        motivation: formData.motivation.trim() || undefined,
        sophistication: formData.sophistication,
        resourceLevel: formData.resourceLevel,
        primaryTargets: formData.primaryTargets,
        isActive: formData.isActive,
        organizationId: user.organizationId
      };

      await threatActorsApi.create(newActorData);
      
      // Reload threat actors
      const data = await threatActorsApi.getAll();
      const orgThreatActors = data.filter((ta: ThreatActor) => 
        ta.organizationId === user?.organizationId
      );
      setThreatActors(orgThreatActors);

      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Error creating threat actor:', error);
      setError('Failed to create threat actor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditThreatActor = async () => {
    if (!editingActor || !formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const updateData: UpdateThreatActorDTO = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        aliases: formData.aliases,
        country: formData.country.trim() || undefined,
        firstSeen: formData.firstSeen || undefined,
        lastSeen: formData.lastSeen || undefined,
        motivation: formData.motivation.trim() || undefined,
        sophistication: formData.sophistication,
        resourceLevel: formData.resourceLevel,
        primaryTargets: formData.primaryTargets,
        isActive: formData.isActive
      };

      await threatActorsApi.update(editingActor.threatActorId, updateData);
      
      // Reload threat actors
      const data = await threatActorsApi.getAll();
      const orgThreatActors = data.filter((ta: ThreatActor) => 
        ta.organizationId === user?.organizationId
      );
      setThreatActors(orgThreatActors);

      setShowEditModal(false);
      setEditingActor(null);
      resetForm();
    } catch (error) {
      console.error('Error updating threat actor:', error);
      setError('Failed to update threat actor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThreatActor = async () => {
    if (!actorToDelete) return;

    try {
      await threatActorsApi.delete(actorToDelete.threatActorId);
      
      // Remove from local state
      setThreatActors(threatActors.filter(ta => ta.threatActorId !== actorToDelete.threatActorId));
      
      setShowDeleteConfirm(false);
      setActorToDelete(null);
    } catch (error) {
      console.error('Error deleting threat actor:', error);
      setError('Failed to delete threat actor');
    }
  };

  // Modal handlers
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (actor: ThreatActor) => {
    setEditingActor(actor);
    setFormData({
      name: actor.name,
      description: actor.description || '',
      aliases: actor.aliases || [],
      country: actor.country || '',
      firstSeen: actor.firstSeen || '',
      lastSeen: actor.lastSeen || '',
      motivation: actor.motivation || '',
      sophistication: actor.sophistication || 'Unknown',
      resourceLevel: actor.resourceLevel || 'Unknown',
      primaryTargets: actor.primaryTargets || [],
      isActive: actor.isActive !== false
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (actor: ThreatActor) => {
    setActorToDelete(actor);
    setShowDeleteConfirm(true);
  };

  // Filter and paginate
  const filteredActors = threatActors.filter(actor =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (actor.description && actor.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (actor.aliases && actor.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (actor.country && actor.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredActors.length / itemsPerPage);
  const paginatedActors = filteredActors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Permission check
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
        onAddThreatActor={openCreateModal}
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
                onEdit={openEditModal}
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
          onAddThreatActor={openCreateModal}
        />
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Create Modal */}
      <ThreatActorForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        mode="create"
        formData={formData}
        onFormDataChange={setFormData}
        aliasInput={aliasInput}
        onAliasInputChange={setAliasInput}
        targetInput={targetInput}
        onTargetInputChange={setTargetInput}
        onSubmit={handleCreateThreatActor}
        onCancel={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        submitting={submitting}
        error={error}

      />

      {/* Edit Modal */}
      <ThreatActorForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        mode="edit"
        formData={formData}
        onFormDataChange={setFormData}
        aliasInput={aliasInput}
        onAliasInputChange={setAliasInput}
        targetInput={targetInput}
        onTargetInputChange={setTargetInput}
        onSubmit={handleEditThreatActor}
        onCancel={() => {
          setShowEditModal(false);
          setEditingActor(null);
          resetForm();
        }}
        submitting={submitting}
        error={error}

      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open);
          if (!open) {
            setActorToDelete(null);
          }
        }}
        title="Delete Threat Actor"
        message={`Are you sure you want to delete "${actorToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        icon="delete"
        onConfirm={handleDeleteThreatActor}
      />
    </div>
  );
};

export default ThreatActorsPage; 