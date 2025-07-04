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
import { Card } from '../components/ui/card';
import { Link } from 'react-router-dom';

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
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Your organization's security at a glance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{isLoading ? '...' : orgIncidents.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Total Incidents</div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{isLoading ? '...' : orgIncidents.filter(i => i.status === 'Closed' || i.status === 'Resolved').length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Closed Incidents</div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{isLoading ? '...' : orgIncidents.filter(i => i.status === 'Open' || i.status === 'Triaged' || i.status === 'In Progress').length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Open Incidents</div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{isLoading ? '...' : cveCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">CVEs (High Severity)</div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{isLoading ? '...' : kevCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Known Exploited CVEs</div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{isLoading ? '...' : highRiskThreatActors.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">High-Risk Threat Actors</div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{isLoading ? '...' : softwareList.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">My Software</div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{isLoading ? '...' : atRiskSoftwareCount}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">Potential Software Vulnerabilities</div>
        </Card>
      </div>

      {/* Charts Grid - Each chart gets its own row */}
      <div className="space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Incident Status Breakdown</h3>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl h-72 mx-auto">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Incidents Created (Last 6 Months)</h3>
          <div className="w-full max-w-2xl h-72 mx-auto">
            <Line data={lineData} options={chartOptions} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Incidents by Priority</h3>
          <div className="w-full max-w-2xl h-72 mx-auto">
            <Bar data={barData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Quick Links - Following sidebar order */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        <Link to="/incidents">
          <Card className="p-6 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">Incidents</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">View and manage security incidents</div>
          </Card>
        </Link>
        <Link to="/threat-actors">
          <Card className="p-6 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors cursor-pointer flex flex-col items-center">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-2">Threat Actors</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">See known threat actors</div>
          </Card>
        </Link>
        <Link to="/cves">
          <Card className="p-6 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors cursor-pointer flex flex-col items-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">CVEs</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Explore vulnerabilities</div>
          </Card>
        </Link>
        <Link to="/my-software">
          <Card className="p-6 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors cursor-pointer flex flex-col items-center">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">My Software</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Manage your software inventory</div>
          </Card>
        </Link>
        <Link to="/users">
          <Card className="p-6 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer flex flex-col items-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Users</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Organization directory</div>
          </Card>
        </Link>
        <Link to="/organization">
          <Card className="p-6 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer flex flex-col items-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">Organization</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Manage organization settings</div>
          </Card>
        </Link>
      </div>

      {/* High Priority Incidents */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 mt-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">High Priority Incidents</h3>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : highPriorityIncidents.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No high priority incidents</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Great! No critical or high priority incidents are currently active.</p>
            </div>
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