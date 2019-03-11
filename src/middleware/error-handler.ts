import HttpStatus from 'http-status-codes';
import { Context } from 'koa-respond';
import env from '../lib/env';
import log from '../lib/log';

export async function errorHandler(ctx: Context, next: any) {
  try {
    await next();
  } catch (err) {
    ctx.status =
      err.statusCode || err.status || HttpStatus.INTERNAL_SERVER_ERROR;
    ctx.body = err.toJSON ? err.toJSON() : { message: err.message, ...err };
    if (!env.EMIT_STACK_TRACE) delete ctx.body.stack;
    log.error(err.message, { scope: ctx.status.toString() });
  }
}
