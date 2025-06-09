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

  async createOrganization(
    orgData: CreateOrganizationDTO,
  ): Promise<Organization> {
    const organizationRef = this.collection.doc();
    const organizationId = organizationRef.id;

    const newOrganization: Organization = {
      organizationId: organizationId,
      name: orgData.name,
      description: orgData.description || null,
      status: 'active',
      nationality: orgData.nationality ?? null,
      industry: orgData.industry ?? null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await organizationRef.set(newOrganization);
    return newOrganization;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    const snapshot = await this.collection.orderBy('name').get();
    const organizations: Organization[] = [];
    snapshot.forEach((doc) => {
      organizations.push(doc.data() as Organization);
    });
    return organizations;
  }

  async getOrganizationById(
    organizationId: string,
  ): Promise<Organization | null> {
    const doc = await this.collection.doc(organizationId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as Organization;
  }

  async updateOrganization(
    organizationId: string,
    updateData: UpdateOrganizationDTO,
  ): Promise<boolean> {
    const organizationRef = this.collection.doc(organizationId);
    const doc = await organizationRef.get();

    if (!doc.exists) {
      return false;
    }

    const dataToUpdate: any = { updatedAt: FieldValue.serverTimestamp() };
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.description !== undefined)
      dataToUpdate.description = updateData.description;
    if (updateData.status !== undefined)
      dataToUpdate.status = updateData.status;
    if (updateData.nationality !== undefined)
      dataToUpdate.nationality = updateData.nationality;
    if (updateData.industry !== undefined)
      dataToUpdate.industry = updateData.industry;

    await organizationRef.update(dataToUpdate);
    return true;
  }

  async deleteOrganization(organizationId: string): Promise<boolean> {
    const organizationRef = this.collection.doc(organizationId);
    const doc = await organizationRef.get();

    if (!doc.exists) {
      return false;
    }
    // TODO: Add a check if there are users in the organization before deleting
    await organizationRef.delete();
    return true;
  }
}
