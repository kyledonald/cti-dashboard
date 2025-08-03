import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';


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

interface ThreatActorFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  formData: ThreatActorFormData;
  onFormDataChange: (data: ThreatActorFormData) => void;
  aliasInput: string;
  onAliasInputChange: (value: string) => void;
  targetInput: string;
  onTargetInputChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  error: string;

}

export const ThreatActorForm: React.FC<ThreatActorFormProps> = ({
  isOpen,
  onClose,
  mode,
  formData,
  onFormDataChange,
  aliasInput,
  onAliasInputChange,
  targetInput,
  onTargetInputChange,
  onSubmit,
  onCancel,
  submitting,
  error,

}) => {
  const addToArray = (value: string, field: keyof ThreatActorFormData) => {
    if (!value.trim()) return;
    const currentArray = formData[field] as string[];
    if (!currentArray.includes(value.trim())) {
      onFormDataChange({
        ...formData,
        [field]: [...currentArray, value.trim()]
      });
    }
    if (field === 'aliases') {
      onAliasInputChange('');
    } else if (field === 'primaryTargets') {
      onTargetInputChange('');
    }
  };

  const removeFromArray = (value: string, field: keyof ThreatActorFormData) => {
    const currentArray = formData[field] as string[];
    onFormDataChange({
      ...formData,
      [field]: currentArray.filter(item => item !== value)
    });
  };

  const handleInputChange = (field: keyof ThreatActorFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Threat Actor' : 'Edit Threat Actor'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="APT28, Lazarus Group, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <Input
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
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
              onChange={(e) => handleInputChange('description', e.target.value)}
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
                onChange={(e) => handleInputChange('sophistication', e.target.value)}
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
                onChange={(e) => handleInputChange('resourceLevel', e.target.value)}
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
                onChange={(e) => handleInputChange('firstSeen', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Seen
              </label>
              <Input
                type="date"
                value={formData.lastSeen}
                onChange={(e) => handleInputChange('lastSeen', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivation
            </label>
            <Input
              value={formData.motivation}
              onChange={(e) => handleInputChange('motivation', e.target.value)}
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
                onChange={(e) => onAliasInputChange(e.target.value)}
                placeholder="Add alias..."
                onKeyPress={(e) => e.key === 'Enter' && addToArray(aliasInput, 'aliases')}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray(aliasInput, 'aliases')}
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
                onChange={(e) => onTargetInputChange(e.target.value)}
                placeholder="Add target sector..."
                onKeyPress={(e) => e.key === 'Enter' && addToArray(targetInput, 'primaryTargets')}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addToArray(targetInput, 'primaryTargets')}
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
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
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
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? (mode === 'create' ? 'Creating...' : 'Updating...') : (mode === 'create' ? 'Create Threat Actor' : 'Update Threat Actor')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 