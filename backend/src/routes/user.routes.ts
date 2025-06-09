import { Router } from 'express';
import { Firestore } from '@google-cloud/firestore';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';

export const userRouter = (db: Firestore) => {
  const router = Router();
  const userService = new UserService(db);
  const userController = new UserController(userService);

  router.post('/', (req, res) => userController.createUser(req, res));
  router.get('/', (req, res) => userController.getAllUsers(req, res));
  router.get('/:userId', (req, res) => userController.getUserById(req, res));
  router.put('/:userId', (req, res) => userController.updateUser(req, res));
  router.delete('/:userId', (req, res) => userController.deleteUser(req, res));

  return router;
};
