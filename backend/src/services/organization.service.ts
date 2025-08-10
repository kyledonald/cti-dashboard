import { Firestore, FieldValue } from '@google-cloud/firestore';
import {
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
} from '../models/organization.model';

export class OrganizationService {
  private db: Firestore;
  private collection: FirebaseFirestore.CollectionReference;

  constructor(db: Firestore) {
    this.db = db;
    this.collection = db.collection('organizations');
  }

  async createOrganization(orgData: CreateOrganizationDTO): Promise<Organization> {
    const organizationRef = this.collection.doc();
    const organizationId = organizationRef.id;

    const newOrganization: Organization = {
      organizationId: organizationId,
      name: orgData.name,
      description: orgData.description || null,
      status: 'active',
      nationality: orgData.nationality ?? null,
      industry: orgData.industry ?? null,
      usedSoftware: orgData.usedSoftware ?? [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await organizationRef.set(newOrganization);
    return newOrganization;
  }

  async createOrganizationAndAssignUser(orgData: CreateOrganizationDTO, userId: string): Promise<Organization> {
    const organizationRef = this.collection.doc();
    const organizationId = organizationRef.id;

    const newOrganization: Organization = {
      organizationId: organizationId,
      name: orgData.name,
      description: orgData.description || null,
      status: 'active',
      nationality: orgData.nationality ?? null,
      industry: orgData.industry ?? null,
      usedSoftware: orgData.usedSoftware ?? [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // batch write to make sure both operations succeed or fail together
    const batch = this.db.batch();
    
    batch.set(organizationRef, newOrganization);
    
    // Update the user to be part of the org as admin
    const userRef = this.db.collection('users').doc(userId);
    batch.update(userRef, {
      organizationId: organizationId,
      role: 'admin',
      updatedAt: FieldValue.serverTimestamp()
    });

    await batch.commit();
    return newOrganization;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const snapshot = await this.collection.orderBy('name').get();
      const organizations: Organization[] = [];
      snapshot.forEach((doc) => {
        organizations.push(doc.data() as Organization);
      });
      return organizations;
    } catch (error) {
      throw error;
    }
  }

  async getOrganizationById(
    organizationId: string,
  ): Promise<Organization | null> {
    try {
      const doc = await this.collection.doc(organizationId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data() as Organization;
    } catch (error) {
      throw error;
    }
  }

  async updateOrganization(organizationId: string, updateData: UpdateOrganizationDTO): Promise<boolean> {
    try {
      const organizationRef = this.collection.doc(organizationId);
      const doc = await organizationRef.get();

      if (!doc.exists) {
        return false;
      }

      const dataToUpdate: any = { updatedAt: FieldValue.serverTimestamp() };
      if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
      if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
      if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
      if (updateData.nationality !== undefined) dataToUpdate.nationality = updateData.nationality;
      if (updateData.industry !== undefined) dataToUpdate.industry = updateData.industry;
      if (updateData.usedSoftware !== undefined) dataToUpdate.usedSoftware = updateData.usedSoftware;

      await organizationRef.update(dataToUpdate);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async deleteOrganization(organizationId: string): Promise<boolean> {
    try {
      const organizationRef = this.collection.doc(organizationId);
      const doc = await organizationRef.get();

      if (!doc.exists) {
        return false;
      }

      // Clean up users in this org - set them to unassigned
      const usersCollection = this.db.collection('users');
      const usersSnapshot = await usersCollection.where('organizationId', '==', organizationId).get();
      
      // Clean up incidents in this org - delete them all
      const incidentsCollection = this.db.collection('incidents');
      const incidentsSnapshot = await incidentsCollection.where('organizationId', '==', organizationId).get();
      
      console.log(`🗑️ Cascading delete for organization ${organizationId}:`, {
        usersToUpdate: usersSnapshot.size,
        incidentsToDelete: incidentsSnapshot.size
      });
      
      const batch = this.db.batch();
      
      // Update all users to remove their org assignment and set their role to unassigned
      usersSnapshot.forEach((userDoc) => {
        batch.update(userDoc.ref, {
          organizationId: '',
          role: 'unassigned',
          updatedAt: FieldValue.serverTimestamp()
        });
      });
      
      // Delete all INCs
      incidentsSnapshot.forEach((incidentDoc) => {
        batch.delete(incidentDoc.ref);
      });
      
      batch.delete(organizationRef);
      
      await batch.commit();
      
      return true;
    } catch (error) {
      throw error;
    }
  }
}
