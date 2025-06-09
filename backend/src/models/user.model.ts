import { FieldValue } from '@google-cloud/firestore';

export interface User {
  userId: string;
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  role: 'admin' | 'editor' | 'viewer';
  organizationId: string;
  status: 'active' | 'inactive';
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
