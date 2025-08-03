import { useState } from 'react';
import { threatActorsApi, type ThreatActor, type CreateThreatActorDTO, type UpdateThreatActorDTO } from '../../../api';

interface ThreatActorFormData {
  name: string;
  description: string;
  aliases: string[];
  country: string;
  firstSeen: string;
  lastSeen: string;
  motivation: string;
  sophistication: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel: 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government';
  primaryTargets: string[];
  isActive: boolean;
}

export const useThreatActorActions = (
  user: any,
  setThreatActors: (actors: ThreatActor[]) => void,
  setError: (error: string) => void,
  resetForm: () => void,
  closeCreateModal: () => void,
  closeEditModal: () => void,
  closeDeleteConfirm: () => void
) => {
  const [submitting, setSubmitting] = useState(false);

  const handleCreateThreatActor = async (formData: ThreatActorFormData) => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const createData: CreateThreatActorDTO = {
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
        organizationId: user?.organizationId
      };

      await threatActorsApi.create(createData);
      
      // Reload threat actors
      const data = await threatActorsApi.getAll();
      const orgThreatActors = data.filter((ta: ThreatActor) => 
        ta.organizationId === user?.organizationId
      );
      setThreatActors(orgThreatActors);

      closeCreateModal();
      resetForm();
    } catch (error) {
      console.error('Error creating threat actor:', error);
      setError('Failed to create threat actor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditThreatActor = async (formData: ThreatActorFormData, editingActor: ThreatActor | null) => {
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

      closeEditModal();
      resetForm();
    } catch (error) {
      console.error('Error updating threat actor:', error);
      setError('Failed to update threat actor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteThreatActor = async (actorToDelete: ThreatActor | null, threatActors: ThreatActor[]) => {
    if (!actorToDelete) return;

    try {
      await threatActorsApi.delete(actorToDelete.threatActorId);
      
      // Remove from local state
      setThreatActors(threatActors.filter(ta => ta.threatActorId !== actorToDelete.threatActorId));
      
      closeDeleteConfirm();
    } catch (error) {
      console.error('Error deleting threat actor:', error);
      setError('Failed to delete threat actor');
    }
  };

  return {
    submitting,
    handleCreateThreatActor,
    handleEditThreatActor,
    handleDeleteThreatActor
  };
}; 