import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { requireAdmin, requireAdminOrEditor, requireAnyRole, requireAnyAuthenticated, AuthenticatedRequest } from '../middleware/auth.middleware';

export const userRouter = (db: Firestore) => {
  const router = Router();
  const userService = new UserService(db);
  const userController = new UserController(userService);

  router.post('/register', (req: AuthenticatedRequest, res) =>
    userController.registerUser(req, res),
  );
  
  router.post('/', requireAdmin, (req: AuthenticatedRequest, res) =>
    userController.createUser(req, res),
  );
  
  router.get('/', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.getAllUsers(req, res),
  );
  
  router.get('/email/:email', requireAdmin, (req: AuthenticatedRequest, res) =>
    userController.getUserByEmail(req, res),
  );
  
  router.get('/:userId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.getUserById(req, res),
  );
  
  router.put('/:userId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.updateUser(req, res),
  );
  
  router.delete('/:userId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.deleteUser(req, res),
  );
  
  router.post('/:userId/leave-organization', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.leaveOrganization(req, res),
  );

  return router;
};
