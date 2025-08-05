import { Request, Response } from 'express';
import { ThreatActorService } from '../services/threat_actor.service';
import {
  CreateThreatActorDTO,
  UpdateThreatActorDTO,
} from '../models/threat_actor.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ThreatActorController {
  private service: ThreatActorService;

  constructor(service: ThreatActorService) {
    this.service = service;
  }

  async createThreatActor(req: Request, res: Response) {
    try {
      const actorData: CreateThreatActorDTO = req.body;

      if (!actorData.name) {
        return res
          .status(400)
          .json({ error: 'Threat actor name is required.' });
      }
  
      const newActor = await this.service.createThreatActor(actorData);
      res.status(201).json({
        message: 'Threat actor created successfully',
        threatActor: newActor,
      });
    } catch (error: any) {
      console.error('Error in createThreatActor controller:', error);
      res.status(500).json({
        error: 'Failed to create threat actor',
        details: error.message,
      });
    }
  }

  async getAllThreatActors(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Enforce organization isolation - users can only see threat actors from their organization
      const userOrganizationId = req.user.organizationId;
      
      // Get all threat actors and filter by organization
      const allActors = await this.service.getAllThreatActors();
      const filteredActors = allActors.filter(actor => actor.organizationId === userOrganizationId);
      
      res.status(200).json({ threatActors: filteredActors });
    } catch (error: any) {
      console.error('Error in getAllThreatActors controller:', error);
      res.status(500).json({
        error: 'Failed to fetch threat actors',
        details: error.message,
      });
    }
  }

  async getThreatActorById(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { threatActorId } = req.params;
      const actor = await this.service.getThreatActorById(threatActorId);

      if (!actor) {
        return res.status(404).json({ error: 'Threat actor not found.' });
      }

      // Enforce organization isolation - users can only see threat actors from their organization
      if (actor.organizationId !== req.user.organizationId) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You can only view threat actors from your own organization' 
        });
      }

      res.status(200).json({ threatActor: actor });
    } catch (error: any) {
      console.error('Error in getThreatActorById controller:', error);
      res.status(500).json({
        error: 'Failed to fetch threat actor',
        details: error.message,
      });
    }
  }

  async updateThreatActor(req: Request, res: Response) {
    try {
      const { threatActorId } = req.params;
      const updateData: UpdateThreatActorDTO = req.body;
  
      const updated = await this.service.updateThreatActor(
        threatActorId,
        updateData,
      );

      if (!updated) {
        return res.status(404).json({ error: 'Threat actor not found.' });
      }
      res.status(200).json({ message: 'Threat actor updated successfully' });
    } catch (error: any) {
      console.error('Error in updateThreatActor controller:', error);
      res.status(500).json({
        error: 'Failed to update threat actor',
        details: error.message,
      });
    }
  }

  async deleteThreatActor(req: Request, res: Response) {
    try {
      const { threatActorId } = req.params;
  
      const deleted = await this.service.deleteThreatActor(threatActorId);

      if (!deleted) {
        return res.status(404).json({ error: 'Threat actor not found.' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting threat actor:', error);
      res.status(500).json({
        error: 'Failed to delete threat actor',
        details: error.message,
      });
    }
  }
}
