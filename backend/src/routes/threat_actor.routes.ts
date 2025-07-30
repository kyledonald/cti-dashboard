import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { ThreatActorController } from '../controllers/threat_actor.controller';
import { ThreatActorService } from '../services/threat_actor.service';
import { requireAdmin, requireAdminOrEditor, requireAnyRole, AuthenticatedRequest } from '../middleware/auth.middleware';

export const threatActorRouter = (db: Firestore) => {
  const router = Router();
  const threatActorService = new ThreatActorService(db);
  const threatActorController = new ThreatActorController(threatActorService);

  // Create threat actor - Admin or Editor only
  router.post('/', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    threatActorController.createThreatActor(req, res),
  );
  
  // Get all threat actors - Any authenticated user
  router.get('/', requireAnyRole, (req: AuthenticatedRequest, res) =>
    threatActorController.getAllThreatActors(req, res),
  );
  
  // Get threat actor by ID - Any authenticated user
  router.get('/:threatActorId', requireAnyRole, (req: AuthenticatedRequest, res) =>
    threatActorController.getThreatActorById(req, res),
  );
  
  // Update threat actor - Admin or Editor only
  router.put('/:threatActorId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    threatActorController.updateThreatActor(req, res),
  );
  
  // Delete threat actor - Admin or Editor
  router.delete('/:threatActorId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    threatActorController.deleteThreatActor(req, res),
  );

  return router;
};
