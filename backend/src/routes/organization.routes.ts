import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { OrganizationController } from '../controllers/organization.controller';
import { OrganizationService } from '../services/organization.service';

export const organizationRouter = (db: Firestore) => {
  const router = Router();
  const organizationService = new OrganizationService(db);
  const organizationController = new OrganizationController(
    organizationService,
  );

  router.post('/', (req, res) =>
    organizationController.createOrganization(req, res),
  );
  router.get('/', (req, res) =>
    organizationController.getAllOrganizations(req, res),
  );
  router.get('/:organizationId', (req, res) =>
    organizationController.getOrganizationById(req, res),
  );
  router.put('/:organizationId', (req, res) =>
    organizationController.updateOrganization(req, res),
  );
  router.delete('/:organizationId', (req, res) =>
    organizationController.deleteOrganization(req, res),
  );

  return router;
};
