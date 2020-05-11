import { Request, Response, Router } from 'express';
import UserRouter from './Users';
import TeamRouter from './Teams';
import { search } from '../controllers/TeamController';
import FixtureRouter from './Fixture';
import Utils from '../utils/utils';

// Init router and path
const router = Router();

// Add sub-routes
router.use('/health', (req: Request, res: Response) => {
  const message = 'League Server is up & Running';
  return Utils.successResponse(res, [], message);
});
router.get('/search/:search', search);
router.use('/users', UserRouter);
router.use('/teams', TeamRouter);
router.use('/fixtures', FixtureRouter);

// Export the base-router
export default router;
