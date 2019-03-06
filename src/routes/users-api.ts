import { createController } from 'awilix-koa';
import { hash } from 'bcrypt';
import { InstanceType } from 'typegoose';
import { Context } from '../interfaces/context';
import { Model } from '../interfaces/model';
import { checkAuth } from '../middleware/check-auth';
import { User as Instance } from '../models/user';

type UserInstance = InstanceType<Instance>;

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
  update: async (ctx: Context<UserInstance>) => {
    const { body } = ctx.request;
    if ('password' in body) body.password = await hash(body.password, 10);
    const user = await User.update({ email: ctx.user.email }, body);
    return ctx.ok(await user.serialize());
  },
  selectDog: async (ctx: Parameters<UserInstance['selectDog']>[0]) => {
    const user = await ctx.user.selectDog(ctx);
    if (user) return ctx.ok(user);
    return ctx.notFound({ message: '존재하지 않는 댕댕이입니다' });
  },
  delete: async (ctx: Context<{}>) => {
    await ctx.user.update({ status: 'TERMINATED' });
    return ctx.noContent({ message: 'USER TERMINATED' });
  },
});

export default createController(api)
  .post('/signin', 'signIn')
  .post('/signup', 'signUp')
  .post('/forgot-password', 'forgotPassword')
  .get('/user', 'get', { before: [checkAuth] })
  .patch('/user', 'update', { before: [checkAuth] })
  .patch('/user/dog', 'selectDog', { before: [checkAuth] })
  .delete('/user', 'delete', { before: [checkAuth] });
