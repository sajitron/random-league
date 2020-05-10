import { Router } from 'express';
import UserRouter from './Users';
import TeamRouter from './Teams';
import FixtureRouter from './Fixture';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/teams', TeamRouter);
router.use('/fixtures', FixtureRouter);

// Export the base-router
export default router;
