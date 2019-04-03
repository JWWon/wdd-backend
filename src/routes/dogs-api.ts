import { createController } from 'awilix-koa';
import { Context } from '../interfaces/context';
import { Model, PureInstance } from '../interfaces/model';
import { excludeParams, hasParams } from '../lib/check-params';
import { loadUser } from '../middleware/load-user';
import { Dog as Class } from '../models/dog';

type DogInterface = PureInstance<Class>;

interface Params {
  id: string;
}

const api = ({ Dog, User }: Model) => ({
  getAll: async (ctx: Context) => {
    return ctx.ok(await Dog.find({ user: ctx.user._id }));
  },
  create: async (ctx: Context<DogInterface>) => {
    const { body } = ctx.request;
    hasParams(['name', 'breed', 'gender'], body);
    excludeParams(body, ['feeds', 'likes']);
    body.user = ctx.user._id;
    const dog = await Dog.create(body);
    await ctx.user.addDog(dog);
    return ctx.created(dog);
  },
  get: async (ctx: Context<null, null, Params>) => {
    const dog = await Dog.findById(ctx.params.id);
    if (!dog) return ctx.notFound('댕댕이를 찾을 수 없습니다.');
    return ctx.ok(dog);
  },
  update: async (ctx: Context<DogInterface, null, Params>) => {
    const { body } = ctx.request;
    excludeParams(body, ['user']);
    const dog = await Dog.findById(ctx.params.id);
    if (!dog) return ctx.notFound('댕댕이를 찾을 수 없습니다.');
    const updateDog = await Object.assign(dog, body).save({
      validateBeforeSave: true,
    });
    await ctx.user.updateDog(updateDog);
    return ctx.ok(updateDog);
  },
  selectRep: async (ctx: Context<null, null, { id: string }>) => {
    /* User 인스턴스의 'repDog'값 수정 */
    const dog = await Dog.findById(ctx.params.id);
    if (!dog) return ctx.notFound('댕댕이를 찾을 수 없습니다.');
    ctx.user.repDog = dog;
    ctx.user.markModified('repDog');
    await ctx.user.save({ validateBeforeSave: true });
    return ctx.ok(dog);
  },
  delete: async (ctx: Context<null, null, Params>) => {
    const dog = await Dog.findById(ctx.params.id);
    if (!dog) return ctx.notFound('댕댕이를 찾을 수 없습니다.');
    delete ctx.user.dogs[dog._id];
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
    await dog.remove();
    return ctx.noContent({ message: 'Dog Terminated' });
  },
});

export default createController(api)
  .prefix('/dogs')
  .before([loadUser])
  .get('', 'getAll')
  .post('', 'create')
  .get('/:id', 'get')
  .patch('/:id', 'update')
  .put('/:id', 'selectRep')
  .delete('/:id', 'delete');
