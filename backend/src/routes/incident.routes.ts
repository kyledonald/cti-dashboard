import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { IncidentController } from '../controllers/incident.controller';
import { IncidentService } from '../services/incident.service';
import { CVEService } from '../services/cve.service'; 

export const incidentRouter = (db: Firestore) => {
  const router = Router();
  const incidentService = new IncidentService(db);
  const cveService = new CVEService(); 
  const incidentController = new IncidentController(incidentService, cveService);

  router.post('/', (req, res) => incidentController.createIncident(req, res));
  router.get('/', (req, res) => incidentController.getAllIncidents(req, res));
  router.get('/:incidentId', (req, res) => incidentController.getIncidentById(req, res));
  router.put('/:incidentId', (req, res) => incidentController.updateIncident(req, res));
  router.delete('/:incidentId', (req, res) => incidentController.deleteIncident(req, res));
  
  // Comment routes
  router.post('/:incidentId/comments', (req, res) => incidentController.addComment(req, res));
  router.delete('/:incidentId/comments/:commentId', (req, res) => incidentController.deleteComment(req, res));

  return router;
};
