import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { threatActorsApi, type ThreatActor, type CreateThreatActorDTO, type UpdateThreatActorDTO } from '../api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Badge } from '../components/ui/badge';

const ThreatActorsPage: React.FC = () => {
  const { user } = useAuth();
  const permissions = usePermissions();
  
  // State management
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    attackPatterns: [] as string[],
    tools: [] as string[],
    malwareFamilies: [] as string[],
    isActive: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [aliasInput, setAliasInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  // Removed unused state variables

  // Load threat actors
  useEffect(() => {
    const loadThreatActors = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        const data = await threatActorsApi.getAll();
        // Filter by organization (show all if no organizationId set for backwards compatibility)
        const orgThreatActors = data.filter((ta: ThreatActor) => 
          !ta.organizationId || ta.organizationId === user?.organizationId
        );
        setThreatActors(orgThreatActors);
      } catch (error) {
        console.error('Error loading threat actors:', error);
        setError('Failed to load threat actors. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadThreatActors();
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
      attackPatterns: [],
      tools: [],
      malwareFamilies: [],
      isActive: true
    });
    setAliasInput('');
    setTargetInput('');
    setError('');
  };

  // Array input helpers
  const addToArray = (value: string, field: keyof typeof formData, setValue: (value: string) => void) => {
    if (!value.trim()) return;
    const currentArray = formData[field] as string[];
    if (!currentArray.includes(value.trim())) {
      setFormData({
        ...formData,
        [field]: [...currentArray, value.trim()]
      });
    }
    setValue('');
  };

  const removeFromArray = (value: string, field: keyof typeof formData) => {
    const currentArray = formData[field] as string[];
    setFormData({
      ...formData,
      [field]: currentArray.filter(item => item !== value)
    });
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
        attackPatterns: formData.attackPatterns,
        tools: formData.tools,
        malwareFamilies: formData.malwareFamilies,
        isActive: formData.isActive,
        organizationId: user.organizationId
      };

      await threatActorsApi.create(newActorData);
      
      // Reload threat actors
      const data = await threatActorsApi.getAll();
      const orgThreatActors = data.filter((ta: ThreatActor) => 
        !ta.organizationId || ta.organizationId === user?.organizationId
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
        attackPatterns: formData.attackPatterns,
        tools: formData.tools,
        malwareFamilies: formData.malwareFamilies,
        isActive: formData.isActive
      };

      await threatActorsApi.update(editingActor.threatActorId, updateData);
      
      // Reload threat actors
      const data = await threatActorsApi.getAll();
      const orgThreatActors = data.filter((ta: ThreatActor) => 
        !ta.organizationId || ta.organizationId === user?.organizationId
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
      attackPatterns: actor.attackPatterns || [],
      tools: actor.tools || [],
      malwareFamilies: actor.malwareFamilies || [],
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
  if (!permissions.canViewIncidents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have permission to view threat actors.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳</div>
          <p className="text-gray-600 dark:text-gray-400">Loading threat actors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Threat Actors
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and analyze threat actors and their activities
          </p>
        </div>
        {permissions.canCreateIncidents && (
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Threat Actor
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search threat actors by name, description, aliases, or country..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full"
          />
        </div>
      </div>

      {/* Threat actors list */}
      {paginatedActors.length > 0 ? (
        <div className="space-y-4">
          {paginatedActors.map((actor) => (
            <Card key={actor.threatActorId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {actor.name}
                      </h3>
                      <Badge className={`text-xs px-2 py-1 ${getSophisticationColor(actor.sophistication || 'Unknown')}`}>
                        {actor.sophistication || 'Unknown'}
                      </Badge>
                      <Badge className={`text-xs px-2 py-1 ${getResourceLevelColor(actor.resourceLevel || 'Unknown')}`}>
                        {actor.resourceLevel || 'Unknown'}
                      </Badge>
                      {!actor.isActive && (
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    {actor.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {actor.description}
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {actor.aliases && actor.aliases.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Aliases:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {actor.aliases.slice(0, 3).map((alias, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {alias}
                              </Badge>
                            ))}
                            {actor.aliases.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{actor.aliases.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {actor.country && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Country:</span>
                          <p className="text-gray-600 dark:text-gray-400">{actor.country}</p>
                        </div>
                      )}

                      {actor.motivation && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Motivation:</span>
                          <p className="text-gray-600 dark:text-gray-400">{actor.motivation}</p>
                        </div>
                      )}

                      {actor.primaryTargets && actor.primaryTargets.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Primary Targets:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {actor.primaryTargets.slice(0, 2).map((target, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {target}
                              </Badge>
                            ))}
                            {actor.primaryTargets.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{actor.primaryTargets.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {actor.tools && actor.tools.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Tools:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {actor.tools.slice(0, 2).map((tool, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                            {actor.tools.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{actor.tools.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        {actor.firstSeen && (
                          <span>First seen: {new Date(actor.firstSeen).toLocaleDateString()}</span>
                        )}
                        {actor.lastSeen && (
                          <span>Last seen: {new Date(actor.lastSeen).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {permissions.canEditIncidents && (
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(actor)}
                      >
                        Edit
                      </Button>
                      {permissions.canDeleteIncidents && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteConfirm(actor)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🕵️</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No threat actors found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? 'No threat actors match your search criteria.' : 'Get started by adding your first threat actor.'}
              </p>
              {permissions.canCreateIncidents && !searchTerm && (
                <Button onClick={openCreateModal}>
                  Add Threat Actor
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredActors.length)}</span> of <span className="font-medium">{filteredActors.length}</span> threat actors
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? "font-bold" : ""}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Threat Actor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="APT28, Lazarus Group, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="Country of origin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description of the threat actor..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sophistication Level
                </label>
                <select
                  value={formData.sophistication}
                  onChange={(e) => setFormData({...formData, sophistication: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resource Level
                </label>
                <select
                  value={formData.resourceLevel}
                  onChange={(e) => setFormData({...formData, resourceLevel: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Individual">Individual</option>
                  <option value="Club">Club</option>
                  <option value="Contest">Contest</option>
                  <option value="Team">Team</option>
                  <option value="Organization">Organization</option>
                  <option value="Government">Government</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Seen
                </label>
                <Input
                  type="date"
                  value={formData.firstSeen}
                  onChange={(e) => setFormData({...formData, firstSeen: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Seen
                </label>
                <Input
                  type="date"
                  value={formData.lastSeen}
                  onChange={(e) => setFormData({...formData, lastSeen: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivation
              </label>
              <Input
                value={formData.motivation}
                onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                placeholder="Financial, Espionage, Hacktivism, etc."
              />
            </div>

            {/* Array inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aliases
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="Add alias..."
                  onKeyPress={(e) => e.key === 'Enter' && addToArray(aliasInput, 'aliases', setAliasInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray(aliasInput, 'aliases', setAliasInput)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.aliases.map((alias, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {alias}
                    <button
                      type="button"
                      onClick={() => removeFromArray(alias, 'aliases')}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Targets
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Add target sector..."
                  onKeyPress={(e) => e.key === 'Enter' && addToArray(targetInput, 'primaryTargets', setTargetInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray(targetInput, 'primaryTargets', setTargetInput)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.primaryTargets.map((target, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {target}
                    <button
                      type="button"
                      onClick={() => removeFromArray(target, 'primaryTargets')}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Currently Active
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateThreatActor}
                disabled={submitting || !formData.name.trim()}
              >
                {submitting ? 'Creating...' : 'Create Threat Actor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Threat Actor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Same form fields as create modal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="APT28, Lazarus Group, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="Country of origin"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Detailed description of the threat actor..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sophistication Level
                </label>
                <select
                  value={formData.sophistication}
                  onChange={(e) => setFormData({...formData, sophistication: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Minimal">Minimal</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resource Level
                </label>
                <select
                  value={formData.resourceLevel}
                  onChange={(e) => setFormData({...formData, resourceLevel: e.target.value as any})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Individual">Individual</option>
                  <option value="Club">Club</option>
                  <option value="Contest">Contest</option>
                  <option value="Team">Team</option>
                  <option value="Organization">Organization</option>
                  <option value="Government">Government</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Seen
                </label>
                <Input
                  type="date"
                  value={formData.firstSeen}
                  onChange={(e) => setFormData({...formData, firstSeen: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Seen
                </label>
                <Input
                  type="date"
                  value={formData.lastSeen}
                  onChange={(e) => setFormData({...formData, lastSeen: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Motivation
              </label>
              <Input
                value={formData.motivation}
                onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                placeholder="Financial, Espionage, Hacktivism, etc."
              />
            </div>

            {/* Array inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aliases
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={aliasInput}
                  onChange={(e) => setAliasInput(e.target.value)}
                  placeholder="Add alias..."
                  onKeyPress={(e) => e.key === 'Enter' && addToArray(aliasInput, 'aliases', setAliasInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray(aliasInput, 'aliases', setAliasInput)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.aliases.map((alias, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {alias}
                    <button
                      type="button"
                      onClick={() => removeFromArray(alias, 'aliases')}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Primary Targets
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Add target sector..."
                  onKeyPress={(e) => e.key === 'Enter' && addToArray(targetInput, 'primaryTargets', setTargetInput)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addToArray(targetInput, 'primaryTargets', setTargetInput)}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {formData.primaryTargets.map((target, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {target}
                    <button
                      type="button"
                      onClick={() => removeFromArray(target, 'primaryTargets')}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActiveEdit"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActiveEdit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Currently Active
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingActor(null);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditThreatActor}
                disabled={submitting || !formData.name.trim()}
              >
                {submitting ? 'Updating...' : 'Update Threat Actor'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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