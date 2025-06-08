// backend/src/models/organization.model.ts
import { FieldValue } from '@google-cloud/firestore'; // <<< ADD THIS IMPORT

export interface Organization {
  organizationId: string;
  name: string;
  description?: string | null; // Optional
  status: 'active' | 'inactive'; // Enum
  // CRITICAL FIX: Change types to FieldValue | FirebaseFirestore.Timestamp
  createdAt: FieldValue | FirebaseFirestore.Timestamp;
  updatedAt: FieldValue | FirebaseFirestore.Timestamp;
}

// This is optional, but useful if your request body has fewer fields than the full model
export interface CreateOrganizationDTO {
  name: string;
  description?: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  description?: string | null;
  status?: 'active' | 'inactive';
}
