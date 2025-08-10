import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { OrganizationController } from '../controllers/organization.controller';
import { OrganizationService } from '../services/organization.service';
import { requireAdmin, requireAdminOrEditor, requireAnyRole, requireAnyAuthenticated, AuthenticatedRequest } from '../middleware/auth.middleware';

export const organizationRouter = (db: Firestore) => {
  const router = Router();
  const organizationService = new OrganizationService(db);
  const organizationController = new OrganizationController(
    organizationService,
  );

  // anyone can create an org, since new users get auto set to unassigned
  router.post('/', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    organizationController.createOrganization(req, res),
  );
  
  router.get('/', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    organizationController.getAllOrganizations(req, res),
  );
  
  router.get('/:organizationId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    organizationController.getOrganizationById(req, res),
  );
  
  router.put('/:organizationId', requireAdmin, (req: AuthenticatedRequest, res) =>
    organizationController.updateOrganization(req, res),
  );
  
  router.delete('/:organizationId', requireAdmin, (req: AuthenticatedRequest, res) =>
    organizationController.deleteOrganization(req, res),
  );

  return router;
};
