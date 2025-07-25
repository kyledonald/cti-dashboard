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
      attackPatterns: actorData.attackPatterns ?? [],
      tools: actorData.tools ?? [],
      malwareFamilies: actorData.malwareFamilies ?? [],
      isActive: actorData.isActive ?? true,
      organizationId: actorData.organizationId,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await actorRef.set(newThreatActor);
    return newThreatActor;
  }

  async getAllThreatActors(): Promise<ThreatActor[]> {
    const snapshot = await this.collection.orderBy('name').get();
    const actors: ThreatActor[] = [];
    snapshot.forEach((doc) => {
      actors.push(doc.data() as ThreatActor);
    });
    return actors;
  }

  async getThreatActorById(threatActorId: string): Promise<ThreatActor | null> {
    const doc = await this.collection.doc(threatActorId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as ThreatActor;
  }

  async updateThreatActor(
    threatActorId: string,
    updateData: UpdateThreatActorDTO,
  ): Promise<boolean> {
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
    if (updateData.attackPatterns !== undefined)
      dataToUpdate.attackPatterns = updateData.attackPatterns;
    if (updateData.tools !== undefined)
      dataToUpdate.tools = updateData.tools;
    if (updateData.malwareFamilies !== undefined)
      dataToUpdate.malwareFamilies = updateData.malwareFamilies;
    if (updateData.isActive !== undefined)
      dataToUpdate.isActive = updateData.isActive;

    await actorRef.update(dataToUpdate);
    return true;
  }

  async deleteThreatActor(threatActorId: string): Promise<boolean> {
    const actorRef = this.collection.doc(threatActorId);
    const doc = await actorRef.get();

    if (!doc.exists) {
      return false;
    }
    await actorRef.delete();
    return true;
  }
}
