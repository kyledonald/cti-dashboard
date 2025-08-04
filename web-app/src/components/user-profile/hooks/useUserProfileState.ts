import { useState, useRef, useEffect } from 'react';

export const useUserProfileState = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [leavingOrg, setLeavingOrg] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    isOpen,
    setIsOpen,
    leavingOrg,
    setLeavingOrg,
    showLeaveConfirm,
    setShowLeaveConfirm,
    dropdownRef,
  };
}; 