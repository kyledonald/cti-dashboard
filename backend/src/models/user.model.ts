// backend/src/models/user.model.ts
import { FieldValue } from '@google-cloud/firestore';

export interface User {
  userId: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string; // Optional
  role: 'admin' | 'editor' | 'viewer'; // Enforced roles
  organizationId: string; // Foreign Key to Organization
  status: 'active' | 'inactive'; // e.g., to disable accounts
  createdAt: FieldValue | FirebaseFirestore.Timestamp;
  lastLoginAt: FieldValue | FirebaseFirestore.Timestamp;
  updatedAt: FieldValue | FirebaseFirestore.Timestamp;
}

export interface CreateUserDTO {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: 'admin' | 'editor' | 'viewer';
  organizationId: string;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  role?: 'admin' | 'editor' | 'viewer';
  organizationId?: string;
  status?: 'active' | 'inactive';
}
