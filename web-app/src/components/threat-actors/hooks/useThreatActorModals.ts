import { useState } from 'react';
import { type ThreatActor } from '../../../api';

export const useThreatActorModals = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingActor, setEditingActor] = useState<ThreatActor | null>(null);
  const [actorToDelete, setActorToDelete] = useState<ThreatActor | null>(null);

  const openCreateModal = (resetForm?: () => void) => {
    if (resetForm) {
      resetForm();
    }
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const openEditModal = (actor: ThreatActor, populateFormForEdit?: (actor: ThreatActor) => void) => {
    setEditingActor(actor);
    if (populateFormForEdit) {
      populateFormForEdit(actor);
    }
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingActor(null);
  };

  const openDeleteConfirm = (actor: ThreatActor) => {
    setActorToDelete(actor);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setActorToDelete(null);
  };

  return {
    // Modal states
    showCreateModal,
    showEditModal,
    showDeleteConfirm,
    editingActor,
    actorToDelete,
    
    // Modal actions
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteConfirm,
    closeDeleteConfirm
  };
}; 