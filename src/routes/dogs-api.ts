import { createController } from 'awilix-koa';
import { Forbidden, NotFound } from 'fejl';
import { InstanceType } from 'typegoose';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { excludeParams, hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import Table, { Dog as Class } from '../models/dog';

type Instance = PureInstance<Class>;

interface Params {
  id: string;
}

// middleware
async function loadDog(ctx: Context<null, null, Params>, next: any) {
  const dog = await Table.findById(ctx.params.id);
  NotFound.assert(dog, '댕댕이를 찾을 수 없습니다.');
  ctx.state.dog = dog;
  await next();
}

const api = ({ Dog }: Model) => ({
  getAll: async (ctx: Context) => {
    return ctx.ok(await Dog.find({ user: ctx.user._id }));
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
  get: async (ctx: Context<null, null, Params>) => {
    return ctx.ok(ctx.state.dog);
  },
  update: async (ctx: Context<Instance, null, Params>) => {
    const { body } = ctx.request;
    excludeParams(body, ['user']);
    const updateDog = await Object.assign(ctx.state.dog, body).save({
      validateBeforeSave: true,
    });
    await ctx.user.updateDog(updateDog);
    return ctx.ok(updateDog);
  },
  selectRep: async (ctx: Context<null, null, { id: string }>) => {
    /* User 인스턴스의 'repDog'값 수정 */
    ctx.user.repDog = ctx.state.dog;
    ctx.user.markModified('repDog');
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(ctx.state.dog);
  },
  delete: async (ctx: Context<null, null, Params>) => {
    delete ctx.user.dogs[ctx.state.dog._id];
    if (ctx.user.repDog._id === ctx.params.id) {
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
  pushLike: async (ctx: Context<null, null, Params>) => {
    const dog = ctx.state.dog as InstanceType<typeof Dog>;
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
    return ctx.ok({ message: '킁킁을 눌렀습니다.' });
  },
});

export default createController(api)
  .prefix('/dogs')
  .before([loadUser])
  .get('', 'getAll')
  .post('', 'create')
  .get('/:id', 'get', { before: [loadDog] })
  .patch('/:id', 'update', { before: [loadDog] })
  .put('/:id', 'selectRep', { before: [loadDog] })
  .delete('/:id', 'delete', { before: [loadDog] })
  .patch('/:id/like', 'pushLike', { before: [loadDog] });
