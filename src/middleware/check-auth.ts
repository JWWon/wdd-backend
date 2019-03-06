import { NotAuthenticated } from 'fejl';
import { Context } from 'koa-respond';

export const checkAuth = (ctx: Context, next: any) => {
  NotAuthenticated.assert(ctx.user, '로그인되어 있지 않습니다.');
  return next();
};
