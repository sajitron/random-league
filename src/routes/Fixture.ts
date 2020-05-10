import { Router } from 'express';
import * as FixtureController from '../controllers/FixtureController';
import { authUser, authAdmin } from '../middleware/Auth';

const router = Router();

router.post('/', authUser, authAdmin, FixtureController.newFixture);
router.get('/link/*', authUser, FixtureController.getFixtureByLink);
router.get('/', authUser, FixtureController.getAllFixtures);
router.get('/pending', authUser, FixtureController.getPendingFixtures);
router.get('/completed', authUser, FixtureController.getCompletedFixtures);
router.get('/:id', authUser, FixtureController.getFixture);
router.put('/:id', authUser, authAdmin, FixtureController.updateFixture);
router.delete('/:id', authUser, authAdmin, FixtureController.removeFixture);

export default router;
