import React from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

interface ThreatActorSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const ThreatActorSearch: React.FC<ThreatActorSearchProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search threat actors..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}; 