import { createController } from 'awilix-koa';
import { Forbidden, NotFound } from 'fejl';
import mongoose from 'mongoose';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { excludeParams, hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import Table, { Dog as Class } from '../models/dog';

type Instance = PureInstance<Class>;

interface Search {
  dogs?: string;
}

// middleware
async function loadDog(ctx: Context<null, null, { id: string }>, next: any) {
  const dog = await Table.findById(ctx.params.id);
  NotFound.assert(dog, '댕댕이를 찾을 수 없습니다.');
  if (!dog) return;
  ctx.state.dog = dog;
  await next();
}

const api = ({ Dog }: Model) => ({
  search: async (ctx: Context<null, Search>) => {
    const { query: q } = ctx.request;
    const query: { [key: string]: any } = {};
    if (q.dogs) {
      const dogs: string[] = JSON.parse(q.dogs);
      query['dog._id'] = {
        $in: dogs.map(dog => mongoose.Types.ObjectId(dog)),
      };
    }
    return ctx.ok(await Dog.find(query).lean());
  },
  create: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    hasParams(['name', 'breed', 'gender'], body);
    excludeParams(body, ['feeds', 'likes']);
    body.user = ctx.user._id;
    const dog = await Dog.create(body);
    await ctx.user.addDog(dog);
    return ctx.created(dog);
  },
  get: async (ctx: Context) => {
    return ctx.ok(ctx.state.dog);
  },
  update: async (ctx: Context<Instance>) => {
    const { body } = ctx.request;
    excludeParams(body, ['user']);
    const updateDog = await Object.assign(ctx.state.dog, body).save({
      validateBeforeSave: true,
    });
    await ctx.user.updateDog(updateDog);
    return ctx.ok(updateDog);
  },
  selectRep: async (ctx: Context) => {
    /* User 인스턴스의 'repDog'값 수정 */
    ctx.user.repDog = ctx.state.dog;
    ctx.user.markModified('repDog');
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(ctx.state.dog);
  },
  delete: async (ctx: Context) => {
    delete ctx.user.dogs[ctx.state.dog._id];
    if (ctx.user.repDog && ctx.user.repDog._id === ctx.state.dog._id) {
      delete ctx.user.repDog;
      const dogKeys = Object.keys(ctx.user.dogs);
      if (dogKeys.length > 0) {
        const repDog = await Dog.findById(ctx.user.dogs[dogKeys[0]]);
        if (!repDog) return ctx.notFound('댕댕이를 찾을 수 없습니다.');
        ctx.user.repDog = repDog;
      }
    }
    await ctx.user.save();
    await ctx.state.dog.remove();
    return ctx.noContent({ message: 'Dog Terminated' });
  },
  pushLike: async (ctx: Context) => {
    const { dog } = ctx.state;
    if (!ctx.user.repDog) {
      return ctx.badRequest('등록되어있는 댕댕이가 없습니다.');
    }
    const { _id } = ctx.user.repDog;
    // check if user send like on same day
    const likes = dog.likes
      .filter(like => _id.equals(like.dog))
      .sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime());
    if (likes.length > 0) {
      const now = new Date();
      likes[0].createdAt.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      Forbidden.assert(
        likes[0].createdAt.getTime() !== now.getTime(),
        '킁킁은 하루에 한 번만 보낼 수 있습니다.'
      );
    }
    // send like
    dog.likes.push({ dog: _id, createdAt: new Date() });
    dog.markModified('likes');
    await dog.save({ validateBeforeSave: true });
    return ctx.ok({ message: '킁킁을 보냈습니다.' });
  },
});

export default createController(api)
  .prefix('/dogs')
  .before([loadUser])
  .get('', 'search')
  .post('', 'create')
  .get('/:id', 'get', { before: [loadDog] })
  .patch('/:id', 'update', { before: [loadDog] })
  .put('/:id', 'selectRep', { before: [loadDog] })
  .delete('/:id', 'delete', { before: [loadDog] })
  .patch('/:id/like', 'pushLike', { before: [loadDog] });
