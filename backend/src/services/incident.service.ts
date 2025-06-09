// backend/src/services/incident.service.ts
import { Firestore, FieldValue } from '@google-cloud/firestore';
import {
  Incident,
  CreateIncidentDTO,
  UpdateIncidentDTO,
} from '../models/incident.model';

export class IncidentService {
  private db: Firestore;
  private collection: FirebaseFirestore.CollectionReference;

  constructor(db: Firestore) {
    this.db = db;
    this.collection = db.collection('incidents');
  }

  async createIncident(incidentData: CreateIncidentDTO): Promise<Incident> {
    const incidentRef = this.collection.doc();
    const incidentId = incidentRef.id;

    const newIncident: Incident = {
      incidentId: incidentId,
      title: incidentData.title,
      description: incidentData.description,
      resolutionNotes: null, // Null by default on creation
      status: incidentData.status,
      priority: incidentData.priority,
      type: incidentData.type, // <<< FIX: Removed ?? null. Let it be undefined if not provided.
      cveIds: incidentData.cveIds ?? [],
      threatActorIds: incidentData.threatActorIds ?? [],
      reportedByUserId: incidentData.reportedByUserId,
      reportedByUserName: incidentData.reportedByUserName,
      assignedToUserId: null, // Null by default on creation
      assignedToUserName: null, // Null by default on creation
      organizationId: incidentData.organizationId,
      dateCreated: FieldValue.serverTimestamp(),
      dateResolved: null, // Null by default on creation
      lastUpdatedAt: FieldValue.serverTimestamp(),
    };

    await incidentRef.set(newIncident);
    return newIncident;
  }

  async getAllIncidents(organizationId?: string): Promise<Incident[]> {
    let query: FirebaseFirestore.Query = this.collection;
    if (organizationId) {
      query = query.where('organizationId', '==', organizationId);
    }
    const snapshot = await query.orderBy('dateCreated', 'desc').get();
    const incidents: Incident[] = [];
    snapshot.forEach((doc) => {
      incidents.push(doc.data() as Incident);
    });
    return incidents;
  }

  async getIncidentById(incidentId: string): Promise<Incident | null> {
    const doc = await this.collection.doc(incidentId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as Incident;
  }

  async updateIncident(
    incidentId: string,
    updateData: UpdateIncidentDTO,
  ): Promise<boolean> {
    const incidentRef = this.collection.doc(incidentId);
    const doc = await incidentRef.get();
    const currentIncident = doc.data() as Incident; // Get current data to check old status

    if (!doc.exists) {
      return false;
    }

    const dataToUpdate: any = { lastUpdatedAt: FieldValue.serverTimestamp() };
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined)
      dataToUpdate.description = updateData.description;
    if (updateData.resolutionNotes !== undefined)
      dataToUpdate.resolutionNotes = updateData.resolutionNotes;

    // Handle status and dateResolved (CRITICAL FIX)
    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;
      // If status changes to 'Resolved' and it wasn't resolved before, set dateResolved
      if (
        updateData.status === 'Resolved' &&
        currentIncident.status !== 'Resolved'
      ) {
        dataToUpdate.dateResolved = FieldValue.serverTimestamp();
      }
      // If status changes from 'Resolved' to anything else, explicitly clear dateResolved (set to null)
      else if (
        updateData.status !== 'Resolved' &&
        currentIncident.status === 'Resolved'
      ) {
        dataToUpdate.dateResolved = null;
      }
    }

    // Always apply dateResolved from DTO if it was explicitly sent (even if null)
    // This is the clean way to handle optional update fields in TypeScript
    if (updateData.dateResolved !== undefined) {
      dataToUpdate.dateResolved = updateData.dateResolved; // Assigns FieldValue.serverTimestamp() or null
    }

    if (updateData.priority !== undefined)
      dataToUpdate.priority = updateData.priority;
    if (updateData.type !== undefined) dataToUpdate.type = updateData.type;
    if (updateData.cveIds !== undefined)
      dataToUpdate.cveIds = updateData.cveIds;
    if (updateData.threatActorIds !== undefined)
      dataToUpdate.threatActorIds = updateData.threatActorIds;
    if (updateData.assignedToUserId !== undefined)
      dataToUpdate.assignedToUserId = updateData.assignedToUserId;
    if (updateData.assignedToUserName !== undefined)
      dataToUpdate.assignedToUserName = updateData.assignedToUserName;

    await incidentRef.update(dataToUpdate);
    return true;
  }

  async deleteIncident(incidentId: string): Promise<boolean> {
    const incidentRef = this.collection.doc(incidentId);
    const doc = await incidentRef.get();

    if (!doc.exists) {
      return false;
    }
    await incidentRef.delete();
    return true;
  }
}
