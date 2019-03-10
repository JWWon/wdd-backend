import { Forbidden, NotAcceptable } from 'fejl';
import jwt from 'jsonwebtoken';
import { Context } from 'koa-respond';
import { Schema } from 'mongoose';
import env from '../lib/env';
import log from '../lib/log';
import User from '../models/user';

export const tokenToUser = async (ctx: Context, next: any) => {
  try {
    const headers = ctx.request.headers;
    const token = headers && headers.authorization;
    if (token) {
      const { _id } = jwt.verify(token, env.SECRET) as {
        _id: Schema.Types.ObjectId;
        email: string;
      };
      ctx.user = await User.findById(_id);

      Forbidden.assert(ctx.user, '유효하지 않은 토큰입니다.');
      NotAcceptable.assert(
        ctx.user.status === 'ACTIVE',
        '계정이 휴면상태입니다.'
      );
    } else {
      ctx.user = undefined;
    }
    await next();
  } catch (err) {
    /* istanbul ignore next */
    ctx.status = err.statusCode || 500;
    /* istanbul ignore next */
    ctx.body = err.toJSON ? err.toJSON() : { message: err.message, ...err };
    /* istanbul ignore next */
    if (!env.EMIT_STACK_TRACE) {
      delete ctx.body.stack;
    }
    log.error(`[status ${ctx.status}] ${err.message}`, {
      scope: 'request',
    });
  }
};
