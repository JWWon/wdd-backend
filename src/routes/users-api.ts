import { createController } from 'awilix-koa';
import { hash } from 'bcrypt';
import { Context } from '../interfaces/context';
import { Model } from '../interfaces/model';
import { loadUser } from '../middleware/load-user';
import { User as Instance } from '../models/user';

const api = ({ User }: Model) => ({
  signIn: async (ctx: Parameters<typeof User.signIn>[0]) => {
    const user = await User.signIn(ctx);
    if (user) return ctx.ok(user);
    return ctx.notFound({ message: '존재하지 않는 계정입니다.' });
  },
  signUp: async (ctx: Parameters<typeof User.signUp>[0]) => {
    return ctx.created(await User.signUp(ctx));
  },
  forgotPassword: async (ctx: Parameters<typeof User.forgotPassword>[0]) => {
    const user = await User.forgotPassword(ctx);
    if (user) return ctx.ok(user);
    return ctx.notFound({ message: '존재하지 않는 계정입니다.' });
  },
  get: async (ctx: Context<{}>) => {
    await ctx.user.updateLoginStamp();
    return ctx.ok(ctx.user.serialize());
  },
  update: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    if ('password' in body) body.password = await hash(body.password, 10);
    ctx.user = Object.assign(ctx.user, body);
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(await ctx.user.serialize());
  },
  selectDog: async (ctx: Parameters<Instance['selectDog']>[0]) => {
    const user = await ctx.user.selectDog(ctx);
    if (user) return ctx.ok(user);
    return ctx.notFound({ message: '존재하지 않는 댕댕이입니다' });
  },
  delete: async (ctx: Context<{}>) => {
    ctx.user.status = 'TERMINATED';
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.noContent({ message: 'USER TERMINATED' });
  },
});

export default createController(api)
  .post('/signin', 'signIn')
  .post('/signup', 'signUp')
  .post('/forgot-password', 'forgotPassword')
  .get('/user', 'get', { before: [loadUser] })
  .patch('/user', 'update', { before: [loadUser] })
  .patch('/user/dog', 'selectDog', { before: [loadUser] })
  .delete('/user', 'delete', { before: [loadUser] });
