import HttpStatus from 'http-status-codes';

import log from '../lib/log';
import { Context } from '../lib/server';
import env from '../lib/env';

export async function errorHandler(ctx: Context, next: any) {
  try {
    await next();
  } catch (e) {
    ctx.status = e.statusCode || e.status || HttpStatus.INTERNAL_SERVER_ERROR;
    ctx.body = e.toJSON ? e.toJSON() : { message: e.message, ...e };
    if (!env.EMIT_STACK_TRACE) delete ctx.body.stack;
    log.error('Error in request', e);
  }
}
