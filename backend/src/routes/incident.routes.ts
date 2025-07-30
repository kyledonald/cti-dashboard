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

  // Create incident - Admin or Editor only
  router.post('/', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    incidentController.createIncident(req, res),
  );
  
  // Get all incidents - Any authenticated user
  router.get('/', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.getAllIncidents(req, res),
  );
  
  // Get incident by ID - Any authenticated user
  router.get('/:incidentId', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.getIncidentById(req, res),
  );
  
  // Update incident - Admin or Editor (for status updates, assignments, etc.)
  router.put('/:incidentId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    incidentController.updateIncident(req, res),
  );
  
  // Delete incident - Admin or Editor
  router.delete('/:incidentId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    incidentController.deleteIncident(req, res),
  );
  
  // Add comment to incident - Any authenticated user
  router.post('/:incidentId/comments', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.addComment(req, res),
  );
  
  // Delete comment from incident - Admin or comment author
  router.delete('/:incidentId/comments/:commentId', requireAnyRole, (req: AuthenticatedRequest, res) =>
    incidentController.deleteComment(req, res),
  );

  return router;
};
