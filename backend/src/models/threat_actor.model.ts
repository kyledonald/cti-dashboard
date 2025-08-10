import { FieldValue } from '@google-cloud/firestore';

export interface ThreatActor {
  threatActorId: string;
  name: string;
  description?: string | null;
  aliases?: string[];
  country?: string | null;
  firstSeen?: string | null;
  lastSeen?: string | null;
  motivation?: string | null;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  isActive?: boolean;
  organizationId?: string;
  createdAt: FieldValue | FirebaseFirestore.Timestamp;
  updatedAt: FieldValue | FirebaseFirestore.Timestamp;
}

export interface CreateThreatActorDTO {
  name: string;
  description?: string | null;
  aliases?: string[];
  country?: string | null;
  firstSeen?: string | null;
  lastSeen?: string | null;
  motivation?: string | null;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  isActive?: boolean;
  organizationId: string;
}

export interface UpdateThreatActorDTO {
  name?: string;
  description?: string | null;
  aliases?: string[];
  country?: string | null;
  firstSeen?: string | null;
  lastSeen?: string | null;
  motivation?: string | null;
  sophistication?: 'Unknown' | 'Minimal' | 'Intermediate' | 'Advanced' | 'Expert';
  resourceLevel?: 'Unknown' | 'Individual' | 'Team' | 'Organization' | 'Government';
  primaryTargets?: string[];
  isActive?: boolean;
}
