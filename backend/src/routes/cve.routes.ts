import { Router } from 'express';
import { CVEService } from '../services/cve.service';
import { CVEController } from '../controllers/cve.controller';

export const cveRouter = () => {
  const router = Router();
  const cveService = new CVEService();
  const cveController = new CVEController(cveService);

  router.get('/latest', (req, res) => cveController.getLatestCVEs(req, res));
  router.get('/latest/filtered', (req, res) => cveController.getLatestCVEsFiltered(req, res));
  router.get('/:cveId', (req, res) => cveController.getCVEById(req, res));

  return router;
};
