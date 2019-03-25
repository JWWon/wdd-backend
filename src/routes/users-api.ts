import { createController } from 'awilix-koa';
import AWS from 'aws-sdk';
import { hash } from 'bcrypt';
import { NotFound } from 'fejl';
import nodemailer from 'nodemailer';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import { hashPassword, User as Class } from '../models/user';

type UserInterface = ClassInstance<
  Class,
  | 'serialize'
  | 'updateLoginStamp'
  | 'checkPassword'
  | 'createDog'
  | 'updateDog'
  | 'deleteDog'
>;

const api = ({ User }: Model) => ({
  signIn: async (ctx: Context<{ email: string; password: string }>) => {
    const { body } = ctx.request;
    hasParams(['email', 'password'], body);
    const user = await User.findByEmail(body.email);
    if (!user) return;

    await user.checkPassword(body.password);
    await user.updateLoginStamp();
    return ctx.ok(user.serialize());
  },
  signUp: async (
    ctx: Context<{ email: string; password: string; name: string }>
  ) => {
    const { body } = ctx.request;
    hasParams(['email', 'password', 'name'], body);
    await User.checkExist(body);
    body.password = await hashPassword(body.password);
    const user = await User.create(body);
    return ctx.created(user.serialize());
  },
  forgotPassword: async (ctx: Context<{ email: string }>) => {
    const { body } = ctx.request;
    hasParams(['email'], body);
    const user = await User.findByEmail(body.email);
    if (!user) return;

    const { token, email } = user.serialize();
    const transporter = nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2012-10-17', region: 'us-west-2' }),
    });
    await transporter.sendMail({
      from: 'no-reply@woodongdang.com',
      to: email,
      subject: '[우리동네댕댕이] 비밀번호 변경을 위해 이메일을 확인해주세요',
      html: `<a href="woodongdang://session/forgot-password/change-password/${token}">이메일 인증하기</a>`,
    });
    return ctx.ok({ email });
  },
  get: async (ctx: Context) => {
    await ctx.user.updateLoginStamp();
    return ctx.ok(ctx.user.serialize());
  },
  update: async (ctx: Context<UserInterface>) => {
    const { body } = ctx.request;
    if ('password' in body) body.password = await hash(body.password, 10);
    ctx.user = Object.assign(ctx.user, body);
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(ctx.user.serialize());
  },
  selectDog: async (ctx: Context<null, null, { dog_id: string }>) => {
    let foundDog: boolean = false;
    for (const id in ctx.user.dogs) {
      const selectThis = ctx.params.dog_id === id;
      if (selectThis) foundDog = true;
      ctx.user.dogs[id] = { ...ctx.user.dogs[id], default: selectThis };
    }
    NotFound.assert(foundDog, '댕댕이를 찾을 수 없습니다.');
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(await ctx.user.serialize());
  },
  delete: async (ctx: Context) => {
    ctx.user.status = 'TERMINATED';
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.noContent({ message: 'User Terminated' });
  },
});

export default createController(api)
  .post('/signin', 'signIn')
  .post('/signup', 'signUp')
  .post('/forgot-password', 'forgotPassword')
  .get('/user', 'get', { before: [loadUser] })
  .patch('/user', 'update', { before: [loadUser] })
  .patch('/user/:dog_id', 'selectDog', { before: [loadUser] })
  .delete('/user', 'delete', { before: [loadUser] });
