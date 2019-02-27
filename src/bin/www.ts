import { createServer } from '../lib/server';
import log from '../lib/log';
import env from '../lib/env';

createServer().then(
  app =>
    app.listen(env.PORT, () => {
      log.debug(`Server listening on ${env.PORT} in ${env.NODE_ENV} mode`);
    }),
  (e: any) => {
    log.error('Error while starting up server', e);
    process.exit(1);
  }
);
