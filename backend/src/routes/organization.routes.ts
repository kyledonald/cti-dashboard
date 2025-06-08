// backend/src/routes/organization.routes.ts
import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore'; // Import Firestore type
import { OrganizationController } from '../controllers/organization.controller';
import { OrganizationService } from '../services/organization.service';

// Change: Make this a function that returns a configured router
// It will receive the db instance as an argument.
export const organizationRouter = (db: Firestore) => {
  const router = Router();
  const organizationService = new OrganizationService(db); // Instantiate service with db
  const organizationController = new OrganizationController(
    organizationService,
  ); // Instantiate controller with service

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

  return router; // Return the configured router
};
