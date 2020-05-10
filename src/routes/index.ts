import { Router } from 'express';
import UserRouter from './Users';
import TeamRouter from './Teams';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/users', UserRouter);
router.use('/teams', TeamRouter);

// Export the base-router
export default router;
