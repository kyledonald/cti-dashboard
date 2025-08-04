export const useSoftwareUtils = () => {
  const getSeverityLabel = (score: number): string => {
    if (score >= 9.0) return 'Critical';
    if (score >= 7.0) return 'High';
    if (score >= 4.0) return 'Medium';
    return 'Low';
  };

  const getSeverityColor = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
    if (score >= 9.0) return 'critical';
    if (score >= 7.0) return 'high';
    if (score >= 4.0) return 'medium';
    return 'low';
  };

  return {
    getSeverityLabel,
    getSeverityColor,
  };
}; 