import { FieldValue } from '@google-cloud/firestore';

export interface Organization {
  organizationId: string;
  name: string;
  description?: string | null;
  status: 'active' | 'inactive';
  nationality?: string | null;
  industry?: string | null;
  createdAt: FieldValue | FirebaseFirestore.Timestamp;
  updatedAt: FieldValue | FirebaseFirestore.Timestamp;
}

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  nationality?: string;
  industry?: string;
}

export interface UpdateOrganizationDTO {
  name?: string;
  description?: string | null;
  status?: 'active' | 'inactive';
  nationality?: string | null;
  industry?: string | null;
}
