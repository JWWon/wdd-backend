import env from '../lib/env';
import log from '../lib/log';
import { createServer } from '../lib/server';

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
