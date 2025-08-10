import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { ThreatActorController } from '../controllers/threat_actor.controller';
import { ThreatActorService } from '../services/threat_actor.service';
import { requireAdmin, requireAdminOrEditor, requireAnyRole, AuthenticatedRequest } from '../middleware/auth.middleware';

export const threatActorRouter = (db: Firestore) => {
  const router = Router();
  const threatActorService = new ThreatActorService(db);
  const threatActorController = new ThreatActorController(threatActorService);

  router.post('/', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    threatActorController.createThreatActor(req, res),
  );
  
  router.get('/', requireAnyRole, (req: AuthenticatedRequest, res) =>
    threatActorController.getAllThreatActors(req, res),
  );
  
  router.get('/:threatActorId', requireAnyRole, (req: AuthenticatedRequest, res) =>
    threatActorController.getThreatActorById(req, res),
  );
  
  router.put('/:threatActorId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    threatActorController.updateThreatActor(req, res),
  );
  
  router.delete('/:threatActorId', requireAdminOrEditor, (req: AuthenticatedRequest, res) =>
    threatActorController.deleteThreatActor(req, res),
  );

  return router;
};
