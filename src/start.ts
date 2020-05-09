import app from './Server';
import { logger } from './config/Logger';

// Start the server
const port = Number(process.env.PORT || 8800);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
