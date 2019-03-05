import cors from '@koa/cors';
import { AwilixContainer } from 'awilix';
import { loadControllers, scopePerRequest } from 'awilix-koa';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import compress from 'koa-compress';
import respond from 'koa-respond';
import mongoose from 'mongoose';
import env from '../lib/env';
import { errorHandler } from '../middleware/error-handler';
import { notFoundHandler } from '../middleware/not-found-handler';
import { configureContainer } from './container';
import log from './log';

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

interface AppInterface extends Koa {
  container?: AwilixContainer;
}

export function connectDB() {
  if (env.LOG_LEVEL !== 'off') {
    const mongo = mongoose.connection;
    mongo.once('open', () => {
      log.debug(`Database connected on ${env.DB_URL}`, { scope: 'mongoose' });
    });
    mongo.on('reconnected', () => {
      log.debug(`Database reconnected on ${env.DB_URL}`, { scope: 'mongoose' });
    });
    mongo.on('close', () => {
      log.debug('Database closed', { scope: 'mongoose' });
    });
    mongo.on('error', (error: object) => {
      log.error('Database connection error', error);
    });
  }

  mongoose.connect(`mongodb://${env.DB_URL}/oboon`, {
    autoReconnect: true,
    useNewUrlParser: true,
  });
}

export async function createServer() {
  const app: AppInterface = new Koa();

  connectDB();

  // Create app
  app.container = configureContainer();
  app
    .use(errorHandler)
    .use(compress())
    .use(respond())
    .use(cors())
    .use(bodyParser())
    .use(scopePerRequest(app.container))
    .use(loadControllers('../routes/*.ts', { cwd: __dirname }))
    .use(notFoundHandler);

  log.debug('Server created, ready to listen', { scope: 'startup' });
  return app;
}
