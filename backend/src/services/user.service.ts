import { Firestore, FieldValue } from '@google-cloud/firestore';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user.model';
import { Organization } from '../models/organization.model';

export class UserService {
  private db: Firestore;
  private collection: FirebaseFirestore.CollectionReference;
  private organizationsCollection: FirebaseFirestore.CollectionReference;

  constructor(db: Firestore) {
    this.db = db;
    this.collection = db.collection('users');
    this.organizationsCollection = db.collection('organizations');
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    console.log('Creating user with data:', userData);
    const userRef = this.collection.doc();
    const userId = userRef.id;

    // New users are unassigned by default (no org, no access)
    let organizationId = userData.organizationId || '';
    let role = userData.role || 'unassigned';
    
    // All new users start unassigned, regardless of whether they're first or not
    // They will get appropriate roles when they create or join an organization

    const newUser: User = {
      userId: userId,
      googleId: userData.googleId,
      email: userData.email,
      firstName: userData.firstName || 'User',
      lastName: userData.lastName || '',
      profilePictureUrl: userData.profilePictureUrl || '',
      role: role,
      organizationId: organizationId,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    console.log('Created user:', newUser);
    await userRef.set(newUser);
    return newUser;
  }

  async getAllUsers(organizationId?: string): Promise<User[]> {
    try {
      let query: FirebaseFirestore.Query = this.collection;
      if (organizationId) {
        query = query.where('organizationId', '==', organizationId);
      }
      
      // Get all users without ordering for now (we'll sort on frontend)
      const snapshot = await query.get();
      
      const users: User[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as User);
      });
      
      // Sort by lastName on the backend
      return users.sort((a, b) => {
        const aLastName = a.lastName || '';
        const bLastName = b.lastName || '';
        return aLastName.localeCompare(bLastName);
      });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
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
  ): Promise<User | null> {
    console.log('Updating user:', userId, 'with data:', updateData);
    const userRef = this.collection.doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return null;
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

    console.log('Updating user with dataToUpdate:', dataToUpdate);
    await userRef.update(dataToUpdate);
    
    // Fetch and return the updated user
    const updatedDoc = await userRef.get();
    const updatedUser = updatedDoc.data() as User;
    console.log('Updated user result:', updatedUser);
    return updatedUser;
  }

  async updateLastLogin(userId: string): Promise<User | null> {
    const userRef = this.collection.doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return null;
    }

    await userRef.update({
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
    
    // Fetch and return the updated user
    const updatedDoc = await userRef.get();
    return updatedDoc.data() as User;
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

  // Helper method to get total user count
  async getUserCount(): Promise<number> {
    const snapshot = await this.collection.get();
    return snapshot.size;
  }

  // Method to allow users to leave their organization
  async leaveOrganization(userId: string): Promise<User | null> {
    console.log('User leaving organization:', userId);
    const userRef = this.collection.doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      return null;
    }

    const user = doc.data() as User;
    
    // Only allow non-admin users to leave organization
    if (user.role === 'admin') {
      throw new Error('Admin users cannot leave their organization. Please transfer admin role first.');
    }

    const dataToUpdate = {
      organizationId: '',
      role: 'unassigned',
      updatedAt: FieldValue.serverTimestamp()
    };

    console.log('Updating user to leave organization:', dataToUpdate);
    await userRef.update(dataToUpdate);
    
    // Fetch and return the updated user
    const updatedDoc = await userRef.get();
    const updatedUser = updatedDoc.data() as User;
    console.log('User left organization result:', updatedUser);
    return updatedUser;
  }

}
