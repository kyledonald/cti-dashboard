import { Request, Response } from 'express';
import { OrganizationService } from '../services/organization.service';
import {
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
} from '../models/organization.model';

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

  async getAllOrganizations(req: Request, res: Response) {
    try {
      const organizations = await this.service.getAllOrganizations();
      res.status(200).json({ organizations: organizations });
    } catch (error: any) {
      console.error('Error in getAllOrganizations controller:', error);
      res.status(500).json({
        error: 'Failed to fetch organizations',
        details: error.message,
      });
    }
  }

  async getOrganizationById(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const organization =
        await this.service.getOrganizationById(organizationId);

      if (!organization) {
        return res.status(404).json({ error: 'Organization not found.' });
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

  async updateOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
      const updateData: UpdateOrganizationDTO = req.body;

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

  async deleteOrganization(req: Request, res: Response) {
    try {
      const { organizationId } = req.params;
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
