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

  // Create organization - Any authenticated user (including unassigned for onboarding)
  router.post('/', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    organizationController.createOrganization(req, res),
  );
  
  // Get all organizations - Any authenticated user (including unassigned)
  router.get('/', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    organizationController.getAllOrganizations(req, res),
  );
  
  // Get organization by ID - Any authenticated user (including unassigned)
  router.get('/:organizationId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    organizationController.getOrganizationById(req, res),
  );
  
  // Update organization - Admin only
  router.put('/:organizationId', requireAdmin, (req: AuthenticatedRequest, res) =>
    organizationController.updateOrganization(req, res),
  );
  
  // Delete organization - Admin only (as mentioned by user)
  router.delete('/:organizationId', requireAdmin, (req: AuthenticatedRequest, res) =>
    organizationController.deleteOrganization(req, res),
  );

  return router;
};
