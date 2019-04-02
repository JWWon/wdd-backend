import { createController } from 'awilix-koa';
import { findKey } from 'lodash';
import { Context } from '../interfaces/context';
import { ClassInstance, Model } from '../interfaces/model';
import { hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import { Feed as Class } from '../models/feed';

type Instance = ClassInstance<Class>;

interface Search {
  user?: string;
}

const api = ({ Feed }: Model) => ({
  create: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    hasParams(
      ['pins', 'seconds', 'distance', 'steps', 'pees', 'poos', 'images'],
      body
    );
    body.user = ctx.user._id;
    body.dog = findKey(ctx.user.dogs, dog => dog.default) as any;
    return ctx.created(await Feed.create(body));
  },
  get: async (ctx: Context<null, Search>) => {
    const { query: q } = ctx.request;
    const query: { [key: string]: any } = {};
    if (q.user) query.user = q.user;
    const feeds: Instance[] = await Feed.find(query).lean();
    return ctx.ok(feeds);
  },
});

export default createController(api)
  .prefix('/feeds')
  .post('', 'create', { before: [loadUser] })
  .get('', 'get');
