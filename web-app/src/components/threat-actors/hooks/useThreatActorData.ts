import { useState, useEffect } from 'react';
import { threatActorsApi, organizationsApi, type ThreatActor, type Organization } from '../../../api';

export const useThreatActorData = (user: any) => {
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load threat actors and org data
  useEffect(() => {
    const loadData = async () => {
      if (!user?.organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Load threat actors and org data in parallel
        const [threatActorsData, organizationData] = await Promise.all([
          threatActorsApi.getAll(),
          organizationsApi.getById(user.organizationId)
        ]);

        // Filter threat actors by org
        const orgThreatActors = threatActorsData.filter((ta: ThreatActor) => 
          ta.organizationId === user?.organizationId
        );
        
        setThreatActors(orgThreatActors);
        setOrganization(organizationData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.organizationId]);

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

  // Statistics calc
  const statistics = {
    total: threatActors.length,
    active: threatActors.filter(actor => actor.isActive).length,
    highRisk: threatActors.filter(actor => {
      // Simple risk calc based on sophistication
      const riskScore = actor.sophistication === 'Expert' ? 5 :
                       actor.sophistication === 'Advanced' ? 4 :
                       actor.sophistication === 'Intermediate' ? 3 :
                       actor.sophistication === 'Minimal' ? 2 : 1;
      return riskScore >= 4;
    }).length
  };

  return {
    threatActors,
    organization,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    filteredActors,
    paginatedActors,
    totalPages,
    statistics,
    setThreatActors
  };
}; 
