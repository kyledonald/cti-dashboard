import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface TestResult {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e';
  status: 'pass' | 'fail' | 'pending' | 'running';
  userRequirement?: string;
  executionTime?: number;
  lastRun?: string;
  errorMessage?: string;
}

interface TestCategory {
  name: string;
  total: number;
  passed: number;
  failed: number;
  pending: number;
}

const TestingDashboardPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock test data - in real implementation, this would come from test runners
  const mockTestResults: TestResult[] = [
    // Authentication Tests
    {
      id: 'auth-001',
      name: 'Valid Login with Correct Credentials',
      description: 'User can successfully log in with valid email and password',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-001: User Authentication',
      executionTime: 0.2,
      lastRun: new Date().toISOString()
    },
    {
      id: 'auth-002',
      name: 'Invalid Email Format Rejection',
      description: 'System rejects login attempts with invalid email format',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-001: User Authentication',
      executionTime: 0.1,
      lastRun: new Date().toISOString()
    },
    {
      id: 'auth-003',
      name: 'Empty Credentials Handling',
      description: 'System properly handles empty email and password fields',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-001: User Authentication',
      executionTime: 0.15,
      lastRun: new Date().toISOString()
    },
    {
      id: 'auth-004',
      name: 'SQL Injection Prevention',
      description: 'System prevents SQL injection attacks in login form',
      category: 'integration',
      status: 'pass',
      userRequirement: 'UR-002: Security',
      executionTime: 0.3,
      lastRun: new Date().toISOString()
    },
    {
      id: 'auth-005',
      name: 'XSS Attack Prevention',
      description: 'System prevents XSS attacks in user inputs',
      category: 'integration',
      status: 'pass',
      userRequirement: 'UR-002: Security',
      executionTime: 0.25,
      lastRun: new Date().toISOString()
    },
    {
      id: 'auth-006',
      name: 'Complete Login Workflow',
      description: 'End-to-end login process from landing page to dashboard',
      category: 'e2e',
      status: 'pass',
      userRequirement: 'UR-001: User Authentication',
      executionTime: 2.5,
      lastRun: new Date().toISOString()
    },
    {
      id: 'auth-007',
      name: 'Rate Limiting on Login',
      description: 'System enforces rate limiting on repeated login attempts',
      category: 'integration',
      status: 'pass',
      userRequirement: 'UR-002: Security',
      executionTime: 1.2,
      lastRun: new Date().toISOString()
    },
    // Authorization Tests
    {
      id: 'authz-001',
      name: 'Admin Access to All Endpoints',
      description: 'Admin users can access all system endpoints',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-003: Role-Based Access Control',
      executionTime: 0.3,
      lastRun: new Date().toISOString()
    },
    {
      id: 'authz-002',
      name: 'Viewer Restrictions',
      description: 'Viewer users cannot perform admin actions',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-003: Role-Based Access Control',
      executionTime: 0.2,
      lastRun: new Date().toISOString()
    },
    {
      id: 'authz-003',
      name: 'Role-Based UI Elements',
      description: 'UI elements are properly hidden/shown based on user role',
      category: 'e2e',
      status: 'pass',
      userRequirement: 'UR-003: Role-Based Access Control',
      executionTime: 3.1,
      lastRun: new Date().toISOString()
    },
    // Incident Management Tests
    {
      id: 'incident-001',
      name: 'Create Incident',
      description: 'Users can create new security incidents',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-004: Incident Management',
      executionTime: 0.4,
      lastRun: new Date().toISOString()
    },
    {
      id: 'incident-002',
      name: 'Edit Incident',
      description: 'Users can edit existing incidents',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-004: Incident Management',
      executionTime: 0.3,
      lastRun: new Date().toISOString()
    },
    {
      id: 'incident-003',
      name: 'Delete Incident',
      description: 'Authorized users can delete incidents',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-004: Incident Management',
      executionTime: 0.2,
      lastRun: new Date().toISOString()
    },
    {
      id: 'incident-004',
      name: 'Incident Workflow',
      description: 'Complete incident lifecycle from creation to resolution',
      category: 'e2e',
      status: 'pass',
      userRequirement: 'UR-004: Incident Management',
      executionTime: 8.5,
      lastRun: new Date().toISOString()
    },
    // AI Summary Tests
    {
      id: 'ai-001',
      name: 'AI Summary Generation',
      description: 'System can generate AI summaries for incidents',
      category: 'integration',
      status: 'pass',
      userRequirement: 'UR-005: AI Intelligence',
      executionTime: 5.2,
      lastRun: new Date().toISOString()
    },
    {
      id: 'ai-002',
      name: 'Rate Limiting on AI Requests',
      description: 'AI summary requests are properly rate limited',
      category: 'integration',
      status: 'pass',
      userRequirement: 'UR-005: AI Intelligence',
      executionTime: 2.1,
      lastRun: new Date().toISOString()
    },
    {
      id: 'ai-003',
      name: 'AI Summary Format',
      description: 'AI summaries follow the correct 5-section format',
      category: 'unit',
      status: 'pass',
      userRequirement: 'UR-005: AI Intelligence',
      executionTime: 0.8,
      lastRun: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setTestResults(mockTestResults);
    calculateCategories();
  }, []);

  const calculateCategories = () => {
    const categoryMap = new Map<string, TestCategory>();
    
    mockTestResults.forEach(test => {
      if (!categoryMap.has(test.category)) {
        categoryMap.set(test.category, {
          name: test.category,
          total: 0,
          passed: 0,
          failed: 0,
          pending: 0
        });
      }
      
      const category = categoryMap.get(test.category)!;
      category.total++;
      
      switch (test.status) {
        case 'pass':
          category.passed++;
          break;
        case 'fail':
          category.failed++;
          break;
        case 'pending':
          category.pending++;
          break;
      }
    });
    
    setCategories(Array.from(categoryMap.values()));
  };

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

  const runAllTests = async () => {
    setIsRunning(true);
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsRunning(false);
  };

  const runCategoryTests = async (_category: string) => {
    setIsRunning(true);
    // Simulate category test execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRunning(false);
  };

  const filteredTests = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(test => test.category === selectedCategory);

  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Testing Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track test results and user requirement coverage
          </p>
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTests}</p>
              </div>
              <div className="text-3xl">🧪</div>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Test Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.name} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{category.name} Tests</h3>
                  <Button 
                    size="sm" 
                    onClick={() => runCategoryTests(category.name)}
                    disabled={isRunning}
                  >
                    Run
                  </Button>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{category.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Passed:</span>
                    <span className="font-medium text-green-600">{category.passed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-600">Failed:</span>
                    <span className="font-medium text-red-600">{category.failed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Tests</TabsTrigger>
              <TabsTrigger value="unit">Unit Tests</TabsTrigger>
              <TabsTrigger value="integration">Integration Tests</TabsTrigger>
              <TabsTrigger value="e2e">E2E Tests</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              <div className="space-y-4">
                {filteredTests.map((test) => (
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
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {test.description}
                        </p>
                        {test.userRequirement && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            📋 {test.userRequirement}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {test.executionTime && (
                          <div>⏱️ {test.executionTime}s</div>
                        )}
                        {test.lastRun && (
                          <div>🕒 {new Date(test.lastRun).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                    {test.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                        ❌ {test.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestingDashboardPage; 