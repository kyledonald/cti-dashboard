import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { incidentsApi, cvesApi, threatActorsApi } from '../api';
import { useQuery } from '@tanstack/react-query';
import { Pie, Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from 'chart.js';

import { Link } from 'react-router-dom';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardMetricCard } from '../components/dashboard/DashboardMetricCard';
import { DashboardChartCard } from '../components/dashboard/DashboardChartCard';
import { DashboardQuickLinkCard } from '../components/dashboard/DashboardQuickLinkCard';
import { DashboardEmptyState } from '../components/dashboard/DashboardEmptyState';
import { DashboardLoadingState } from '../components/dashboard/DashboardLoadingState';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Data fetching
  const { data: incidents = [], isLoading: incidentsLoading } = useQuery({
    queryKey: ['incidents'],
    queryFn: incidentsApi.getAll,
  });
  const { data: threatActors = [], isLoading: threatActorsLoading } = useQuery({
    queryKey: ['threatActors'],
    queryFn: threatActorsApi.getAll,
  });
  const [cves, setCves] = useState<any[]>([]);
  const [cvesLoading, setCvesLoading] = useState(true);
  const [softwareList, setSoftwareList] = useState<string[]>([]);
  const [atRiskSoftwareCount, setAtRiskSoftwareCount] = useState(0);

  // Fetch CVEs (top 200, high severity)
  useEffect(() => {
    let mounted = true;
    setCvesLoading(true);
    cvesApi.getShodanLatest(8.0, 200).then((data) => {
      if (mounted) setCves(data);
    }).finally(() => setCvesLoading(false));
    return () => { mounted = false; };
  }, []);

  // Load org-specific software from localStorage
  useEffect(() => {
    if (!user?.organizationId) return;
    const saved = localStorage.getItem(`organization-software-${user.organizationId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          if (parsed.length > 0 && typeof parsed[0] === 'string') {
            setSoftwareList(parsed);
          } else {
            setSoftwareList(parsed.map((item: any) => `${item.vendor} ${item.name}`.trim()));
          }
        }
      } catch {}
    }
  }, [user?.organizationId]);

  // Calculate at-risk software
  useEffect(() => {
    if (!softwareList.length || !cves.length) {
      setAtRiskSoftwareCount(0);
      return;
    }
    const atRisk = cves.filter(cve =>
      softwareList.some(software => cve.summary.toLowerCase().includes(software.toLowerCase()))
    );
    setAtRiskSoftwareCount(atRisk.length);
  }, [softwareList, cves]);

  // Org-specific filtering
  const orgId = user?.organizationId;
  const orgIncidents = useMemo(() => incidents.filter(i => i.organizationId === orgId), [incidents, orgId]);
  const orgThreatActors = useMemo(() => threatActors.filter(ta => !ta.organizationId || ta.organizationId === orgId), [threatActors, orgId]);

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

  // CVE metrics
  const kevCount = useMemo(() => cves.filter(cve => cve.kev).length, [cves]);
  const cveCount = cves.length;

  // High-risk threat actors
  const highRiskThreatActors = useMemo(() => orgThreatActors.filter(ta => ta.sophistication === 'Advanced' || ta.sophistication === 'Expert' || ta.isActive), [orgThreatActors]);

  // High priority incidents (High/Critical, Open/Triaged/In Progress)
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

  const isLoading = incidentsLoading || threatActorsLoading || cvesLoading;

  // Chart data
  const pieData = {
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
  };

  const lineData = {
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
  };

  const barData = {
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
  };

  // Chart options for padding
  const chartOptions = {
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
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4">
      <DashboardHeader />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardMetricCard
          value={orgIncidents.length}
          label="Total Incidents"
          color="purple"
          isLoading={isLoading}
        />
        <DashboardMetricCard
          value={orgIncidents.filter(i => i.status === 'Closed' || i.status === 'Resolved').length}
          label="Closed Incidents"
          color="green"
          isLoading={isLoading}
        />
        <DashboardMetricCard
          value={orgIncidents.filter(i => i.status === 'Open' || i.status === 'Triaged' || i.status === 'In Progress').length}
          label="Open Incidents"
          color="red"
          isLoading={isLoading}
        />
        <DashboardMetricCard
          value={cveCount}
          label="CVEs (High Severity)"
          color="yellow"
          isLoading={isLoading}
        />
        <DashboardMetricCard
          value={kevCount}
          label="Known Exploited CVEs"
          color="pink"
          isLoading={isLoading}
        />
        <DashboardMetricCard
          value={highRiskThreatActors.length}
          label="High-Risk Threat Actors"
          color="orange"
          isLoading={isLoading}
        />
        <DashboardMetricCard
          value={softwareList.length}
          label="My Software"
          color="indigo"
          isLoading={isLoading}
        />
        <DashboardMetricCard
          value={atRiskSoftwareCount}
          label="Potential Software Vulnerabilities"
          color="rose"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Grid - Each chart gets its own row */}
      <div className="space-y-8">
        <DashboardChartCard title="Incident Status Breakdown" centerChart>
          <Pie data={pieData} options={chartOptions} />
        </DashboardChartCard>
        <DashboardChartCard title="Incidents Created (Last 6 Months)">
          <Line data={lineData} options={chartOptions} />
        </DashboardChartCard>
        <DashboardChartCard title="Incidents by Priority">
          <Bar data={barData} options={chartOptions} />
        </DashboardChartCard>
      </div>

      {/* Quick Links - Following sidebar order */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        <DashboardQuickLinkCard
          to="/incidents"
          title="Incidents"
          description="View and manage security incidents"
          color="blue"
        />
        <DashboardQuickLinkCard
          to="/threat-actors"
          title="Threat Actors"
          description="See known threat actors"
          color="pink"
        />
        <DashboardQuickLinkCard
          to="/cves"
          title="CVEs"
          description="Explore vulnerabilities"
          color="yellow"
        />
        <DashboardQuickLinkCard
          to="/my-software"
          title="My Software"
          description="Manage your software inventory"
          color="indigo"
        />
        <DashboardQuickLinkCard
          to="/users"
          title="Users"
          description="Organization directory"
          color="green"
        />
        <DashboardQuickLinkCard
          to="/organization"
          title="Organization"
          description="Manage organization settings"
          color="orange"
        />
      </div>

      {/* High Priority Incidents */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 mt-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">High Priority Incidents</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <DashboardLoadingState />
          ) : highPriorityIncidents.length === 0 ? (
            <DashboardEmptyState />
          ) : (
            <div className="space-y-4">
              {highPriorityIncidents.map((incident, idx) => (
                <Link 
                  key={incident.incidentId || idx} 
                  to={`/incidents?view=${incident.incidentId}`}
                  replace={false}
                  className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 font-semibold text-lg">
                      {incident.title?.[0]?.toUpperCase() || '!'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {incident.title || 'Untitled Incident'}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                        incident.status === 'Open' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        incident.status === 'Triaged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        incident.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {incident.status || 'Unknown'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        incident.priority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        incident.priority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {incident.priority || 'Unknown'} Priority
                      </span>
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 