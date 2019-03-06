import { createController } from 'awilix-koa';
import { Context } from 'koa-respond';
import { Model } from '../interfaces/model';
import { checkAuth } from '../middleware/check-auth';

const api = ({ User }: Model) => ({
  signIn: async (ctx: Context) => {
    /**
     * [POST]
     * body: { email: string, password: string }
     */
    const user = await User.signIn(ctx);
    if (user) return ctx.ok(user);
  },
  signUp: async (ctx: Context) => {
    /**
     * [POST]
     * body: { email: string, password: string, name: string }
     */
    return ctx.created(await User.signUp(ctx));
  },
  forgotPassword: async (ctx: Context) => {
    /**
     * [POST]
     * body: { email: string }
     */
    const user = await User.forgotPassword(ctx);
    if (user) return ctx.ok(user);
  },
  get: async (ctx: Context) => {
    /**
     * [GET]
     * headers: { authorization: token }
     */
    await ctx.user.updateLoginStamp();
    return ctx.ok(ctx.user.serialize());
  },
  update: async (ctx: Context) => {
    /**
     * [PATCH]
     * headers: { authorization: token }
     * body: { ...userSchema }
     */
    return ctx.ok(await ctx.user.update(ctx));
  },
  selectDog: async (ctx: Context) => {
    /**
     * [PATCH]
     * headers: { authorization: token }
     * body: { dog_id: string }
     */
    return ctx.ok(await ctx.user.selectDog(ctx));
  },
  delete: async (ctx: Context) => {
    /**
     * [DELETE]
     * headers: { authorization: token }
     */
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
