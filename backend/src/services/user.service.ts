// backend/src/services/user.service.ts
import { Firestore, FieldValue } from '@google-cloud/firestore';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user.model';

export class UserService {
  private db: Firestore;
  private collection: FirebaseFirestore.CollectionReference;

  constructor(db: Firestore) {
    this.db = db;
    this.collection = db.collection('users');
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    const userRef = this.collection.doc();
    const userId = userRef.id;

    const newUser: User = {
      userId: userId,
      googleId: userData.googleId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profilePictureUrl: userData.profilePictureUrl,
      role: userData.role,
      organizationId: userData.organizationId,
      status: 'active', // Default status for new users
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(), // Set on creation, updated on login
      updatedAt: FieldValue.serverTimestamp(),
    };

    await userRef.set(newUser);
    return newUser;
  }

  async getAllUsers(organizationId?: string): Promise<User[]> {
    let query: FirebaseFirestore.Query = this.collection;
    if (organizationId) {
      // If organizationId is provided, filter users by organization
      query = query.where('organizationId', '==', organizationId);
    }
    const snapshot = await query.orderBy('lastName').get();
    const users: User[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as User);
    });
    return users;
  }

  async getUserById(userId: string): Promise<User | null> {
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) {
      return null;
    }
    return doc.data() as User;
  }

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('googleId', '==', googleId)
      .limit(1)
      .get();
    if (snapshot.empty) {
      return null;
    }
    return snapshot.docs[0].data() as User;
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserDTO,
  ): Promise<boolean> {
    const userRef = this.collection.doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return false;
    }

    const dataToUpdate: any = { updatedAt: FieldValue.serverTimestamp() };
    if (updateData.firstName !== undefined)
      dataToUpdate.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      dataToUpdate.lastName = updateData.lastName;
    if (updateData.profilePictureUrl !== undefined)
      dataToUpdate.profilePictureUrl = updateData.profilePictureUrl;
    if (updateData.role !== undefined) dataToUpdate.role = updateData.role;
    if (updateData.organizationId !== undefined)
      dataToUpdate.organizationId = updateData.organizationId;
    if (updateData.status !== undefined)
      dataToUpdate.status = updateData.status;

    await userRef.update(dataToUpdate);
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const userRef = this.collection.doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return false;
    }
    // TODO: Add a check if user has active incidents or is an org admin before deleting
    await userRef.delete();
    return true;
  }
}
