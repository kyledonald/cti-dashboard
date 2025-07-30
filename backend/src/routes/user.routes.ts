import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { requireAdmin, requireAdminOrEditor, requireAnyRole, requireAnyAuthenticated, AuthenticatedRequest } from '../middleware/auth.middleware';

export const userRouter = (db: Firestore) => {
  const router = Router();
  const userService = new UserService(db);
  const userController = new UserController(userService);

  // Public user registration endpoint (validates Firebase token but allows user creation)
  router.post('/register', (req: AuthenticatedRequest, res) =>
    userController.registerUser(req, res),
  );
  
  // Create user - Admin only (for admin-created users)
  router.post('/', requireAdmin, (req: AuthenticatedRequest, res) =>
    userController.createUser(req, res),
  );
  
  // Get all users - Any authenticated user (needed for dropdowns, assignments, etc.)
  router.get('/', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.getAllUsers(req, res),
  );
  
  // Get user by ID - Any authenticated user
  router.get('/:userId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.getUserById(req, res),
  );
  
  // Update user - Users can update themselves, admins can update anyone (controller handles logic)
  router.put('/:userId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.updateUser(req, res),
  );
  
  // Delete user - Users can delete themselves, admins can delete anyone (controller handles logic)
  router.delete('/:userId', requireAnyAuthenticated, (req: AuthenticatedRequest, res) =>
    userController.deleteUser(req, res),
  );

  return router;
};
