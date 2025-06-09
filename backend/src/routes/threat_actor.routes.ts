import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { ThreatActorController } from '../controllers/threat_actor.controller';
import { ThreatActorService } from '../services/threat_actor.service';

export const threatActorRouter = (db: Firestore) => {
  const router = Router();
  const threatActorService = new ThreatActorService(db);
  const threatActorController = new ThreatActorController(threatActorService);

  router.post('/', (req, res) =>
    threatActorController.createThreatActor(req, res),
  );
  router.get('/', (req, res) =>
    threatActorController.getAllThreatActors(req, res),
  );
  router.get('/:threatActorId', (req, res) =>
    threatActorController.getThreatActorById(req, res),
  );
  router.put('/:threatActorId', (req, res) =>
    threatActorController.updateThreatActor(req, res),
  );
  router.delete('/:threatActorId', (req, res) =>
    threatActorController.deleteThreatActor(req, res),
  );

  return router;
};
