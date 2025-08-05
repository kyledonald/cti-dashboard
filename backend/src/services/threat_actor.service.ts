import { Firestore, FieldValue } from '@google-cloud/firestore';
import {
  ThreatActor,
  CreateThreatActorDTO,
  UpdateThreatActorDTO,
} from '../models/threat_actor.model';

export class ThreatActorService {
  private db: Firestore;
  private collection: FirebaseFirestore.CollectionReference;

  constructor(db: Firestore) {
    this.db = db;
    this.collection = db.collection('threat_actors');
  }

  async createThreatActor(
    actorData: CreateThreatActorDTO,
  ): Promise<ThreatActor> {
    try {
      const actorRef = this.collection.doc();
      const threatActorId = actorRef.id;

      const newThreatActor: ThreatActor = {
        threatActorId: threatActorId,
        name: actorData.name,
        description: actorData.description ?? null,
        aliases: actorData.aliases ?? [],
        country: actorData.country ?? null,
        firstSeen: actorData.firstSeen ?? null,
        lastSeen: actorData.lastSeen ?? null,
        motivation: actorData.motivation ?? null,
        sophistication: actorData.sophistication ?? 'Unknown',
        resourceLevel: actorData.resourceLevel ?? 'Unknown',
        primaryTargets: actorData.primaryTargets ?? [],
        isActive: actorData.isActive ?? true,
        organizationId: actorData.organizationId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      await actorRef.set(newThreatActor);
      return newThreatActor;
    } catch (error) {
      throw error;
    }
  }

  async getAllThreatActors(): Promise<ThreatActor[]> {
    try {
      const snapshot = await this.collection.orderBy('name').get();
      const actors: ThreatActor[] = [];
      snapshot.forEach((doc) => {
        actors.push(doc.data() as ThreatActor);
      });
      return actors;
    } catch (error) {
      throw error;
    }
  }

  async getThreatActorById(threatActorId: string): Promise<ThreatActor | null> {
    try {
      const doc = await this.collection.doc(threatActorId).get();
      if (!doc.exists) {
        return null;
      }
      return doc.data() as ThreatActor;
    } catch (error) {
      throw error;
    }
  }

  async updateThreatActor(
    threatActorId: string,
    updateData: UpdateThreatActorDTO,
  ): Promise<boolean> {
    try {
      const actorRef = this.collection.doc(threatActorId);
      const doc = await actorRef.get();

      if (!doc.exists) {
        return false;
      }

      const dataToUpdate: any = { updatedAt: FieldValue.serverTimestamp() };
      if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
      if (updateData.description !== undefined)
        dataToUpdate.description = updateData.description;
      if (updateData.aliases !== undefined)
        dataToUpdate.aliases = updateData.aliases;
      if (updateData.country !== undefined)
        dataToUpdate.country = updateData.country;
      if (updateData.firstSeen !== undefined)
        dataToUpdate.firstSeen = updateData.firstSeen;
      if (updateData.lastSeen !== undefined)
        dataToUpdate.lastSeen = updateData.lastSeen;
      if (updateData.motivation !== undefined)
        dataToUpdate.motivation = updateData.motivation;
      if (updateData.sophistication !== undefined)
        dataToUpdate.sophistication = updateData.sophistication;
      if (updateData.resourceLevel !== undefined)
        dataToUpdate.resourceLevel = updateData.resourceLevel;
      if (updateData.primaryTargets !== undefined)
        dataToUpdate.primaryTargets = updateData.primaryTargets;
      if (updateData.isActive !== undefined)
        dataToUpdate.isActive = updateData.isActive;

      await actorRef.update(dataToUpdate);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async deleteThreatActor(threatActorId: string): Promise<boolean> {
    try {
      const actorRef = this.collection.doc(threatActorId);
      const doc = await actorRef.get();

      if (!doc.exists) {
        return false;
      }
      await actorRef.delete();
      return true;
    } catch (error) {
      throw error;
    }
  }
}
