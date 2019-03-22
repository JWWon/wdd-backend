import env from '../lib/env';
import log from '../lib/log';
import { createServer } from '../lib/server';

const server = createServer();

// HTTP
server.listen(env.PORT, () => {
  log.debug(`Server listening on ${env.PORT} in ${env.NODE_ENV} mode`);
});
