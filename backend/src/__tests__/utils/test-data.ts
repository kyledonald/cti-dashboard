export const mockIncidents: any[] = [
    {
      incidentId: 'inc1',
      title: 'Critical Security Breach',
      description: 'Unauthorized access detected',
      status: 'Open',
      priority: 'Critical',
      organizationId: 'org-1',
      dateCreated: { _seconds: Date.now() / 1000 - 86400 }, // 1 day ago
      reportedByUserId: 'user1',
      reportedByUserName: 'Admin User',
      resolutionComments: []
    },
    {
      incidentId: 'inc2',
      title: 'Medium Priority Alert',
      description: 'Suspicious activity',
      status: 'In Progress',
      priority: 'Medium',
      organizationId: 'org-1',
      dateCreated: { _seconds: Date.now() / 1000 - 172800 }, // 2 days ago
      reportedByUserId: 'user1',
      reportedByUserName: 'Admin User',
      resolutionComments: []
    },
    {
      incidentId: 'inc3',
      title: 'High Priority Incident',
      description: 'Data breach attempt',
      status: 'Closed',
      priority: 'High',
      organizationId: 'org-1',
      dateCreated: { _seconds: Date.now() / 1000 - 259200 }, // 3 days ago
      reportedByUserId: 'user1',
      reportedByUserName: 'Admin User',
      resolutionComments: []
    }
  ];
  
  export const mockCVEs = [
    {
      cve: 'CVE-2024-0001',
      summary: 'Critical vulnerability in Apache Log4j affecting Microsoft Windows systems',
      cvss: 9.8,
      cvss3: { score: 9.8, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
      kev: true,
      published: '2024-01-01',
      modified: '2024-01-01',
      references: ['https://example.com/cve-2024-0001'],
      extractedVendors: ['Apache', 'Microsoft']
    },
    {
      cve: 'CVE-2024-0002',
      summary: 'High severity issue in Adobe Acrobat Reader affecting multiple platforms',
      cvss: 8.5,
      cvss3: { score: 8.5, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:N' },
      kev: false,
      published: '2024-01-02',
      modified: '2024-01-02',
      references: ['https://example.com/cve-2024-0002'],
      extractedVendors: ['Adobe']
    },
    {
      cve: 'CVE-2024-0003',
      summary: 'Medium severity vulnerability in Oracle Database affecting enterprise systems',
      cvss: 6.5,
      cvss3: { score: 6.5, vector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:N/A:N' },
      kev: false,
      published: '2024-01-03',
      modified: '2024-01-03',
      references: ['https://example.com/cve-2024-0003'],
      extractedVendors: ['Oracle']
    },
    {
      cve: 'CVE-2024-0004',
      summary: 'Critical Microsoft Windows vulnerability allowing remote code execution',
      cvss: 9.9,
      cvss3: { score: 9.9, vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H' },
      kev: true,
      published: '2024-01-04',
      modified: '2024-01-04',
      references: ['https://example.com/cve-2024-0004'],
      extractedVendors: ['Microsoft']
    }
  ];
  
  export const mockThreatActors = [
    {
      threatActorId: 'ta1',
      name: 'Advanced Persistent Threat',
      sophistication: 'Advanced',
      organizationId: 'org-1'
    },
    {
      threatActorId: 'ta2',
      name: 'Script Kiddie',
      sophistication: 'Individual',
      organizationId: 'org-1'
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
  