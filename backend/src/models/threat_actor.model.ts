import { FieldValue } from '@google-cloud/firestore';

export interface ThreatActor {
  threatActorId: string;
  name: string;
  description?: string | null;
  aliases?: string[];
  targetIndustries?: string[];
  associatedCves?: string[];
  countryOfOrigin?: string | null;
  createdAt: FieldValue | FirebaseFirestore.Timestamp;
  updatedAt: FieldValue | FirebaseFirestore.Timestamp;
}

export interface CreateThreatActorDTO {
  name: string;
  description?: string;
  aliases?: string[];
  targetIndustries?: string[];
  associatedCves?: string[];
  countryOfOrigin?: string;
}

export interface UpdateThreatActorDTO {
  name?: string;
  description?: string | null;
  aliases?: string[];
  targetIndustries?: string[];
  associatedCves?: string[];
  countryOfOrigin?: string | null;
}
