import { useState, useCallback } from 'react';
import { generateAISummary, type Incident, type User, type ThreatActor } from '../../../api';

interface UseAISummaryProps {
  viewingIncident: Incident | null;
  users: User[];
  threatActors: ThreatActor[];
  setError: (error: string) => void;
}

export const useAISummary = ({
  viewingIncident,
  users,
  threatActors,
  setError
}: UseAISummaryProps) => {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);

  const handleGenerateAISummary = useCallback(async () => {
    if (!viewingIncident) return;

    setGeneratingSummary(true);
    setError('');
    
    try {
      const summary = await generateAISummary(viewingIncident, users, threatActors);
      setAiSummary(summary);
      setShowAiSummary(true);
    } catch (error: any) {
      console.error('Error generating AI summary:', error);
      setError('Error: ' + error.message);
    } finally {
      setGeneratingSummary(false);
    }
  }, [viewingIncident, users, threatActors, setError]);

  const closeAiSummary = useCallback(() => {
    setShowAiSummary(false);
    setAiSummary('');
  }, []);

  return {
    aiSummary,
    generatingSummary,
    showAiSummary,
    setShowAiSummary,
    handleGenerateAISummary,
    closeAiSummary
  };
}; 