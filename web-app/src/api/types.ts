// Organization Types
export interface Organization {
  organizationId: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  nationality?: string | null;
  industry?: string | null;
  usedSoftware?: string[];
  createdAt: any;
  updatedAt: any;
}

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  nationality?: string;
  industry?: string;
  usedSoftware?: string[];
}

// User Types
export interface User {
  userId: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: 'admin' | 'viewer' | 'editor' | 'unassigned';
  organizationId?: string;
  status: 'active' | 'inactive';
  createdAt: any;
  updatedAt: any;
  lastLoginAt?: any;
}

export interface CreateUserDTO {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role?: 'admin' | 'editor' | 'viewer' | 'unassigned';
  organizationId?: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  role?: 'admin' | 'editor' | 'viewer' | 'unassigned';
  organizationId?: string;
  status?: 'active' | 'inactive';
}

// Incident Types
export interface ResolutionComment {
  commentId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: any;
}

export interface Incident {
  incidentId: string;
  title: string;
  description: string;
  status: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  organizationId: string;
  dateCreated: any;
  lastUpdatedAt: any;
  reportedByUserId: string;
  reportedByUserName: string;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  resolutionNotes?: string | null;
  resolutionComments?: ResolutionComment[];
  dateResolved?: any | null;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  status: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  reportedByUserId: string;
  reportedByUserName: string;
  organizationId: string;
}

export interface UpdateIncidentDTO {
  title?: string;
  description?: string;
  resolutionNotes?: string | null;
  resolutionComments?: ResolutionComment[];
  status?: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  dateResolved?: any | null;
}

export interface AddCommentDTO {
  incidentId: string;
  content: string;
  userId: string;
  userName: string;
}

// Threat Actor Types
export interface ThreatActor {
  threatActorId: string;
  name: string;
  description?: string;
  nationality?: string;
  motivation?: string;
  capabilities?: string[];
  aliases?: string[];
  organizationId?: string; // Added for organization-specific threat actors
  // Enhanced fields for modern threat intelligence
  country?: string;
  firstSeen?: string;
  lastSeen?: string;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  attackPatterns?: string[];
  tools?: string[];
  malwareFamilies?: string[];
  isActive?: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface CreateThreatActorDTO {
  name: string;
  description?: string;
  nationality?: string;
  motivation?: string;
  capabilities?: string[];
  aliases?: string[];
  organizationId?: string; // Added for organization-specific threat actors
  // Enhanced fields for modern threat intelligence
  country?: string;
  firstSeen?: string;
  lastSeen?: string;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  attackPatterns?: string[];
  tools?: string[];
  malwareFamilies?: string[];
  isActive?: boolean;
}

export interface UpdateThreatActorDTO {
  name?: string;
  description?: string;
  nationality?: string;
  motivation?: string;
  capabilities?: string[];
  aliases?: string[];
  // Enhanced fields for modern threat intelligence
  country?: string;
  firstSeen?: string;
  lastSeen?: string;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Club' | 'Contest' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  attackPatterns?: string[];
  tools?: string[];
  malwareFamilies?: string[];
  isActive?: boolean;
}

// CVE Types
export interface CVE {
  cveId: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  cvssScore?: number;
  publishedDate: any;
  lastModifiedDate: any;
  affectedSoftware?: string[];
}

export interface ShodanCVE {
  cve: string;
  summary: string;
  cvss?: number;
  cvss3?: {
    score: number;
    vector: string;
  };
  kev?: boolean; // Known Exploited Vulnerability
  published: string;
  modified: string;
  references: string[];
  // Extract vendor info from summary when possible
  extractedVendors?: string[];
} 