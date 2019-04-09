import { createController } from 'awilix-koa';
import mongoose from 'mongoose';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { excludeParams, hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import { Feed as Class } from '../models/feed';

type Instance = PureInstance<Class>;

interface Search {
  dogs?: string;
  feeds?: string;
}

const api = ({ Feed, Dog }: Model) => ({
  create: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    hasParams(
      ['pins', 'seconds', 'distance', 'steps', 'pees', 'poos', 'images'],
      body
    );
    excludeParams(body, ['createdAt']);
    const feed = await Feed.create({
      ...body,
      user: ctx.user._id,
      dog: ctx.user.repDog,
    });
    // update Dog
    const dog = await Dog.findById(ctx.user.repDog._id);
    if (!dog) return ctx.notFound('댕댕이를 찾을 수 없습니다.');
    dog.feeds.push(feed._id);
    await dog.save();
    // update User
    ctx.user.repDog = dog;
    await ctx.user.save();
    return ctx.created(feed);
  },
  get: async (ctx: Context<null, Search>) => {
    const { query: q } = ctx.request;
    const query: { [key: string]: any } = {};
    if (q.dogs) {
      const dogs: string[] = JSON.parse(q.dogs);
      query['dog._id'] = {
        $in: dogs.map(dog => mongoose.Types.ObjectId(dog)),
      };
    }
    if (q.feeds) {
      const feeds: string[] = JSON.parse(q.feeds);
      query._id = { $in: feeds.map(feed => mongoose.Types.ObjectId(feed)) };
    }
    const feeds: Instance[] = await Feed.find(query)
      .sort('-createdAt')
      .lean();
    return ctx.ok(feeds);
  },
});

export default createController(api)
  .prefix('/feeds')
  .post('', 'create', { before: [loadUser] })
  .get('', 'get');
