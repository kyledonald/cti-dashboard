import { useState } from 'react';
import { type ThreatActor } from '../../../api';

interface ThreatActorFormData {
  name: string;
  description: string;
  aliases: string[];
  country: string;
  firstSeen: string;
  lastSeen: string;
  motivation: string;
  sophistication: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel: 'Unknown' | 'Individual' | 'Team' | 'Organization' | 'Government';
  primaryTargets: string[];
  isActive: boolean;
}

const initialFormData: ThreatActorFormData = {
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
};

export const useThreatActorForm = () => {
  const [formData, setFormData] = useState<ThreatActorFormData>(initialFormData);
  const [aliasInput, setAliasInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData(initialFormData);
    setAliasInput('');
    setTargetInput('');
    setError('');
  };

  const populateFormForEdit = (actor: ThreatActor) => {
    setFormData({
      name: actor.name || '',
      description: actor.description || '',
      aliases: actor.aliases || [],
      country: actor.country || '',
      firstSeen: actor.firstSeen || '',
      lastSeen: actor.lastSeen || '',
      motivation: actor.motivation || '',
      sophistication: actor.sophistication || 'Unknown',
      resourceLevel: actor.resourceLevel || 'Unknown',
      primaryTargets: actor.primaryTargets || [],
      isActive: actor.isActive ?? true
    });
    setAliasInput('');
    setTargetInput('');
    setError('');
  };

  const validateForm = (): boolean => {
    // Handle null/undefined input
    if (!formData.name || typeof formData.name !== 'string') {
      setError('Name is required');
      return false;
    }
    
    // Check for empty or whitespace-only name
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    // Check maximum length
    if (formData.name.length > 100) {
      setError('Name must be no more than 100 characters long');
      return false;
    }
    
    setError('');
    return true;
  };

  return {
    formData,
    setFormData,
    aliasInput,
    setAliasInput,
    targetInput,
    setTargetInput,
    error,
    setError,
    resetForm,
    populateFormForEdit,
    validateForm
  };
}; 
