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
    const userRef = this.collection.doc();
    const userId = userRef.id;

    // New users are unassigned by default (no org, no access)
    let organizationId = userData.organizationId || '';
    let role = userData.role || 'unassigned';
    
    // Special case: If this is the very first user in the system, make them admin
    if (!userData.role && !userData.organizationId) {
      const userCount = await this.getUserCount();
      if (userCount === 0) {
        role = 'admin';
        // First admin user gets assigned to default org for management purposes
        organizationId = await this.getOrCreateDefaultOrganization();
      }
    }

    const newUser: User = {
      userId: userId,
      googleId: userData.googleId,
      email: userData.email,
      firstName: userData.firstName || userData.email.split('@')[0] || 'User',
      lastName: userData.lastName || '',
      profilePictureUrl: userData.profilePictureUrl || '',
      role: role,
      organizationId: organizationId,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

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

    await userRef.update(dataToUpdate);
    
    // Fetch and return the updated user
    const updatedDoc = await userRef.get();
    return updatedDoc.data() as User;
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

  // Helper method to get or create default organization
  async getOrCreateDefaultOrganization(): Promise<string> {
    const DEFAULT_ORG_NAME = 'Default Organization';
    
    // Try to find existing default organization
    const snapshot = await this.organizationsCollection
      .where('name', '==', DEFAULT_ORG_NAME)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      return snapshot.docs[0].id;
    }

    // Create default organization if it doesn't exist
    const orgRef = this.organizationsCollection.doc();
    const defaultOrg: Organization = {
      organizationId: orgRef.id,
      name: DEFAULT_ORG_NAME,
      description: 'Default organization for new users',
      status: 'active',
      nationality: 'Mixed',
      industry: 'General',
      usedSoftware: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await orgRef.set(defaultOrg);
    return orgRef.id;
  }
}
