import { Request, Response } from 'express';
import { IncidentService } from '../services/incident.service';
import { CreateIncidentDTO, UpdateIncidentDTO } from '../models/incident.model';

export class IncidentController {
  private service: IncidentService;

  constructor(service: IncidentService) {
    this.service = service;
  }

  async createIncident(req: Request, res: Response) {
    try {
      const incidentData: CreateIncidentDTO = req.body;

      // Basic validation (can expand with Zod/Joi later)
      if (
        !incidentData.title ||
        !incidentData.description ||
        !incidentData.status ||
        !incidentData.priority ||
        !incidentData.reportedByUserId ||
        !incidentData.reportedByUserName ||
        !incidentData.organizationId
      ) {
        return res
          .status(400)
          .json({ error: 'Missing required incident fields.' });
      }
      // TODO: Add authorization: Users can only create incidents for their own organization
      const newIncident = await this.service.createIncident(incidentData);
      res
        .status(201)
        .json({
          message: 'Incident created successfully',
          incident: newIncident,
        });
    } catch (error: any) {
      console.error('Error in createIncident controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to create incident', details: error.message });
    }
  }

  async getAllIncidents(req: Request, res: Response) {
    try {
      const { organizationId } = req.query; // Optional: filter by organization
      // TODO: Add authorization: Users can only see incidents from their own organization or admins can see all.
      const incidents = await this.service.getAllIncidents(
        organizationId as string,
      );
      res.status(200).json({ incidents: incidents });
    } catch (error: any) {
      console.error('Error in getAllIncidents controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch incidents', details: error.message });
    }
  }

  async getIncidentById(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      // TODO: Add authorization: Users can only view incidents from their own organization or if they are assigned.
      const incident = await this.service.getIncidentById(incidentId);

      if (!incident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }
      res.status(200).json({ incident: incident });
    } catch (error: any) {
      console.error('Error in getIncidentById controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to fetch incident', details: error.message });
    }
  }

  async updateIncident(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const updateData: UpdateIncidentDTO = req.body;
      // TODO: Add authorization: Users can only update incidents in their org/assigned to them/if admin
      const updated = await this.service.updateIncident(incidentId, updateData);

      if (!updated) {
        return res.status(404).json({ error: 'Incident not found.' });
      }
      res.status(200).json({ message: 'Incident updated successfully' });
    } catch (error: any) {
      console.error('Error in updateIncident controller:', error);
      res
        .status(500)
        .json({ error: 'Failed to update incident', details: error.message });
    }
  }

  async deleteIncident(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      // TODO: Add authorization: Only admins can delete incidents
      const deleted = await this.service.deleteIncident(incidentId);

      if (!deleted) {
        return res.status(404).json({ error: 'Incident not found.' });
      }
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting incident:', error);
      res
        .status(500)
        .json({ error: 'Failed to delete incident', details: error.message });
    }
  }
}
