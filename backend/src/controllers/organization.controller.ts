import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service';
import {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
} from '../models/organization.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class OrganizationController {
  private service: OrganizationService;

  constructor(service: OrganizationService) {
    this.service = service;
  }

  async createOrganization(req: Request, res: Response) {
    try {
      const orgData: CreateOrganizationDTO = req.body;

      if (!orgData.name) {
        return res
          .status(400)
          .json({ error: 'Organization name is required.' });
      }

      const newOrganization = await this.service.createOrganization(orgData);
      res.status(201).json({
        message: 'Organization created successfully',
        organization: newOrganization,
      });
    } catch (error: any) {
      console.error('Error in createOrganization controller:', error);
      res.status(500).json({
        error: 'Failed to create organization',
        details: error.message,
      });
    }
  }

  async getAllOrganizations(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Enforce organization isolation - users can only see their own organization
      const userOrganizationId = req.user.organizationId;
      
      // Get all organizations and filter to only return the user's organization
      const allOrganizations = await this.service.getAllOrganizations();
      const userOrganization = allOrganizations.find(org => org.organizationId === userOrganizationId);
      
      if (!userOrganization) {
        return res.status(404).json({ error: 'Your organization not found.' });
      }
      
      res.status(200).json({ organizations: [userOrganization] });
    } catch (error: any) {
      console.error('Error in getAllOrganizations controller:', error);
      res.status(500).json({
        error: 'Failed to fetch organizations',
        details: error.message,
      });
    }
  }

  async getOrganizationById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { organizationId } = req.params;
      const organization =
        await this.service.getOrganizationById(organizationId);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found.' });
      }

      // Enforce organization isolation - users can only see their own organization
      if (organization.organizationId !== req.user.organizationId) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only view your own organization' 
        });
      }

      res.status(200).json({ organization: organization });
    } catch (error: any) {
      console.error('Error in getOrganizationById controller:', error);
      res.status(500).json({
        error: 'Failed to fetch organization',
        details: error.message,
      });
    }
  }

  async updateOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { organizationId } = req.params;
      const updateData: UpdateOrganizationDTO = req.body;

      // Enforce organization isolation - users can only update their own organization
      if (organizationId !== req.user.organizationId) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only update your own organization' 
        });
      }

      const updated = await this.service.updateOrganization(
        organizationId,
        updateData,
      );

      if (!updated) {
        return res.status(404).json({ error: 'Organization not found.' });
      }
      res.status(200).json({ message: 'Organization updated successfully' });
    } catch (error: any) {
      console.error('Error in updateOrganization controller:', error);
      res.status(500).json({
        error: 'Failed to update organization',
        details: error.message,
      });
    }
  }

  async deleteOrganization(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { organizationId } = req.params;

      // Enforce organization isolation - users can only delete their own organization
      if (organizationId !== req.user.organizationId) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only delete your own organization' 
        });
      }

      const deleted = await this.service.deleteOrganization(organizationId);

      if (!deleted) {
        return res.status(404).json({ error: 'Organization not found.' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error in deleteOrganization controller:', error);
      res.status(500).json({
        error: 'Failed to delete organization',
        details: error.message,
      });
    }
  }
}
