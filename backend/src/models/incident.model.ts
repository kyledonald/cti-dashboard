// backend/src/models/incident.model.ts
import { FieldValue } from '@google-cloud/firestore';

export interface Incident {
  incidentId: string;
  title: string;
  description: string;
  resolutionNotes?: string | null;
  status: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed'; // Enum
  priority: 'Low' | 'Medium' | 'High' | 'Critical'; // Enum
  type?: string | null; // <<< FIX: Allow null for 'type'
  cveIds?: string[];
  threatActorIds?: string[];
  reportedByUserId: string;
  reportedByUserName: string;
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  organizationId: string;
  dateCreated: FieldValue | FirebaseFirestore.Timestamp;
  dateResolved?: FieldValue | FirebaseFirestore.Timestamp | null; // <<< FIX: Allow null for 'dateResolved'
  lastUpdatedAt: FieldValue | FirebaseFirestore.Timestamp;
}

export interface CreateIncidentDTO {
  title: string;
  description: string;
  status: 'Open' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type?: string | null; // <<< FIX: Allow null for 'type' in DTO
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
  type?: string | null; // <<< FIX: Allow null for 'type' in DTO
  cveIds?: string[];
  threatActorIds?: string[];
  assignedToUserId?: string | null;
  assignedToUserName?: string | null;
  dateResolved?: FieldValue | null; // <<< FIX: Allow FieldValue or null for update, and it's optional
}
