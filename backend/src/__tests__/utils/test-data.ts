export const mockIncidents = [
    {
      incidentId: 'inc1',
      title: 'Critical Security Breach',
      description: 'Unauthorized access detected',
      status: 'Open',
      priority: 'Critical',
      organizationId: 'org1',
      dateCreated: { _seconds: Date.now() / 1000 - 86400 }, // 1 day ago
      reportedByUserId: 'user1',
      reportedByUserName: 'Admin User'
    },
    {
      incidentId: 'inc2',
      title: 'Medium Priority Alert',
      description: 'Suspicious activity',
      status: 'In Progress',
      priority: 'Medium',
      organizationId: 'org1',
      dateCreated: { _seconds: Date.now() / 1000 - 172800 }, // 2 days ago
      reportedByUserId: 'user1',
      reportedByUserName: 'Admin User'
    },
    {
      incidentId: 'inc3',
      title: 'High Priority Incident',
      description: 'Data breach attempt',
      status: 'Closed',
      priority: 'High',
      organizationId: 'org1',
      dateCreated: { _seconds: Date.now() / 1000 - 259200 }, // 3 days ago
      reportedByUserId: 'user1',
      reportedByUserName: 'Admin User'
    }
  ];
  
  export const mockCVEs = [
    {
      id: 'CVE-2024-0001',
      summary: 'Critical vulnerability in Apache',
      cvss: 9.8,
      kev: true,
      published: '2024-01-01'
    },
    {
      id: 'CVE-2024-0002',
      summary: 'High severity issue in MySQL',
      cvss: 8.5,
      kev: false,
      published: '2024-01-02'
    }
  ];
  
  export const mockThreatActors = [
    {
      threatActorId: 'ta1',
      name: 'Advanced Persistent Threat',
      sophistication: 'Advanced',
      organizationId: 'org1'
    },
    {
      threatActorId: 'ta2',
      name: 'Script Kiddie',
      sophistication: 'Individual',
      organizationId: 'org1'
    }
  ];
  
  export const mockAISummary = {
    summary: 'Critical vulnerability detected in Apache Log4j affecting multiple systems. Immediate patching required.',
    recommendations: [
      'Update Apache Log4j to version 2.17.0 or later',
      'Implement network segmentation',
      'Monitor for suspicious activity'
    ],
    riskLevel: 'Critical',
    affectedSystems: ['Web Server', 'Database Server', 'Application Server']
  };
  
  export const mockPDFBuffer = Buffer.from('Mock PDF content for vulnerability summary');
  