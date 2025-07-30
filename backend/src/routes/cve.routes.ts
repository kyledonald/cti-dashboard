import { Router } from 'express';
import { CVEController } from '../controllers/cve.controller';
import { CVEService } from '../services/cve.service';
import { requireAnyRole, AuthenticatedRequest } from '../middleware/auth.middleware';

export const cveRouter = () => {
  const router = Router();
  const cveService = new CVEService();
  const cveController = new CVEController(cveService);

  // Get latest CVEs - Any authenticated user (CVE data is typically public information)
  router.get('/latest', requireAnyRole, (req: AuthenticatedRequest, res) =>
    cveController.getLatestCVEs(req, res),
  );
  
  // Get latest CVEs filtered - Any authenticated user
  router.get('/latest/filtered', requireAnyRole, (req: AuthenticatedRequest, res) =>
    cveController.getLatestCVEsFiltered(req, res),
  );
  
  // Get CVE by ID - Any authenticated user
  router.get('/:cveId', requireAnyRole, (req: AuthenticatedRequest, res) =>
    cveController.getCVEById(req, res),
  );

  return router;
};
