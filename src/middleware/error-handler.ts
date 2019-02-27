import log from '../lib/log';
import { Context } from '../app';
import env from '../lib/env';

export async function errorHandler(ctx: Context, next: any) {
  try {
    await next();
  } catch (e) {
    ctx.status = e.statusCode || 500;
    ctx.body = e.toJSON ? e.toJSON() : { message: e.message, ...e };
    if (!env.EMIT_STACK_TRACE) delete ctx.body.stack;
    log.error('Error in request', e);
  }
}
