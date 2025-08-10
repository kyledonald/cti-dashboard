import React from 'react';
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
import { useDashboardData } from '../components/dashboard/hooks/useDashboardData';
import { useDashboardMetrics } from '../components/dashboard/hooks/useDashboardMetrics';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const DashboardPage: React.FC = () => {
  const {
    orgIncidents,
    kevCount,
    cveCount,
    atRiskSoftwareCount,
    highRiskThreatActors,
    softwareList,
    isLoading,
  } = useDashboardData();

  const {
    highPriorityIncidents,
    pieData,
    lineData,
    barData,
    chartOptions,
  } = useDashboardMetrics(orgIncidents);

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

      {/* Quick Links - same order as sidebar */}
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

      {/* High Priority INCs */}
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
