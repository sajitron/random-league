import { Request, Response, Router } from 'express';
import { OK } from 'http-status-codes';

const router = Router();

router.get('/test', (req: Request, res: Response) => {
  res.status(OK).send('We Work!');
});

export default router;
