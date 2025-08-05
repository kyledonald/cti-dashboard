import { Request, Response } from 'express';
import { IncidentService } from '../services/incident.service';
import { CreateIncidentDTO, UpdateIncidentDTO, AddCommentDTO } from '../models/incident.model';
import { CVEService } from '../services/cve.service'; 
import { CVEResponse } from '../models/cve.model'; 

export class IncidentController {
  private service: IncidentService;
  private cveService: CVEService;

  constructor(service: IncidentService, cveService: CVEService) {
    this.service = service;
    this.cveService = cveService;
  }

  async createIncident(req: Request, res: Response) {
    try {
      const incidentData: CreateIncidentDTO = req.body;

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
  
      const newIncident = await this.service.createIncident(incidentData);
      res.status(201).json({
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
      const { organizationId } = req.query; // filter by organization
  
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
      const incident = await this.service.getIncidentById(incidentId);

      if (!incident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }

      let cveDetails: CVEResponse[] = [];
      if (incident.cveIds && incident.cveIds.length > 0) {
        const fetchPromises = incident.cveIds.map(id => this.cveService.getCVEById(id));
        const results = await Promise.all(fetchPromises);
        cveDetails = results.filter(cve => cve !== null) as CVEResponse[];
      }

      res.status(200).json({ incident: incident, cveDetails: cveDetails });
    } catch (error: any) {
      console.error('Error in getIncidentById controller:', error);
      res.status(500).json({ error: 'Failed to fetch incident details', details: error.message });
    }
  }

  async updateIncident(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const updateData: UpdateIncidentDTO = req.body;
  
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

  async addComment(req: Request, res: Response) {
    try {
      const { incidentId } = req.params;
      const commentData: AddCommentDTO = req.body;

      if (!commentData.content || !commentData.userId || !commentData.userName) {
        return res.status(400).json({ error: 'Missing required comment fields.' });
      }

  
      const updatedIncident = await this.service.addComment(incidentId, commentData);

      if (!updatedIncident) {
        return res.status(404).json({ error: 'Incident not found.' });
      }

      res.status(201).json({
        message: 'Comment added successfully',
        incident: updatedIncident,
      });
    } catch (error: any) {
      console.error('Error in addComment controller:', error);
      res.status(500).json({ error: 'Failed to add comment', details: error.message });
    }
  }

  async deleteComment(req: Request, res: Response) {
    try {
      const { incidentId, commentId } = req.params;
      const { userId, userRole } = req.body; // In real app, this would come from auth middleware

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
      }

  
      // For now, we'll pass the user info in the request body
      const updatedIncident = await this.service.deleteComment(incidentId, commentId, userId, userRole);

      if (!updatedIncident) {
        return res.status(404).json({ error: 'Incident or comment not found.' });
      }

      res.status(200).json({
        message: 'Comment deleted successfully',
        incident: updatedIncident,
      });
    } catch (error: any) {
      console.error('Error in deleteComment controller:', error);
      if (error.message === 'Unauthorized to delete this comment') {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete comment', details: error.message });
    }
  }
}
