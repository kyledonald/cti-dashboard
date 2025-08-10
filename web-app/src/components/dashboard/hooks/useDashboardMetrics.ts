import { useMemo } from 'react';
import type { Incident } from '../../../api';

export const useDashboardMetrics = (orgIncidents: Incident[]) => {
  // Incident status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { Open: 0, Triaged: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
    orgIncidents.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
    return counts;
  }, [orgIncidents]);

  // Incident trend (last 6 months)
  const incidentTrend = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`);
    }
    const counts = months.map(label => {
      const [month, year] = label.split(' ');
      return orgIncidents.filter(i => {
        const date = new Date(i.dateCreated?._seconds ? i.dateCreated._seconds * 1000 : i.dateCreated);
        return date.getMonth() === new Date(`${month} 1, ${year}`).getMonth() && date.getFullYear() === +year;
      }).length;
    });
    return { labels: months, data: counts };
  }, [orgIncidents]);

  // High priority INCs (High/Critical, Open/Triaged/In Progress)
  const highPriorityIncidents = useMemo(() => {
    return orgIncidents
      .filter(i => 
        (i.priority === 'High' || i.priority === 'Critical') && 
        (i.status === 'Open' || i.status === 'Triaged' || i.status === 'In Progress')
      )
      .sort((a, b) => {
        const aTime = a.dateCreated?._seconds ? a.dateCreated._seconds * 1000 : new Date(a.dateCreated).getTime();
        const bTime = b.dateCreated?._seconds ? b.dateCreated._seconds * 1000 : new Date(b.dateCreated).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [orgIncidents]);

  // Chart data
  const pieData = useMemo(() => ({
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: [
        '#3b82f6', // blue
        '#a78bfa', // purple
        '#fbbf24', // yellow
        '#10b981', // green
        '#f87171', // red
      ],
      borderWidth: 1,
    }],
  }), [statusCounts]);

  const lineData = useMemo(() => ({
    labels: incidentTrend.labels,
    datasets: [
      {
        label: 'Incidents Created',
        data: incidentTrend.data,
        fill: false,
        borderColor: '#6366f1',
        backgroundColor: '#6366f1',
        tension: 0.3,
      },
    ],
  }), [incidentTrend]);

  const barData = useMemo(() => ({
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Incidents by Priority',
        data: [
          orgIncidents.filter(i => i.priority === 'Critical').length,
          orgIncidents.filter(i => i.priority === 'High').length,
          orgIncidents.filter(i => i.priority === 'Medium').length,
          orgIncidents.filter(i => i.priority === 'Low').length,
        ],
        backgroundColor: [
          '#ef4444', // red
          '#f59e42', // orange
          '#fbbf24', // yellow
          '#10b981', // green
        ],
      },
    ],
  }), [orgIncidents]);

  // Chart options for padding
  const chartOptions = useMemo(() => ({
    plugins: {
      legend: {
        labels: {
          padding: 24, // More space below legend
        },
      },
    },
    layout: {
      padding: {
        top: 24, // More space above chart area
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  }), []);

  return {
    statusCounts,
    incidentTrend,
    highPriorityIncidents,
    pieData,
    lineData,
    barData,
    chartOptions,
  };
}; 
