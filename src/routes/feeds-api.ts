import { createController } from 'awilix-koa';
import { Conflict, NotFound } from 'fejl';
import { find, findIndex } from 'lodash';
import moment from 'moment';
import mongoose from 'mongoose';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { excludeParams, hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import Table, { Feed as Class } from '../models/feed';

type Instance = PureInstance<Class>;

interface Search {
  dogs?: string;
  feeds?: string;
}

// middleware
async function loadFeed(ctx: Context<null, null, { id: string }>, next: any) {
  const feed = await Table.findById(ctx.params.id);
  NotFound.assert(feed, '피드를 찾을 수 없습니다.');
  if (!feed) return;
  ctx.state.feed = feed;
  await next();
}

const api = ({ Feed, Dog }: Model) => ({
  create: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    hasParams(['seconds', 'distance', 'steps', 'pees', 'poos', 'images'], body);
    excludeParams(body, ['createdAt']);
    if (!ctx.user.repDog) {
      return ctx.badRequest('등록되어있는 댕댕이가 없습니다.');
    }
    const feed = await Feed.create({
      ...body,
      user: ctx.user._id,
      dog: ctx.user.repDog,
    });
    // update Dog
    const dog = await Dog.findById(ctx.user.repDog._id);
    if (!dog) return ctx.notFound('댕댕이를 찾을 수 없습니다.');
    dog.feeds.push(feed._id);
    dog.markModified('feeds');
    // update dog's history
    const yearMonth = moment(feed.createdAt).format('YYYY년 MM월');
    if (
      dog.histories.length === 0 ||
      dog.histories[0].yearMonth !== yearMonth
    ) {
      dog.histories = [
        {
          yearMonth,
          count: 0,
          seconds: 0,
          steps: 0,
          distance: 0,
          pees: 0,
          poos: 0,
        },
        ...dog.histories,
      ];
    }
    dog.histories[0].count += 1;
    dog.histories[0].seconds += body.seconds;
    dog.histories[0].distance += body.distance;
    dog.histories[0].steps += body.steps;
    dog.histories[0].pees += body.pees;
    dog.histories[0].poos += body.poos;
    dog.markModified('histories');
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
  delete: async (ctx: Context) => {
    if (ctx.user.repDog) {
      const index = findIndex(ctx.user.repDog.feeds, feed =>
        ctx.state.feed._id.equals(feed)
      );
      ctx.user.repDog.feeds.splice(index, 1);
      ctx.user.markModified('repDog');
      await ctx.user.save();
    }
    await ctx.state.feed.remove();
    return ctx.noContent({ message: 'Feed removed' });
  },
  like: async (ctx: Context) => {
    const { feed } = ctx.state;
    Conflict.assert(
      find(feed.likes, like => ctx.user._id.equals(like.user)) === undefined,
      '이미 좋아요를 눌렀습니다.'
    );
    feed.likes.push({ user: ctx.user._id, createdAt: new Date() });
    feed.markModified('likes');
    return ctx.ok(await feed.save({ validateBeforeSave: true }));
  },
  unLike: async (ctx: Context) => {
    const { feed } = ctx.state;
    const index = findIndex(feed.likes, like => ctx.user._id.equals(like.user));
    NotFound.assert(index > -1, '좋아요를 누르지 않았습니다.');
    feed.likes.splice(index, 1);
    feed.markModified('likes');
    return ctx.ok(await feed.save({ validateBeforeSave: true }));
  },
});

export default createController(api)
  .prefix('/feeds')
  .post('', 'create', { before: [loadUser] })
  .get('', 'get')
  .delete('/:id', 'delete', { before: [loadUser, loadFeed] })
  .patch('/:id/like', 'like', { before: [loadUser, loadFeed] })
  .delete('/:id/like', 'unLike', { before: [loadUser, loadFeed] });
