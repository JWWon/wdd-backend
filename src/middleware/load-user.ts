import { Forbidden, NotAcceptable, NotAuthenticated } from 'fejl';
import jwt from 'jsonwebtoken';
import { Context } from 'koa-respond';
import { Schema } from 'mongoose';
import env from '../lib/env';
import User from '../models/user';

interface Headers {
  headers: { authorization: string };
}

interface Token {
  _id: Schema.Types.ObjectId;
  email: string;
}

export const loadUser = async (ctx: Context, next: any) => {
  const { headers }: Headers = ctx.request;
  const token = headers && headers.authorization;
  if (!token) NotAuthenticated.assert(ctx.user, '헤더에 토큰이 없습니다.');
  const { _id } = jwt.verify(token, env.SECRET) as Token;

  ctx.user = await User.findById(_id);
  Forbidden.assert(ctx.user, '유효하지 않은 토큰입니다.');
  NotAcceptable.assert(ctx.user.status === 'ACTIVE', '계정이 휴면상태입니다.');
  await next();
};
