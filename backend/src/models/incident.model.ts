import { FieldValue } from '@google-cloud/firestore';

export interface Incident {
  incidentId: string;
  title: string;
  description: string;
  resolutionNotes?: string | null;
  status: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  reportedByUserId: string;
  reportedByUserName: string;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  organizationId: string;
  dateCreated: FieldValue | FirebaseFirestore.Timestamp;
  dateResolved?: FieldValue | FirebaseFirestore.Timestamp | null;
  lastUpdatedAt: FieldValue | FirebaseFirestore.Timestamp;
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
  status?: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string | null;
  cveIds?: string[];
  threatActorIds?: string[];
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  dateResolved?: FieldValue | null;
}
