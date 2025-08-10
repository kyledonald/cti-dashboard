import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface TestResult {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'pass' | 'fail';
  executionTime: number;
  lastRun: string;
  errorMessage?: string;
}

const TestingDashboardPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  useEffect(() => {
    const fetchTestResults = async () => {
      try {
        // In development, fetch from the public folder
        if (import.meta.env.DEV) {
          const response = await fetch('/test-results.json');
          if (response.ok) {
            const data = await response.json();
            setTestResults(data.testResults || []);
          } else {
            // show empty state if JSON file doesn't exist
            setTestResults([]);
          }
        } else {
          setTestResults([]);
        }
      } catch (error) {
        console.warn('Could not fetch test results:', error);
        setTestResults([]);
      }
    };

    fetchTestResults();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return '✅';
      case 'fail':
        return '❌';
      case 'running':
        return '🔄';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  };

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Backend Testing Dashboard
          </h1>
        </div>
        <div className="flex space-x-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Run <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">npm run test:update</code> in backend to update results
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTests}</p>
              </div>
              <div className="text-3xl">📋</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <div className="space-y-4">
              {testResults.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Tests Available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tests will appear here once you create them.
                  </p>
                </div>
              ) : (
                testResults.map((test) => (
                  <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getStatusIcon(test.status)}</span>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {test.name}
                          </h3>
                          <Badge className={getStatusColor(test.status)}>
                            {test.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {test.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {test.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                        ❌ {test.errorMessage}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboardPage; 
