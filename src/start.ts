import app from './Server';
import { logger } from './config/Logger';
import { Env } from './config/env';

// Start the server
const port = Env.all().port || 8800;
app.listen(port, () => {
  logger.info('Express server started on port: ' + port);
});
