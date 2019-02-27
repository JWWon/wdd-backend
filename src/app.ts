import Koa from 'koa';
import cors from '@koa/cors';
import compress from 'koa-compress';
import respond from 'koa-respond';
import bodyParser from 'koa-bodyparser';

import log from './lib/log';
import { errorHandler } from './middleware/error-handler';

export interface Context extends Koa.Context {
  send: (status: number, payload: string | object) => void;
  ok: (payload: string | object) => void; // 200
  created: (payload: string | object) => void; // 201
  noContent: (payload: string | object) => void; // 204
  badRequest: (payload: string | object) => void; // 400
  unauthorized: (payload: string | object) => void; // 401
  forbidden: (payload: string | object) => void; // 403
  notFound: (payload: string | object) => void; // 404
  locked: (payload: string | object) => void; // 423
  internalServerError: (payload: string | object) => void; // 500
  notImplemented: (payload: string | object) => void; // 501
}

export async function createServer() {
  const app: Koa = new Koa();

  app
    .use(errorHandler)
    .use(compress())
    .use(respond())
    .use(cors())
    .use(bodyParser());

  // Initial route
  app.use(async (ctx: Context) => {
    ctx.body = 'Hello world';
  });

  // Application error logging.
  app.on('error', console.error);

  log.debug('Server created, ready to listen', { scope: 'startup' });
  return app;
}
