import { createController } from 'awilix-koa';
import AWS from 'aws-sdk';
import { hash } from 'bcrypt';
import nodemailer from 'nodemailer';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { excludeParams, hasParams } from '../lib/check-params';
import { calcDistance, queryLocation, strToCoord } from '../lib/helper';
import { loadUser } from '../middleware/load-user';
import { hashPassword, User as Class } from '../models/user';

type Instance = PureInstance<
  Class,
  'serialize' | 'updateLoginStamp' | 'checkPassword' | 'addDog' | 'updateDog'
>;

interface UserWithDist extends Instance {
  distance: number;
}

interface Search {
  location: string;
}

const api = ({ User }: Model) => ({
  signIn: async (ctx: Context<{ email: string; password: string }>) => {
    const { body } = ctx.request;
    hasParams(['email', 'password'], body);
    const user = await User.findOne({ email: body.email });
    if (!user) return ctx.notFound('존재하지 않는 계정입니다.');

    await user.checkPassword(body.password);
    await user.updateLoginStamp();
    return ctx.ok(user.serialize());
  },
  signUp: async (
    ctx: Context<{ email: string; password: string; name: string }>
  ) => {
    const { body } = ctx.request;
    hasParams(['email', 'password', 'name'], body);
    excludeParams(body, ['lastLogin', 'createdAt', 'repDog', 'dogs']);
    await User.checkExist(body);
    body.password = await hashPassword(body.password);
    const user = await User.create(body);
    return ctx.created(user.serialize());
  },
  forgotPassword: async (ctx: Context<{ email: string }>) => {
    const { body } = ctx.request;
    hasParams(['email'], body);
    const user = await User.findOne({ email: body.email });
    if (!user) return ctx.notFound('존재하지 않는 계정입니다.');

    const { token, email } = user.serialize();
    const transporter = nodemailer.createTransport({
      SES: new AWS.SES({ apiVersion: '2012-10-17', region: 'us-west-2' }),
    });
    await transporter.sendMail({
      from: 'no-reply@woodongdang.com',
      to: email,
      subject: '[우리동네댕댕이] 비밀번호 변경을 위해 이메일을 인증해주세요',
      html: `<a href="woodongdang://session/forgot-password/change-password/${token}">이메일 인증하기</a>`,
    });
    return ctx.ok({ email });
  },
  get: async (ctx: Context) => {
    await ctx.user.updateLoginStamp();
    return ctx.ok(ctx.user.serialize());
  },
  update: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    excludeParams(body, ['lastLogin', 'createdAt', 'repDog', 'dogs', 'places']);
    if ('password' in body) body.password = await hash(body.password, 10);
    ctx.user = Object.assign(ctx.user, body);
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(ctx.user.serialize());
  },
  delete: async (ctx: Context) => {
    ctx.user.status = 'TERMINATED';
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.noContent({ message: 'User Terminated' });
  },
  search: async (ctx: Context<null, Search>) => {
    const { query } = ctx.request;
    hasParams(['location'], query);
    const users: Instance[] = await User.find({
      location: queryLocation(strToCoord(query.location)),
      repDog: { $exists: true },
    })
      .sort('-lastLogin')
      .lean();
    const usersWithDist: UserWithDist[] = users.map(user => ({
      ...user,
      distance: calcDistance(
        strToCoord(query.location),
        user.location.coordinates
      ),
    }));
    return ctx.ok(usersWithDist);
  },
});

export default createController(api)
  .post('/signin', 'signIn')
  .post('/signup', 'signUp')
  .post('/forgot-password', 'forgotPassword')
  .get('/user', 'get', { before: [loadUser] })
  .patch('/user', 'update', { before: [loadUser] })
  .delete('/user', 'delete', { before: [loadUser] })
  .get('/user/search', 'search');
