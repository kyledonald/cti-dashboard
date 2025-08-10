interface UseSoftwareActionsProps {
  user: any;
  softwareList: string[];
  newSoftware: string;
  setSoftwareList: (software: string[]) => void;
  setNewSoftware: (value: string) => void;
  setShowAddForm: (value: boolean) => void;
}

export const useSoftwareActions = ({
  user,
  softwareList,
  newSoftware,
  setSoftwareList,
  setNewSoftware,
  setShowAddForm,
}: UseSoftwareActionsProps) => {
  // Save software to localStorage (org-specific)
  const saveSoftware = (software: string[]) => {
    if (!user?.organizationId) return;
    
    setSoftwareList(software);
    localStorage.setItem(`organization-software-${user.organizationId}`, JSON.stringify(software));
  };

  // Add new software
  const addSoftware = () => {
    if (!newSoftware.trim() || !user?.organizationId) return;
    
    const items = newSoftware.split(',').map(item => item.trim()).filter(item => item.length > 0);
    const uniqueItems = [...new Set([...softwareList, ...items])];
    
    saveSoftware(uniqueItems);
    setNewSoftware('');
    setShowAddForm(false);
  };

  // Remove software from list
  const removeSoftware = (software: string) => {
    if (!user?.organizationId) return;
    
    saveSoftware(softwareList.filter(item => item !== software));
  };

  return {
    saveSoftware,
    addSoftware,
    removeSoftware,
  };
}; 
