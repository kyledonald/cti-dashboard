import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { IncidentController } from '../controllers/incident.controller';
import { IncidentService } from '../services/incident.service';

export const incidentRouter = (db: Firestore) => {
  const router = Router();
  const incidentService = new IncidentService(db);
  const incidentController = new IncidentController(incidentService);

  router.post('/', (req, res) => incidentController.createIncident(req, res));
  router.get('/', (req, res) => incidentController.getAllIncidents(req, res));
  router.get('/:incidentId', (req, res) =>
    incidentController.getIncidentById(req, res),
  );
  router.put('/:incidentId', (req, res) =>
    incidentController.updateIncident(req, res),
  );
  router.delete('/:incidentId', (req, res) =>
    incidentController.deleteIncident(req, res),
  );

  return router;
};
