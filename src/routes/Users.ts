import { Request, Response, Router } from 'express';
import { OK } from 'http-status-codes';
import * as UserController from '../controllers/UserController';
import Utils from '../utils/utils';
import { authUser } from '../middleware/Auth';
import { rateLimiter } from '../middleware/RedisUtils';

const router = Router();

router.get('/test', (req: Request, res: Response) => {
  res.status(OK).send('We Work!');
});

router.post('/', Utils.uploads, UserController.newUser);
router.post('/login', UserController.authUser);
router.get('/:id', authUser, rateLimiter, UserController.getUser);
router.get('/', authUser, rateLimiter, UserController.getAllUsers);
router.put('/:id', authUser, rateLimiter, Utils.uploads, UserController.updateUser);
router.delete('/:id', authUser, rateLimiter, UserController.removeUser);

export default router;
