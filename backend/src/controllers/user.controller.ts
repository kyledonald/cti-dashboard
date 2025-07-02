import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '../models/user.model';

export class UserController {
  private service: UserService;

  constructor(service: UserService) {
    this.service = service;
  }

  async createUser(req: Request, res: Response) {
    try {
      const userData: CreateUserDTO = req.body;

      if (
        !userData.email ||
        !userData.googleId
      ) {
        return res.status(400).json({ error: 'Missing required user fields: email, googleId.' });
      }

      // TODO: Add more validation for email format, valid role, existing organizationId
      // TODO: Add authentication/authorization: Only admin can create users

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

  async getAllUsers(req: Request, res: Response) {
    try {
      const { organizationId } = req.query; // filter by organization
      // TODO: Add authorization: Users can only see users from their own organization.
      const users = await this.service.getAllUsers(organizationId as string);
      res.status(200).json({ users: users });
    } catch (error: any) {
      console.error('Error in getAllUsers controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch users', details: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      // TODO: Add authorization: Users can only view their own profile, or admins can view any.
      const user = await this.service.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      res.status(200).json({ user: user });
    } catch (error: any) {
      console.error('Error in getUserById controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch user', details: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const updateData: UpdateUserDTO = req.body;
      // TODO: Add authorization: Users can only update their own profile (or admins can update any)
      // TODO: Add input validation for fields being updated

      const updatedUser = await this.service.updateUser(userId, updateData);

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

  async updateLastLogin(req: Request, res: Response) {
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

  async deleteUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      // TODO: Add authorization: Only admins can delete users
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
}
