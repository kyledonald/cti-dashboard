import { Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import * as admin from 'firebase-admin';

export class UserController {
  private service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  async createUser(req: AuthenticatedRequest, res: Response) {
    try {
      const userData: CreateUserDTO = req.body;
  
      if (
        !userData.email ||
        !userData.googleId
      ) {
        return res.status(400).json({ error: 'Missing required user fields: email, googleId.' });
      }
  
      const newUser = await this.service.createUser(userData);
      res
        .status(201)
        .json({ message: 'User created successfully', user: newUser });
    } catch (error: any) {
      console.error('Error in createUser controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to create user', details: error.message });
    }
  }

  async registerUser(req: AuthenticatedRequest, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'No valid authorization header found'
        });
      }

      const tokenParts = authHeader.split('Bearer ');
      if (tokenParts.length !== 2 || !tokenParts[1]) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'Invalid authorization header format'
        });
      }
      const idToken = tokenParts[1];

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Check if user already exists
      const existingUsers = await this.service.getAllUsers();
      const existingUser = existingUsers.find(u => u.googleId === decodedToken.uid);
      
      if (existingUser) {
        return res.status(200).json({ user: existingUser });
      }

      const userData: CreateUserDTO = {
        googleId: decodedToken.uid,
        email: decodedToken.email!,
        firstName: req.body.firstName || 
          (decodedToken.name ? decodedToken.name.split(' ')[0] : '') || 
          (decodedToken.email ? decodedToken.email.split('@')[0] : 'User'),
        lastName: req.body.lastName || 
          (decodedToken.name ? decodedToken.name.split(' ').slice(1).join(' ') : ''),
        profilePictureUrl: decodedToken.picture || '',
        role: 'unassigned',
        organizationId: ''
      };

      const newUser = await this.service.createUser(userData);
      res.status(201).json({ 
        message: 'User registered successfully', 
        user: newUser 
      });
    } catch (error: any) {
      console.error('Error in registerUser controller:', error);
      res.status(500).json({ 
        error: 'Failed to register user', 
        details: error.message 
      });
    }
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (req.user.role === 'unassigned') {
        const currentUser = await this.service.getUserById(req.user.userId);
        if (!currentUser) {
          return res.status(404).json({ error: 'User not found.' });
        }
        return res.status(200).json({ users: [currentUser] });
      }

      const userOrganizationId = req.user.organizationId;
      
      const users = await this.service.getAllUsers(userOrganizationId);
      res.status(200).json({ users: users });
    } catch (error: any) {
      console.error('Error in getAllUsers controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch users', details: error.message });
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { userId } = req.params;
      const user = await this.service.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (req.user.role === 'unassigned') {
        if (user.userId !== req.user.userId) {
          return res.status(403).json({ 
            error: 'Access denied', 
            message: 'Unassigned users can only view their own profile' 
          });
        }
        return res.status(200).json({ user: user });
      }

      if (user.organizationId !== req.user.organizationId) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only view users from your own organization' 
        });
      }

      res.status(200).json({ user: user });
    } catch (error: any) {
      console.error('Error in getUserById controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch user', details: error.message });
    }
  }

  async getUserByEmail(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { email } = req.params;
      const user = await this.service.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Only admins can search for users by email'
        });
      }

      if (user.organizationId && user.organizationId.trim() !== '') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'User is already assigned to an organization'
        });
      }

      res.status(200).json({ user: user });
    } catch (error: any) {
      console.error('Error in getUserByEmail controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch user', details: error.message });
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      const updateData: UpdateUserDTO = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
      const isUpdatingSelf = req.user.userId === userId;
      const isAdmin = req.user.role === 'admin';
  
      if (!isUpdatingSelf && !isAdmin) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          message: 'You can only update your own profile unless you are an admin' 
        });
      }
  
      let allowedFields: (keyof UpdateUserDTO)[];
      if (isAdmin) {
        allowedFields = ['firstName', 'lastName', 'profilePictureUrl', 'role', 'organizationId', 'status'];
      } else if (isUpdatingSelf && req.user.role === 'unassigned') {
        allowedFields = ['firstName', 'lastName', 'profilePictureUrl', 'role', 'organizationId'];
      } else {
        allowedFields = ['firstName', 'lastName', 'profilePictureUrl'];
      }
  
      const filteredUpdateData: UpdateUserDTO = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          (filteredUpdateData as any)[field] = updateData[field];
        }
      }
  
      if (Object.keys(filteredUpdateData).length === 0) {
        return res.status(400).json({ 
          error: 'No valid fields to update', 
          allowedFields: allowedFields 
        });
      }
  
      const updatedUser = await this.service.updateUser(userId, filteredUpdateData);
  
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error('Error in updateUser controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to update user', details: error.message });
    }
  }

  async updateLastLogin(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;

      const updatedUser = await this.service.updateLastLogin(userId);

      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.status(200).json(updatedUser);
    } catch (error: any) {
      console.error('Error in updateLastLogin controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to update last login', details: error.message });
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }
  
      const isDeletingSelf = req.user.userId === userId;
      const isAdmin = req.user.role === 'admin';
  
      if (!isDeletingSelf && !isAdmin) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          message: 'You can only delete your own account unless you are an admin' 
        });
      }
  
      const deleted = await this.service.deleteUser(userId);
  
      if (!deleted) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error in deleteUser controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to delete user', details: error.message });
    }
  }

  async leaveOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      const { userId } = req.params;
      
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const isLeavingSelf = req.user.userId === userId;
      if (!isLeavingSelf) {
        return res.status(403).json({ 
          error: 'Insufficient permissions', 
          message: 'You can only leave your own organization' 
        });
      }

      const updatedUser = await this.service.leaveOrganization(userId);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found.' });
      }
      
      res.status(200).json({ 
        message: 'Successfully left organization', 
        user: updatedUser 
      });
    } catch (error: any) {
      console.error('Error in leaveOrganization controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to leave organization', details: error.message });
    }
  }
}
