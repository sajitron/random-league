import { Router } from 'express';
import * as TeamController from '../controllers/TeamController';
import Utils from '../utils/utils';
import { authUser, authAdmin } from '../middleware/Auth';
import { rateLimiter } from '../middleware/RedisUtils';

const router = Router();

router.post('/', authUser, authAdmin, Utils.uploads, TeamController.newTeam);
router.get('/:id', authUser, rateLimiter, TeamController.getTeam);
router.get('/', authUser, rateLimiter, TeamController.getAllTeams);
router.put('/:id', authUser, authAdmin, Utils.uploads, TeamController.updateTeam);
router.delete('/:id', authUser, authAdmin, TeamController.removeTeam);

export default router;
