import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { IncidentController } from '../controllers/incident.controller';
import { IncidentService } from '../services/incident.service';
import { requireAdmin, requireAdminOrEditor, requireAnyRole, AuthenticatedRequest } from '../middleware/auth.middleware';
import { CVEService } from '../services/cve.service';

export const incidentRouter = (db: Firestore) => {
  const router = Router();
  const incidentService = new IncidentService(db);
  const cveService = new CVEService();
  const incidentController = new IncidentController(incidentService, cveService);

  // only admins and editors can create, edit or del INCs
  router.post('/', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    incidentController.createIncident(req, res),
  );
  
  router.get('/', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.getAllIncidents(req, res),
  );
  
  router.get('/:incidentId', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.getIncidentById(req, res),
  );
  
  router.put('/:incidentId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    incidentController.updateIncident(req, res),
  );
  
  router.delete('/:incidentId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    incidentController.deleteIncident(req, res),
  );
  
  router.post('/:incidentId/comments', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.addComment(req, res),
  );
  
  router.delete('/:incidentId/comments/:commentId', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.deleteComment(req, res),
  );

  return router;
};
