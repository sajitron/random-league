import { Router } from 'express';
import * as FixtureController from '../controllers/FixtureController';
import { authUser, authAdmin } from '../middleware/Auth';
import { rateLimiter } from '../middleware/RedisUtils';

const router = Router();

router.post('/', authUser, authAdmin, FixtureController.newFixture);
router.get('/link/*', authUser, rateLimiter, FixtureController.getFixtureByLink);
router.get('/', authUser, rateLimiter, FixtureController.getAllFixtures);
router.get('/pending', authUser, rateLimiter, FixtureController.getPendingFixtures);
router.get('/completed', authUser, rateLimiter, FixtureController.getCompletedFixtures);
router.get('/:id', authUser, rateLimiter, FixtureController.getFixture);
router.put('/:id', authUser, authAdmin, FixtureController.updateFixture);
router.delete('/:id', authUser, authAdmin, FixtureController.removeFixture);

export default router;
