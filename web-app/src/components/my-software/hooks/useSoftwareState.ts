import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

export const useSoftwareState = () => {
  const { user } = useAuth();
  const [softwareList, setSoftwareList] = useState<string[]>([]);
  const [newSoftware, setNewSoftware] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isInventoryCollapsed, setIsInventoryCollapsed] = useState(false);

  // Load software from localStorage (organization-specific)
  useEffect(() => {
    if (!user?.organizationId) return;
    
    const saved = localStorage.getItem(`organization-software-${user.organizationId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle both old format (array of objects) and new format (array of strings)
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            setSoftwareList(parsed);
          } else {
            // Convert old format to new format
            setSoftwareList(parsed.map(item => `${item.vendor} ${item.name}`.trim()));
          }
        }
      } catch (error) {
        console.error('Error loading software:', error);
      }
    }
  }, [user?.organizationId]);

  // Filter software based on search term
  const filteredSoftware = softwareList.filter(software =>
    software.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    // State
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
    
    // Computed values
    filteredSoftware,
    
    // User context
    user,
  };
}; 